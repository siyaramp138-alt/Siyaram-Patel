import React from 'react';
import { PhoneCall, Users, CalendarCheck, Megaphone, Settings, BarChart2, Cpu, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCallActive: boolean;
  onQuickCall: () => void;
  onOpenMobileModal?: () => void;
  isMobilePreviewActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCallActive,
  onQuickCall,
  onOpenMobileModal,
  isMobilePreviewActive
}) => {
  const navItems = [
    { id: 'call', label: 'AI Voice Console', icon: PhoneCall },
    { id: 'leads', label: 'Leads & Directory', icon: Users },
    { id: 'demos', label: 'Demo Bookings', icon: CalendarCheck },
    { id: 'campaigns', label: 'Outbound Campaigns', icon: Megaphone },
    { id: 'prompt', label: 'Prompt & Voice Setup', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'architecture', label: 'Tech Stack Guide', icon: Cpu },
  ];

  return (
    <header className="bg-[#08080a]/90 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('call')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 text-white">
                S
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-white">
                  Siya <span className="text-indigo-400 font-normal">Voice Engine</span>
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  v2.4.0 • PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">Grow Business Solutions • Telecaller AI</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Status & Mobile App Buttons */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>AI Engine Ready</span>
            </div>

            {/* Mobile App Trigger Button */}
            {onOpenMobileModal && (
              <button
                onClick={onOpenMobileModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all shadow-sm"
                title="Get SIYA Mobile App or test Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Mobile App</span>
              </button>
            )}

            {isCallActive ? (
              <button
                onClick={() => setActiveTab('call')}
                className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse text-xs font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Call Active</span>
              </button>
            ) : (
              <button
                onClick={onQuickCall}
                className="bg-white text-black hover:bg-slate-200 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">TEST CALL SIYA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 py-2 px-2 overflow-x-auto text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
