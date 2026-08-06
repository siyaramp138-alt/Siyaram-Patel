import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CallInterface } from './components/CallInterface';
import { LeadsManager } from './components/LeadsManager';
import { DemoBookings } from './components/DemoBookings';
import { CampaignsPanel } from './components/CampaignsPanel';
import { PromptEditor } from './components/PromptEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TechStackGuide } from './components/TechStackGuide';

import {
  INITIAL_LEADS,
  INITIAL_SYSTEM_PROMPT_CONFIG,
  INITIAL_DEMO_BOOKINGS,
  INITIAL_CAMPAIGNS
} from './data/initialLeads';

import { Lead, SystemPromptConfig, DemoBooking, Campaign, CallSession } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('call');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead>(INITIAL_LEADS[0]);
  const [systemConfig, setSystemConfig] = useState<SystemPromptConfig>(INITIAL_SYSTEM_PROMPT_CONFIG);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>(INITIAL_DEMO_BOOKINGS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [isCallActive, setIsCallActive] = useState(false);

  // Select Lead & jump to Call Console
  const handleSelectLeadToCall = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab('call');
  };

  // Add new lead
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
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

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCallActive={isCallActive}
        onQuickCall={() => {
          setSelectedLead(leads[0]);
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
            onSelectLeadToCall={handleSelectLeadToCall}
            onAddLead={handleAddLead}
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
