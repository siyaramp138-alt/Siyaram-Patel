import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CallInterface } from './components/CallInterface';
import { LeadsManager } from './components/LeadsManager';
import { DemoBookings } from './components/DemoBookings';
import { CampaignsPanel } from './components/CampaignsPanel';
import { PromptEditor } from './components/PromptEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TechStackGuide } from './components/TechStackGuide';
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase';
import { Sparkles, ShieldCheck, Lock, PhoneCall, Users, CalendarCheck, Cpu, ArrowRight, Loader2 } from 'lucide-react';

import {
  INITIAL_LEADS,
  INITIAL_SYSTEM_PROMPT_CONFIG,
  INITIAL_DEMO_BOOKINGS,
  INITIAL_CAMPAIGNS
} from './data/initialLeads';

import { Lead, SystemPromptConfig, DemoBooking, Campaign, CallSession } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState('call');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(INITIAL_LEADS.length > 0 ? INITIAL_LEADS[0] : null);
  const [systemConfig, setSystemConfig] = useState<SystemPromptConfig>(INITIAL_SYSTEM_PROMPT_CONFIG);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>(INITIAL_DEMO_BOOKINGS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        setAuthError('Sign-in popup was closed. Click below to try again.');
      } else if (error?.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by browser. Please allow popups or open in a new tab.');
      } else {
        setAuthError(error?.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Select Lead & jump to Call Console
  const handleSelectLeadToCall = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab('call');
  };

  // Add new lead
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    if (!selectedLead) {
      setSelectedLead(newLead);
    }
  };

  // Bulk Delete Leads
  const handleDeleteLeads = (leadIds: string[]) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => !leadIds.includes(l.id));
      if (selectedLead && leadIds.includes(selectedLead.id)) {
        setSelectedLead(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  // Bulk Assign Campaign to Leads
  const handleAssignCampaignToLeads = (leadIds: string[], campaignTitle: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        leadIds.includes(l.id)
          ? { ...l, campaignTitle, notes: l.notes ? `${l.notes} (Campaign: ${campaignTitle})` : `Campaign: ${campaignTitle}` }
          : l
      )
    );
  };

  // Add new demo booking
  const handleDemoBooked = (booking: DemoBooking) => {
    setDemoBookings((prev) => [booking, ...prev]);

    // Update lead status
    setLeads((prev) =>
      prev.map((l) =>
        l.name === booking.customerName || l.phone === booking.phone
          ? { ...l, status: 'Demo Scheduled' }
          : l
      )
    );
  };

  // Call ended handler
  const handleCallEnded = (session: CallSession, analysis?: any) => {
    setIsCallActive(false);

    if (analysis && analysis.outcome) {
      let newStatus: Lead['status'] = 'New';
      if (analysis.outcome === 'Demo Booked') newStatus = 'Demo Scheduled';
      else if (analysis.outcome === 'Not Interested') newStatus = 'Not Interested';

      setLeads((prev) =>
        prev.map((l) => (l.id === session.leadId ? { ...l, status: newStatus } : l))
      );
    }
  };

  // Add campaign
  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Checking Authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCallActive={false}
          onQuickCall={() => {}}
        />

        <div className="max-w-md w-full mx-auto px-4 py-16 text-center my-auto">
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-indigo-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Login Required</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SIYA AI Voice Telecaller</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Please sign in with your Google Account to access the AI Voice Console, Leads Directory, Google Meet links, and Telecalling campaigns.
              </p>
            </div>

            {authError && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-amber-300 text-xs flex items-center justify-between text-left">
                <span>{authError}</span>
                <button
                  onClick={() => setAuthError(null)}
                  className="text-amber-400 hover:text-amber-200 ml-2 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center space-x-3 py-3 px-6 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-xl shadow-white/5 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span>Opening Sign-In Popup...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Sign in with Google Account</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center space-x-4 text-[11px] text-slate-500">
              <span>Secure Firebase Auth</span>
              <span>•</span>
              <span>Google Meet Ready</span>
            </div>
          </div>
        </div>

        <footer className="py-4 text-center text-[11px] text-slate-600 border-t border-slate-900">
          SIYA AI Voice Telecalling Platform • Powered by Google AI
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCallActive={isCallActive}
        onQuickCall={() => {
          if (leads.length > 0) {
            setSelectedLead(leads[0]);
          }
          setActiveTab('call');
        }}
      />

      {/* Main Content Area */}
      <main className="pb-16">
        {activeTab === 'call' && (
          <CallInterface
            selectedLead={selectedLead}
            systemConfig={systemConfig}
            onCallEnded={handleCallEnded}
            onDemoBooked={handleDemoBooked}
            isCallActive={isCallActive}
            setIsCallActive={setIsCallActive}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsManager
            leads={leads}
            campaigns={campaigns}
            onSelectLeadToCall={handleSelectLeadToCall}
            onAddLead={handleAddLead}
            onDeleteLeads={handleDeleteLeads}
            onAssignCampaign={handleAssignCampaignToLeads}
          />
        )}

        {activeTab === 'demos' && <DemoBookings bookings={demoBookings} />}

        {activeTab === 'campaigns' && (
          <CampaignsPanel
            campaigns={campaigns}
            leads={leads}
            onStartCampaignCall={handleSelectLeadToCall}
            onAddCampaign={handleAddCampaign}
          />
        )}

        {activeTab === 'prompt' && (
          <PromptEditor config={systemConfig} onSaveConfig={setSystemConfig} />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard demoBookings={demoBookings} />}

        {activeTab === 'architecture' && <TechStackGuide />}
      </main>
    </div>
  );
}
