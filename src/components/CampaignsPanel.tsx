import React, { useState } from 'react';
import { Megaphone, Play, Pause, RefreshCw, CheckCircle2, PhoneCall, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { Campaign, Lead, DemoBooking } from '../types';

interface CampaignsPanelProps {
  campaigns: Campaign[];
  leads: Lead[];
  onStartCampaignCall: (lead: Lead) => void;
  onAddCampaign: (campaign: Campaign) => void;
}

export const CampaignsPanel: React.FC<CampaignsPanelProps> = ({
  campaigns,
  leads,
  onSelectLeadToCall: onStartCampaignCall,
  onAddCampaign
}) => {
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<Array<{ id: string; leadName: string; text: string; status: string }>>([]);
  const [simProgress, setSimProgress] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('Retail & Supermarkets');

  const handleRunSimulatedCampaign = (camp: Campaign) => {
    setActiveSimulationId(camp.id);
    setSimProgress(0);
    setSimulationLogs([]);

    const campaignLeads = leads.slice(0, 4);
    let index = 0;

    const interval = setInterval(() => {
      if (index >= campaignLeads.length) {
        clearInterval(interval);
        setActiveSimulationId(null);
        return;
      }

      const currentLead = campaignLeads[index];
      const isBooked = index % 2 === 0;

      setSimulationLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          leadName: currentLead.name,
          text: `SIYA called ${currentLead.name} (${currentLead.company}) - Offered ERP & Billing.`,
          status: isBooked ? 'Demo Scheduled' : 'Objection Handled: Busy'
        },
        ...prev
      ]);

      index++;
      setSimProgress(Math.floor((index / campaignLeads.length) * 100));
    }, 2500);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title: title,
      targetIndustry: targetIndustry,
      status: 'Active',
      totalLeads: 25,
      callsMade: 0,
      demosBooked: 0,
      notInterested: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddCampaign(newCamp);
    setShowModal(false);
    setTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold tracking-tight">Outbound AI Telecalling Campaigns</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Automated dialer campaigns running SIYA AI System Prompt across targeted business verticals
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-5 py-2 bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => {
          const conversionRate = camp.callsMade > 0 ? Math.round((camp.demosBooked / camp.callsMade) * 100) : 0;
          const isSimulating = activeSimulationId === camp.id;

          return (
            <div
              key={camp.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      {camp.targetIndustry}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{camp.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {camp.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Calls Made</span>
                    <span className="text-base font-bold text-white">{camp.callsMade} / {camp.totalLeads}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Demos Booked</span>
                    <span className="text-base font-bold text-emerald-400">{camp.demosBooked}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Conversion</span>
                    <span className="text-base font-bold text-indigo-400">{conversionRate}%</span>
                  </div>
                </div>

                {isSimulating && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-indigo-300">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SIYA Auto-Dialer Running...
                      </span>
                      <span>{simProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${simProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Created: {camp.createdAt}</span>
                <button
                  onClick={() => handleRunSimulatedCampaign(camp)}
                  disabled={isSimulating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isSimulating ? 'Dialing...' : 'Run Auto-Dialer'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Simulation Logs Feed */}
      {simulationLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Live Auto-Dialer Call Log</h3>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {simulationLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <PhoneCall className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-bold text-white">{log.leadName}:</span>{' '}
                    <span className="text-slate-300">{log.text}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full font-semibold ${
                  log.status.includes('Booked') || log.status.includes('Scheduled')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Create Telecaller Campaign</h3>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Wholesale ERP Outreach"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Business Vertical</label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Retail & Supermarkets">Retail & Supermarkets</option>
                  <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                  <option value="Manufacturing Units">Manufacturing Units</option>
                  <option value="Pharma Wholesalers">Pharma Wholesalers</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
