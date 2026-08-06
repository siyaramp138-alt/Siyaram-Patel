import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, FastForward, Rewind, Volume2, VolumeX,
  FileText, Download, Copy, Check, Sparkles, Calendar, Clock,
  Award, Globe, Headphones, User, Bot, RefreshCw, ChevronRight
} from 'lucide-react';
import { CallRecording, INITIAL_RECORDINGS } from '../data/initialRecordings';
import { Lead, SupportedLanguage } from '../types';
import { LANGUAGE_METADATA } from '../data/languagePrompts';

interface CallAudioPlayerProps {
  selectedLead: Lead;
  pastSessions?: any[];
  onSelectLeadToCall?: (lead: Lead) => void;
}

export const CallAudioPlayer: React.FC<CallAudioPlayerProps> = ({
  selectedLead,
  pastSessions = [],
  onSelectLeadToCall
}) => {
  const [recordings, setRecordings] = useState<CallRecording[]>(INITIAL_RECORDINGS);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string>(
    INITIAL_RECORDINGS.find((r) => r.leadId === selectedLead.id)?.id || INITIAL_RECORDINGS[0].id
  );
  const [filterByCurrentLead, setFilterByCurrentLead] = useState<boolean>(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Active message index for transcript syncing
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Find active recording
  const activeRecording = recordings.find((r) => r.id === selectedRecordingId) || recordings[0];

  // Update selected recording if lead changes
  useEffect(() => {
    const matchingRec = recordings.find((r) => r.leadId === selectedLead.id);
    if (matchingRec) {
      setSelectedRecordingId(matchingRec.id);
      stopPlayback();
    }
  }, [selectedLead]);

  // Handle Playback Loop Timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 1000 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= activeRecording.durationSeconds) {
            stopPlayback();
            return activeRecording.durationSeconds;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, activeRecording.durationSeconds]);

  // Synchronize transcript active turn based on currentTime
  useEffect(() => {
    if (!activeRecording.messages || activeRecording.messages.length === 0) return;

    let currentMsg = activeRecording.messages[0];
    for (const msg of activeRecording.messages) {
      if (currentTime >= msg.timestampSeconds) {
        currentMsg = msg;
      } else {
        break;
      }
    }
    setActiveMessageId(currentMsg.id);

    // Speak audio turn if playing
    if (isPlaying && window.speechSynthesis) {
      // Speak current msg if new msg triggered
    }
  }, [currentTime, activeRecording, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentTime);
    }
  };

  const startPlayback = (startTimeSeconds: number = 0) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(true);
    setCurrentTime(startTimeSeconds);

    // Find message to speak
    const msgToSpeak = activeRecording.messages.find(
      (m) => m.timestampSeconds >= startTimeSeconds
    ) || activeRecording.messages[0];

    if (msgToSpeak && window.speechSynthesis) {
      speakMessage(msgToSpeak.text, activeRecording.language);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const speakMessage = (text: string, language: SupportedLanguage) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.volume = isMuted ? 0 : volume;
    utterance.lang = LANGUAGE_METADATA[language]?.bcp47 || 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice =
      voices.find((v) => v.lang.startsWith(LANGUAGE_METADATA[language]?.bcp47.split('-')[0])) ||
      voices[0];
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      // When message ends, speak next if still playing
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, activeRecording.durationSeconds));
    setCurrentTime(clamped);
    if (isPlaying) {
      startPlayback(clamped);
    }
  };

  const handleSeekMessage = (msg: { timestampSeconds: number; text: string }) => {
    handleSeek(msg.timestampSeconds);
    if (window.speechSynthesis && isPlaying) {
      speakMessage(msg.text, activeRecording.language);
    }
  };

  const handleJump = (deltaSeconds: number) => {
    handleSeek(currentTime + deltaSeconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    const transcriptText = activeRecording.messages
      .map((m) => `[${m.timestamp}] ${m.role === 'model' ? 'SIYA' : activeRecording.customerName}: ${m.text}`)
      .join('\n');

    navigator.clipboard.writeText(transcriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const transcriptText = `GROW BUSINESS SOLUTIONS - CALL RECORDING TRANSCRIPT
Client: ${activeRecording.customerName} (${activeRecording.companyName})
Phone: ${activeRecording.phone}
Date: ${activeRecording.recordedAt}
Language: ${activeRecording.language}
Duration: ${formatTime(activeRecording.durationSeconds)}
Outcome: ${activeRecording.outcome}
Summary: ${activeRecording.summary}

-------------------- TRANSCRIPT LOG --------------------
${activeRecording.messages
  .map((m) => `[${m.timestamp}] ${m.role === 'model' ? 'SIYA (AI Telecaller)' : activeRecording.customerName}: ${m.text}`)
  .join('\n\n')}
`;

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcript-${activeRecording.customerName.replace(/\s+/g, '_')}-${activeRecording.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered recordings list
  const filteredRecordings = filterByCurrentLead
    ? recordings.filter((r) => r.leadId === selectedLead.id)
    : recordings;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-white">
      {/* Top Title & Recording Selector Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              <span>Call Recording Player</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                HD Audio
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Listen to AI telecalling sessions for {selectedLead.name} ({selectedLead.company})
            </p>
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterByCurrentLead(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterByCurrentLead
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {selectedLead.name}'s Calls ({recordings.filter((r) => r.leadId === selectedLead.id).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterByCurrentLead(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filterByCurrentLead
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Call History ({recordings.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Player Console vs Interactive Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Main Audio Player Console */}
        <div className="lg:col-span-7 space-y-5">
          {/* Recording Selector Bar if multiple available */}
          {filteredRecordings.length > 0 ? (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {filteredRecordings.map((rec) => {
                const isSelected = rec.id === activeRecording.id;
                const langMeta = LANGUAGE_METADATA[rec.language] || LANGUAGE_METADATA.English;
                return (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedRecordingId(rec.id);
                      stopPlayback();
                      setCurrentTime(0);
                    }}
                    className={`flex-shrink-0 text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/50 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{rec.recordedAt}</span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                        {langMeta.flag} {rec.language}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 space-x-3">
                      <span>{rec.customerName}</span>
                      <span className="font-mono text-indigo-300 font-medium">
                        {formatTime(rec.durationSeconds)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              No recorded call history found for {selectedLead.name}. Initiate a live call above to record a new session!
            </div>
          )}

          {/* Audio Player Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-xl">
            {/* Ambient Animated Glow when playing */}
            {isPlaying && (
              <div className="absolute inset-0 bg-indigo-500/5 blur-2xl pointer-events-none animate-pulse"></div>
            )}

            {/* Session Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-bold text-white">{activeRecording.customerName}</h4>
                  <span className="text-xs bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full text-slate-300 font-mono">
                    {activeRecording.companyName}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {activeRecording.recordedAt}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-indigo-400">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    {LANGUAGE_METADATA[activeRecording.language]?.flag} {activeRecording.language}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeRecording.outcome}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Score: {activeRecording.interestScore}%
                </span>
              </div>
            </div>

            {/* Waveform Visualization Bars */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-center gap-1 h-20 relative overflow-hidden">
              {/* Audio progress overlay */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-indigo-600/10 transition-all pointer-events-none"
                style={{
                  width: `${(currentTime / (activeRecording.durationSeconds || 1)) * 100}%`
                }}
              ></div>

              {/* Render dynamic equalizer bars */}
              {Array.from({ length: 48 }).map((_, index) => {
                const barProgress = index / 48;
                const isPlayed = currentTime / (activeRecording.durationSeconds || 1) >= barProgress;
                // Height based on sine pattern and message speaker
                const h = Math.floor(Math.sin(index * 0.4) * 28 + 36);

                return (
                  <div
                    key={index}
                    onClick={() => handleSeek(barProgress * activeRecording.durationSeconds)}
                    className={`w-1 rounded-full cursor-pointer transition-all ${
                      isPlayed
                        ? 'bg-indigo-400 shadow-sm shadow-indigo-500/50'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{
                      height: isPlaying
                        ? `${Math.max(12, isPlayed ? (h * (0.8 + Math.random() * 0.4)) : 16)}px`
                        : `${h}px`
                    }}
                  ></div>
                );
              })}
            </div>

            {/* Timeline Scrubber Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={activeRecording.durationSeconds || 100}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500">{formatTime(activeRecording.durationSeconds)}</span>
              </div>
            </div>

            {/* Primary Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {/* Skip Backward */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleJump(-10)}
                  className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                  title="Rewind 10 seconds"
                >
                  <Rewind className="w-4 h-4" />
                  <span className="text-[10px] font-mono">-10s</span>
                </button>

                {/* Main Play / Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all scale-105"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause Session</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      <span>Play Call Audio</span>
                    </>
                  )}
                </button>

                {/* Skip Forward */}
                <button
                  type="button"
                  onClick={() => handleJump(10)}
                  className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                  title="Forward 10 seconds"
                >
                  <FastForward className="w-4 h-4" />
                  <span className="text-[10px] font-mono">+10s</span>
                </button>
              </div>

              {/* Playback Speed Controls */}
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">
                  Speed:
                </span>
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded-xl text-[11px] font-mono font-bold transition-all ${
                      playbackSpeed === speed
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Volume & Mute */}
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* AI Session Summary Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Call Highlights & Key Insights</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">SIYA Telecaller v3.2</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              "{activeRecording.summary}"
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Synchronized Interactive Transcript */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Synchronized Transcript
              </h4>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyTranscript}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs flex items-center gap-1 transition-all"
                title="Copy Transcript"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTranscript}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs flex items-center gap-1 transition-all"
                title="Download Transcript File"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px]">Export</span>
              </button>
            </div>
          </div>

          {/* Transcript Message Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
            {activeRecording.messages.map((msg) => {
              const isAi = msg.role === 'model';
              const isActive = activeMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSeekMessage(msg)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10 scale-[1.01]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        isAi
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isAi ? 'SIYA AI TELECALLER' : activeRecording.customerName.toUpperCase()}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold animate-pulse">
                          <Play className="w-2.5 h-2.5 fill-emerald-400" /> Spoken Turn
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {msg.timestamp} ({formatTime(msg.timestampSeconds)})
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed font-sans mt-1">
                    "{msg.text}"
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Click any turn to jump audio playback
            </span>

            {onSelectLeadToCall && (
              <button
                type="button"
                onClick={() => onSelectLeadToCall(selectedLead)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>Follow-Up Call Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
