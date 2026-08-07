import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CallInterface } from './components/CallInterface';
import { LeadsManager } from './components/LeadsManager';
import { DemoBookings } from './components/DemoBookings';
import { CampaignsPanel } from './components/CampaignsPanel';
import { PromptEditor } from './components/PromptEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { TechStackGuide } from './components/TechStackGuide';
import { MobileAppModal } from './components/MobileAppModal';
import { MobileAppFrame } from './components/MobileAppFrame';
import { Sparkles, PhoneCall, Users, CalendarCheck, Cpu, Smartphone } from 'lucide-react';

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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(INITIAL_LEADS.length > 0 ? INITIAL_LEADS[0] : null);
  const [systemConfig, setSystemConfig] = useState<SystemPromptConfig>(INITIAL_SYSTEM_PROMPT_CONFIG);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>(INITIAL_DEMO_BOOKINGS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMobilePreviewActive, setIsMobilePreviewActive] = useState(false);

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

  // Render tab content component
  const renderTabContent = () => (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Mobile App Information Modal */}
      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onEnableMobilePreview={() => setIsMobilePreviewActive(!isMobilePreviewActive)}
        isMobilePreviewActive={isMobilePreviewActive}
      />

      {isMobilePreviewActive ? (
        <MobileAppFrame
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onExitMobilePreview={() => setIsMobilePreviewActive(false)}
          isCallActive={isCallActive}
        >
          {renderTabContent()}
        </MobileAppFrame>
      ) : (
        <>
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
            onOpenMobileModal={() => setIsMobileModalOpen(true)}
            isMobilePreviewActive={isMobilePreviewActive}
          />

          {/* Main Content Area */}
          <main className="pb-16">
            {renderTabContent()}
          </main>
        </>
      )}
    </div>
  );
}
