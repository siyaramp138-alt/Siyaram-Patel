import React from 'react';
import {
  Smartphone, Monitor, PhoneCall, Users, CalendarCheck, Megaphone,
  Settings, BarChart2, Cpu, Battery, Wifi, Signal, Sparkles
} from 'lucide-react';

interface MobileAppFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExitMobilePreview: () => void;
  isCallActive: boolean;
}

export const MobileAppFrame: React.FC<MobileAppFrameProps> = ({
  children,
  activeTab,
  setActiveTab,
  onExitMobilePreview,
  isCallActive
}) => {
  const bottomNavItems = [
    { id: 'call', label: 'Call', icon: PhoneCall },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'demos', label: 'Demos', icon: CalendarCheck },
    { id: 'campaigns', label: 'Outbound', icon: Megaphone },
    { id: 'prompt', label: 'Voice AI', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#030304] text-slate-100 flex flex-col items-center justify-center p-2 sm:p-6 relative">
      {/* Top Banner to Switch back to Desktop */}
      <div className="w-full max-w-md flex items-center justify-between bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl mb-4 text-xs">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>Mobile App Simulator</span>
        </div>
        <button
          onClick={onExitMobilePreview}
          className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-full shadow-md transition-all"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit Mobile View</span>
        </button>
      </div>

      {/* Smartphone Device Frame (iPhone / Android style) */}
      <div className="relative w-full max-w-[390px] h-[812px] bg-black rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_60px_rgba(79,70,229,0.2)] flex flex-col overflow-hidden">
        {/* Phone Notch / Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
        </div>

        {/* Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[10px] text-slate-400 font-medium bg-[#050505] z-40">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* App Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#050505] scrollbar-thin scrollbar-thumb-slate-800">
          {children}
        </div>

        {/* Native Mobile Bottom Navigation Bar */}
        <div className="bg-[#0a0b0f]/95 border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-40 backdrop-blur-lg">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-indigo-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-indigo-500 absolute -bottom-0.5"></span>
                )}
                {item.id === 'call' && isCallActive && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Home Indicator bar */}
        <div className="bg-[#0a0b0f] pb-2 flex justify-center z-40">
          <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
