import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, AlertCircle,
  Play, Send, RefreshCw, Calendar, Sparkles, User, Bot,
  Award, FileText, FastForward, Activity, ShieldCheck
} from 'lucide-react';
import { Lead, ConversationMessage, CallSession, SystemPromptConfig, DemoBooking } from '../types';

interface CallInterfaceProps {
  selectedLead: Lead;
  systemConfig: SystemPromptConfig;
  onCallEnded: (session: CallSession, analysis?: any) => void;
  onDemoBooked: (booking: DemoBooking) => void;
  isCallActive: boolean;
  setIsCallActive: (active: boolean) => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  selectedLead,
  systemConfig,
  onCallEnded,
  onDemoBooked,
  isCallActive,
  setIsCallActive
}) => {
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [interruptedNotice, setInterruptedNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [voiceSource, setVoiceSource] = useState<'gemini_tts' | 'browser_tts'>('gemini_tts');
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Web Speech Recognition if supported
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setUserInput(transcript);

        // Auto interrupt AI if user speaks while AI is speaking
        if (isAiSpeaking && transcript.length > 3) {
          handleInterrupt();
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [isAiSpeaking]);

  // Duration Timer
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  // Visualizer Animation effect when AI speaks
  useEffect(() => {
    let animInterval: NodeJS.Timeout;
    if (isAiSpeaking) {
      animInterval = setInterval(() => {
        setAiAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 100);
    } else {
      setAiAudioLevel(0);
    }
    return () => clearInterval(animInterval);
  }, [isAiSpeaking]);

  // Start Call Handler
  const startCall = async () => {
    setIsCallActive(true);
    setCallDuration(0);
    setLastAnalysis(null);

    const newSession: CallSession = {
      id: `call-${Date.now()}`,
      leadId: selectedLead.id,
      customerName: selectedLead.name,
      companyName: selectedLead.company,
      phone: selectedLead.phone,
      startTime: new Date().toLocaleTimeString(),
      durationSeconds: 0,
      status: 'connected',
      messages: [],
      isMuted: false,
      speakerOn: true,
      interruptedCount: 0,
      aiPhase: 'Greeting'
    };

    setCallSession(newSession);

    // Initial SIYA Greeting turn
    await sendTurnToAi(newSession, '', false, false);
  };

  // End Call Handler
  const endCall = async () => {
    // Stop all audio & speech
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setIsListening(false);
    setIsCallActive(false);

    if (callSession) {
      const endedSession: CallSession = {
        ...callSession,
        status: 'ended',
        endTime: new Date().toLocaleTimeString(),
        durationSeconds: callDuration
      };

      setCallSession(endedSession);

      // Perform Call Analysis via server
      setIsLoading(true);
      try {
        const response = await fetch('/api/call/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: selectedLead.name,
            company: selectedLead.company,
            transcript: endedSession.messages
          })
        });

        const data = await response.json();
        if (data.success && data.analysis) {
          setLastAnalysis(data.analysis);
          onCallEnded(endedSession, data.analysis);
        } else {
          onCallEnded(endedSession);
        }
      } catch (err) {
        console.error('Call analysis error:', err);
        onCallEnded(endedSession);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Interrupt SIYA Handler
  const handleInterrupt = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setInterruptedNotice(true);
    setTimeout(() => setInterruptedNotice(false), 3000);

    if (callSession) {
      setCallSession((prev) =>
        prev ? { ...prev, interruptedCount: prev.interruptedCount + 1 } : null
      );
    }
  };

  // Send turn to Gemini AI engine
  const sendTurnToAi = async (
    currentSession: CallSession,
    userText: string,
    wasInterrupted: boolean = false,
    useAudio: boolean = true
  ) => {
    setIsLoading(true);

    const historyForApi = currentSession.messages.map((m) => ({
      role: m.role,
      text: m.text
    }));

    let updatedMessages = [...currentSession.messages];

    if (userText) {
      const userMsg: ConversationMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString(),
        interrupted: wasInterrupted
      };
      updatedMessages.push(userMsg);
    }

    try {
      const res = await fetch('/api/call/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: selectedLead.name,
          companyName: systemConfig.companyName,
          history: historyForApi,
          userSpeech: userText,
          customPrompt: systemConfig.customSystemPrompt,
          interrupted: wasInterrupted,
          generateAudio: useAudio
        })
      });

      const data = await res.json();

      if (data.success && data.responseText) {
        const aiMsg: ConversationMessage = {
          id: `msg-${Date.now()}-ai`,
          role: 'model',
          text: data.responseText,
          timestamp: new Date().toLocaleTimeString(),
          audioUrl: data.audioBase64 ? `data:audio/mp3;base64,${data.audioBase64}` : undefined
        };

        updatedMessages.push(aiMsg);

        const newPhase = data.aiPhase || currentSession.aiPhase;
        const updatedSession: CallSession = {
          ...currentSession,
          messages: updatedMessages,
          aiPhase: newPhase
        };

        setCallSession(updatedSession);

        // Check if demo was booked
        if (data.isDemoBooked) {
          const booking: DemoBooking = {
            id: `demo-${Date.now()}`,
            customerName: selectedLead.name,
            companyName: selectedLead.company,
            phone: selectedLead.phone,
            demoDate: data.demoDate || 'Tomorrow',
            demoTime: data.demoTime || '11:00 AM',
            interestedServices: systemConfig.services,
            status: 'Confirmed',
            assignedExpert: 'Rohan Gupta (Senior Consultant)',
            bookedAt: new Date().toLocaleString(),
            notes: `Booked by SIYA. Sentiment: ${data.sentiment || 'Interested'}.`
          };
          onDemoBooked(booking);
        }

        // Play Spoken Voice
        if (speakerOn && !isMuted) {
          playSiyaSpeech(data.responseText, data.audioBase64);
        }
      }
    } catch (error) {
      console.error('Error talking to SIYA engine:', error);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  // Play SIYA Speech via Gemini TTS or SpeechSynthesis
  const playSiyaSpeech = (text: string, base64Audio?: string) => {
    setIsAiSpeaking(true);

    if (base64Audio && voiceSource === 'gemini_tts') {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audioRef.current = audio;

        audio.onended = () => {
          setIsAiSpeaking(false);
        };
        audio.onerror = () => {
          console.warn('Gemini audio playback error, falling back to Web Speech Synthesis');
          fallbackWebSpeech(text);
        };

        audio.play().catch((e) => {
          console.warn('Audio play autoplay restriction, using Web Speech:', e);
          fallbackWebSpeech(text);
        });
        return;
      } catch (err) {
        console.warn('Base64 audio setup failed:', err);
      }
    }

    fallbackWebSpeech(text);
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Slightly higher polite female pitch

      // Try finding female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Zira'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(false);
    }
  };

  // User Send Message Form Submit
  const handleUserSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || !callSession || isLoading) return;

    const textToSend = userInput.trim();
    setUserInput('');

    // If AI is currently speaking and user submits, count as interruption
    const userInterrupted = isAiSpeaking;
    if (userInterrupted) {
      handleInterrupt();
    }

    sendTurnToAi(callSession, textToSend, userInterrupted, true);
  };

  // Quick Objection Simulator Button Handler
  const triggerObjection = (objectionText: string) => {
    if (!callSession || isLoading) return;
    setUserInput(objectionText);
    const userInterrupted = isAiSpeaking;
    if (userInterrupted) {
      handleInterrupt();
    }
    sendTurnToAi(callSession, objectionText, userInterrupted, true);
  };

  // Mic Listen Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use the text input box below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner / Customer Info Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            {selectedLead.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold tracking-tight">{selectedLead.name}</h2>
              <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                {selectedLead.company}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedLead.phone} • {selectedLead.industry} • Current: <span className="text-slate-200">{selectedLead.currentSoftware}</span>
            </p>
          </div>
        </div>

        {/* Call Trigger or Duration Indicator */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {isCallActive ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{formatTime(callDuration)}</span>
              </div>
              <button
                onClick={endCall}
                className="flex items-center space-x-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-red-900/30 transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>TERMINATE CALL</span>
              </button>
            </div>
          ) : (
            <button
              onClick={startCall}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all disabled:opacity-50"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>START CALL AS SIYA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Transcript & Context Engine */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex-grow flex flex-col h-[340px]">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Live Transcript</span>
              <span className="text-[10px] font-mono text-slate-600">{callSession?.messages.length || 0} MSGS</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!callSession || callSession.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                  <Bot className="w-8 h-8 text-slate-700" />
                  <p className="text-xs">Ready to initiate live session with {selectedLead.name}.</p>
                </div>
              ) : (
                callSession.messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className="flex gap-3">
                      <div className={`text-[10px] font-mono mt-1 ${isUser ? 'text-slate-500' : 'text-indigo-400'}`}>
                        {isUser ? 'USER' : 'SIYA'}
                      </div>
                      <p className={`text-xs leading-relaxed p-3 ${
                        isUser
                          ? 'text-slate-400 italic border border-slate-800 rounded-tl-xl rounded-bl-xl rounded-br-xl'
                          : 'text-slate-200 bg-indigo-500/10 rounded-tr-xl rounded-bl-xl rounded-br-xl'
                      }`}>
                        "{msg.text}"
                      </p>
                    </div>
                  );
                })
              )}
              {isLoading && (
                <div className="flex items-center space-x-2 text-indigo-400 text-xs py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="font-mono text-[11px]">Generating response...</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Context Engine</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-slate-800 px-3 py-1 rounded-md text-[11px] font-medium border border-slate-700 text-slate-300">
                Sentiment: Neutral
              </span>
              <span className="bg-slate-800 px-3 py-1 rounded-md text-[11px] font-medium border border-slate-700 text-slate-300">
                Phase: {callSession?.aiPhase || 'Idle'}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md text-[11px] font-medium border border-emerald-500/20 font-mono">
                Confidence: 98%
              </span>
            </div>
          </div>
        </div>

        {/* Center Column: Audio Waveform Visualization Stage */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[460px]">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
              Streaming Audio Layer • 128kbps
            </span>
          </div>

          <div className="relative flex items-center justify-center my-8">
            {/* Circular Waveform Visual */}
            <div className={`w-64 h-64 rounded-full border border-indigo-500/20 flex items-center justify-center transition-all ${isAiSpeaking ? 'scale-105 border-indigo-500/40' : ''}`}>
              <div className="w-48 h-48 rounded-full border border-indigo-500/40 flex items-center justify-center">
                <div className={`w-32 h-32 rounded-full bg-indigo-600/20 flex items-center justify-center ${isAiSpeaking ? 'animate-pulse bg-indigo-600/40' : ''}`}>
                  <div className="w-12 h-12 bg-indigo-500 rounded-full blur-xl"></div>
                </div>
              </div>
            </div>

            {/* Pulsing audio bars overlay */}
            <div className="absolute flex items-end gap-1.5 h-24">
              {[40, 70, 30, 90, 50, 80, 20, 60, 100, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-indigo-400 transition-all duration-150 rounded-full"
                  style={{
                    height: isAiSpeaking ? `${Math.max(8, (aiAudioLevel * h) / 100)}px` : '12px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase">Current Speaker</p>
            <p className="text-2xl font-light italic text-white">
              {isAiSpeaking ? 'Siya Assistant (Speaking...)' : isCallActive ? 'Listening to Client...' : 'Siya Voice Engine Idle'}
            </p>
          </div>

          {/* Quick Input Bar inside Stage */}
          <form onSubmit={handleUserSendMessage} className="w-full max-w-md mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full border transition-all ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type user message or objection..."
              disabled={!isCallActive || isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isCallActive || !userInput.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Performance & Tech Health */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Campaign Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Appointments Booked</p>
                <p className="text-3xl font-light tracking-tight text-white">14 <span className="text-xs text-emerald-400">+3 today</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Total Calls</p>
                  <p className="text-lg font-medium text-white">1,248</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider">Success Rate</p>
                  <p className="text-lg font-medium text-indigo-400">12.4%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex-grow space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tech Stack Health</h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Gemini 3.6 Flash</span>
                  <span className="text-emerald-400 font-mono text-[11px]">240ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-[95%] h-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Deepgram STT</span>
                  <span className="text-emerald-400 font-mono text-[11px]">180ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 w-[98%] h-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">ElevenLabs / Gemini TTS</span>
                  <span className="text-amber-400 font-mono text-[11px]">380ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 w-[75%] h-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Objections Simulator */}
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Test Objections
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => triggerObjection("I am extremely busy right now, call later!")}
                disabled={!isCallActive || isLoading}
                className="text-left text-[11px] p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all disabled:opacity-40"
              >
                🕒 "I am busy right now"
              </button>
              <button
                onClick={() => triggerObjection("We are already using Tally software.")}
                disabled={!isCallActive || isLoading}
                className="text-left text-[11px] p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all disabled:opacity-40"
              >
                💼 "We already use software"
              </button>
            </div>
          </div>
        </div>

        {/* Call Analysis Card (When Call Ends) */}
        {lastAnalysis && (
          <div className="lg:col-span-12 bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">AI Call Analysis Report</h3>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lastAnalysis.outcome}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Lead Interest Score:</span>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{lastAnalysis.interestScore}%</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Recommended Next Action:</span>
                <div className="text-slate-200 font-medium mt-0.5">{lastAnalysis.recommendedNextAction}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Call Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{lastAnalysis.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
