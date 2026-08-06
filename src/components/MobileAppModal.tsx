import React, { useState } from 'react';
import {
  Smartphone, Download, QrCode, Share2, CheckCircle2,
  Sparkles, PhoneCall, Users, CalendarCheck, Megaphone,
  X, ExternalLink, ShieldCheck, Zap, Layers, ArrowRight, Laptop
} from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableMobilePreview: () => void;
  isMobilePreviewActive: boolean;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({
  isOpen,
  onClose,
  onEnableMobilePreview,
  isMobilePreviewActive
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'qr'>('pwa');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0c0d12] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">SIYA Mobile App</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  PWA & Android Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Access SIYA AI Telecaller on your iOS or Android Mobile Phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toggle Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'pwa'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Install PWA App</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'apk'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Android APK Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'qr'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Tab 1: PWA Installation */}
        {activeTab === 'pwa' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Mobile Installation (No App Store Needed)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                SIYA Voice Telecaller is built as a Progressive Web App (PWA). You can add it directly to your mobile home screen with full offline support and native app-like features.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-indigo-400 flex items-center space-x-1.5">
                    <span>📱 Android (Google Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Open this web page in Chrome</li>
                    <li>Tap the 3 dots menu (⋮) at top right</li>
                    <li>Tap <strong className="text-slate-200">"Add to Home screen"</strong></li>
                  </ol>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <span>🍎 iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Open this web page in Safari</li>
                    <li>Tap the <strong className="text-slate-200">Share icon (⎋)</strong> below</li>
                    <li>Scroll down & tap <strong className="text-slate-200">"Add to Home Screen"</strong></li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onEnableMobilePreview();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isMobilePreviewActive ? 'Switch to Full Desktop View' : 'Try Mobile App Simulator Screen'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Mobile App Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Android APK */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Download className="w-4 h-4" />
                <span>TWA / APK Native Android Export</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can turn this web app into a native <strong className="text-white">.APK file</strong> using Bubblewrap CLI or PWABuilder in under 2 minutes:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400 font-mono text-[11px] space-y-1">
                  <p className="text-indigo-300 font-bold">Steps to generate Android APK:</p>
                  <p>1. Go to <span className="text-emerald-400 underline cursor-pointer" onClick={() => window.open('https://www.pwabuilder.com', '_blank')}>pwabuilder.com</span></p>
                  <p>2. Paste your web app URL: <code className="text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded">{currentUrl.substring(0, 35)}...</code></p>
                  <p>3. Click <strong>"Package for Android"</strong> to download the unsigned APK or Google Play Bundle.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.open('https://www.pwabuilder.com', '_blank')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
              >
                <span>Open PWABuilder (Generate APK)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: QR Code */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-center">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm mx-auto space-y-4">
              <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                {/* SVG Mock QR Code */}
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <path fill="#000000" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M10,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M70,50 h10 v20 h-10 z M40,70 h10 v20 h-10 z M60,80 h30 v20 h-30 z M80,80 h10 v10 h-10 z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Scan with Mobile Camera</p>
                <p className="text-[11px] text-slate-400 mt-1">Scan this QR code to open SIYA AI Telecaller on your smartphone instantly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Responsive Mobile Layout & PWA Support</span>
          </div>
          <span>v2.4 Mobile Edition</span>
        </div>
      </div>
    </div>
  );
};
