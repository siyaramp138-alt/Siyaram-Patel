import React from 'react';
import { Cpu, Phone, Mic, Brain, Volume2, Code, Zap, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

export const TechStackGuide: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Header */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold tracking-tight">AI Voice Bot Architecture & Tech Stack</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Complete technical blueprint for developing an enterprise AI Telecaller with Twilio, Deepgram & Gemini
          </p>
        </div>

        <span className="px-3 py-1 text-xs font-semibold font-mono rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
          Production Blueprint
        </span>
      </div>

      {/* 4 Pillars Architecture Diagram Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pillar 1: Telephony */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
            1
          </div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-400" /> Telephony Layer
          </h3>
          <p className="text-xs text-slate-300 font-semibold">Twilio or Plivo</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Provides virtual phone numbers, inbound/outbound call routing, and WebSockets (TwiML Stream) for live audio streaming.
          </p>
        </div>

        {/* Pillar 2: STT */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
            2
          </div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Mic className="w-4 h-4 text-purple-400" /> Speech-To-Text (STT)
          </h3>
          <p className="text-xs text-slate-300 font-semibold">Deepgram Nova-2</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Converts customer speech to text in real-time under 200ms with custom keyword boosting and endpointing.
          </p>
        </div>

        {/* Pillar 3: LLM Brain */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
            3
          </div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-emerald-400" /> The Brain (LLM)
          </h3>
          <p className="text-xs text-slate-300 font-semibold">Gemini 3.6 Flash API</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Processes customer text + 'SIYA' system prompt to generate short, natural responses & handles interruptions.
          </p>
        </div>

        {/* Pillar 4: TTS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-lg">
            4
          </div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-pink-400" /> Text-To-Speech (TTS)
          </h3>
          <p className="text-xs text-slate-300 font-semibold">Gemini TTS / ElevenLabs</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Converts Gemini text replies into human-like spoken audio and streams back to Twilio caller.
          </p>
        </div>
      </div>

      {/* Alternative Low Code Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base">Alternative Managed AI Calling Platforms (Low-Code)</h3>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          If you prefer not to stitch together Twilio, Deepgram, and TTS manually, you can use unified voice agent platforms that handle telephony, STT, LLM, and TTS out of the box with single API triggers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 text-sm">Vapi.ai</span>
            <p className="text-slate-400">Enterprise Voice AI orchestrator with native Gemini, ElevenLabs, and Twilio support.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="font-bold text-purple-400 text-sm">Bland.ai</span>
            <p className="text-slate-400">High-concurrency phone call dispatching API with phone number provisioning.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 text-sm">Retell AI</span>
            <p className="text-slate-400">Ultra-low latency conversational voice agent API with speech-to-speech support.</p>
          </div>
        </div>
      </div>

      {/* Server Integration Code Example */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base">Node.js Server Implementation Code (Gemini + Express)</h3>
        </div>

        <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
{`// server.ts - SIYA AI Telecaller Endpoint
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/call/chat", async (req, res) => {
  const { userSpeech, customerName } = req.body;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: userSpeech,
    config: {
      systemInstruction: \`Role: You are an expert AI Telecaller named 'SIYA' from Grow Business Solutions...\`
    }
  });

  res.json({ responseText: response.text });
});`}
        </pre>
      </div>
    </div>
  );
};
