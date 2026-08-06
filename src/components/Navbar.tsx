import React, { useEffect, useState } from 'react';
import { PhoneCall, Users, CalendarCheck, Megaphone, Settings, BarChart2, Cpu, Sparkles, LogOut, User as UserIcon, Smartphone } from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        console.info('Google Sign-In popup closed by user.');
      } else {
        console.warn('Google Sign-In failed:', error?.message || error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

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

          {/* User Auth & Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Google Account Login */}
            {isAuthLoading ? (
              <div className="h-8 w-24 bg-slate-900 animate-pulse rounded-full border border-slate-800"></div>
            ) : user ? (
              <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full text-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                )}
                <span className="font-medium text-slate-200 max-w-[100px] sm:max-w-[140px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all hover:border-slate-600 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Login</span>
              </button>
            )}

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
