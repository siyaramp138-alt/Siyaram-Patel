import React, { useState } from 'react';
import { Settings, Save, Play, RefreshCw, CheckCircle2, Sparkles, Sliders, MessageSquare } from 'lucide-react';
import { SystemPromptConfig } from '../types';

interface PromptEditorProps {
  config: SystemPromptConfig;
  onSaveConfig: (newConfig: SystemPromptConfig) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<SystemPromptConfig>({ ...config });
  const [testUserMessage, setTestUserMessage] = useState('Hi, I am already using Tally software for my billing.');
  const [testAiResponse, setTestAiResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestPrompt = async () => {
    if (!testUserMessage.trim()) return;
    setIsTesting(true);
    setTestAiResponse('');

    try {
      const res = await fetch('/api/call/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Test Client',
          companyName: formData.companyName,
          userSpeech: testUserMessage,
          customPrompt: formData.customSystemPrompt,
          generateAudio: false
        })
      });

      const data = await res.json();
      if (data.success && data.responseText) {
        setTestAiResponse(data.responseText);
      }
    } catch (err) {
      console.error('Test prompt error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold tracking-tight">SIYA System Prompt & Telecaller Behavior</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Customize conversation guidelines, objection handling rules, and tone for Grow Business Solutions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-4 h-4" /> System Prompt Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
          >
            <Save className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: System Prompt Textarea & Persona Settings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                System Instructions (LLM Directive)
              </h3>
              <span className="text-xs text-slate-500">Gemini 3.6 Flash Engine</span>
            </div>

            <div>
              <textarea
                rows={16}
                value={formData.customSystemPrompt}
                onChange={(e) => setFormData({ ...formData, customSystemPrompt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Persona Configuration Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-white">
            <h3 className="font-bold text-base">Quick Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">AI Agent Name</label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live System Prompt Playground & Response Tester */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Test System Prompt Response</h3>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Simulated Customer Input</label>
              <textarea
                rows={3}
                value={testUserMessage}
                onChange={(e) => setTestUserMessage(e.target.value)}
                placeholder="Type customer objection or greeting..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleTestPrompt}
                disabled={isTesting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isTesting ? 'Generating...' : 'Test SIYA Reply'}</span>
              </button>
            </div>

            {testAiResponse && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                  SIYA Spoken Reply
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">"{testAiResponse}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
