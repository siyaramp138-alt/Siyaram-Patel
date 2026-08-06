import React, { useState } from 'react';
import { Users, PhoneCall, Plus, Search, Filter, CheckCircle2, Clock, XCircle, Building2, UserPlus, Flame, ArrowUpDown, Info, ChevronDown } from 'lucide-react';
import { Lead } from '../types';
import { calculateLeadScore, ScoreBreakdown } from '../utils/leadScoring';

interface LeadsManagerProps {
  leads: Lead[];
  onSelectLeadToCall: (lead: Lead) => void;
  onAddLead: (newLead: Lead) => void;
}

export const LeadsManager: React.FC<LeadsManagerProps> = ({
  leads,
  onSelectLeadToCall,
  onAddLead
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'name' | 'company'>('score-desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedScoreBreakdown, setSelectedScoreBreakdown] = useState<{ lead: Lead; breakdown: ScoreBreakdown } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    industry: 'Retail & Supermarket',
    currentSoftware: 'Manual Excel / Registers',
    notes: ''
  });

  const processedLeads = leads.map((lead) => ({
    lead,
    breakdown: calculateLeadScore(lead)
  }));

  const filteredLeads = processedLeads.filter(({ lead }) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'score-desc') return b.breakdown.score - a.breakdown.score;
    if (sortBy === 'score-asc') return a.breakdown.score - b.breakdown.score;
    if (sortBy === 'name') return a.lead.name.localeCompare(b.lead.name);
    if (sortBy === 'company') return a.lead.company.localeCompare(b.lead.company);
    return 0;
  });

  const handleSubmitNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.company) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      company: formData.company,
      industry: formData.industry,
      currentSoftware: formData.currentSoftware,
      status: 'New',
      notes: formData.notes
    };

    onAddLead(newLead);
    setShowAddModal(false);
    setFormData({
      name: '',
      phone: '',
      company: '',
      industry: 'Retail & Supermarket',
      currentSoftware: 'Manual Excel / Registers',
      notes: ''
    });
  };

  const getScoreBadge = (score: number, onClick: () => void) => {
    let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
    let label = 'Warm';

    if (score >= 8) {
      colorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-900/20';
      label = 'Hot Prospect';
    } else if (score >= 6) {
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      label = 'High Priority';
    } else if (score <= 3) {
      colorClass = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
      label = 'Low Priority';
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border transition-all hover:scale-105 ${colorClass}`}
        title="Click to inspect lead score breakdown calculation"
      >
        <Flame className="w-3.5 h-3.5" />
        <span>{score}/10</span>
        <span className="text-[10px] font-sans font-normal opacity-80 hidden sm:inline">({label})</span>
        <Info className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100 ml-0.5" />
      </button>
    );
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'Demo Scheduled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Demo Scheduled</span>
          </span>
        );
      case 'Calling':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Calling...</span>
          </span>
        );
      case 'Not Interested':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Interested</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <span>New Lead</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl text-white">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Target Customer Leads Directory & Score Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Automated 1-10 priority scoring based on tech gap, industry fit & interaction history
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2 bg-white hover:bg-slate-200 text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filters, Search & Score Sort Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, or phone..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end text-xs">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Demo Scheduled">Demo Scheduled</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>

          {/* Sort By Lead Score */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-rose-300 font-bold focus:outline-none"
            >
              <option value="score-desc" className="bg-slate-900 text-white">Priority Score (High to Low)</option>
              <option value="score-asc" className="bg-slate-900 text-white">Priority Score (Low to High)</option>
              <option value="name" className="bg-slate-900 text-white">Customer Name</option>
              <option value="company" className="bg-slate-900 text-white">Company Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Customer & Company</th>
                <th className="py-4 px-6">Lead Score (1-10)</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Industry & Tech Stack</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No matching leads found. Try relaxing search filters.
                  </td>
                </tr>
              ) : (
                sortedLeads.map(({ lead, breakdown }) => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition-all">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-base">{lead.name}</div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                        <span>{lead.company}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {getScoreBadge(breakdown.score, () =>
                        setSelectedScoreBreakdown({ lead, breakdown })
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-300">{lead.phone}</td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {lead.industry}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">
                        Using: <span className="text-slate-300">{lead.currentSoftware}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">{getStatusBadge(lead.status)}</td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onSelectLeadToCall(lead)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs rounded-full transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Call with SIYA</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Inspection Modal */}
      {selectedScoreBreakdown && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base">Lead Score Algorithm Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedScoreBreakdown(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">{selectedScoreBreakdown.lead.name}</div>
                  <div className="text-xs text-slate-400">{selectedScoreBreakdown.lead.company}</div>
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/30">
                  {selectedScoreBreakdown.breakdown.score} / 10
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Score Factors:</span>
                {selectedScoreBreakdown.breakdown.factors.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                    <span className="text-slate-300">{f.label}</span>
                    <span className={`font-mono font-bold ${f.points >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {f.points >= 0 ? `+${f.points}` : f.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedScoreBreakdown(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Add Target Customer Lead</h3>

            <form onSubmit={handleSubmitNewLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 12345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company / Business Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Kumar Supermart"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Retail & Supermarket">Retail & Supermarket</option>
                  <option value="Logistics">Logistics & Transport</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                  <option value="Healthcare">Healthcare & Pharma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Current Software Stack</label>
                <input
                  type="text"
                  value={formData.currentSoftware}
                  onChange={(e) => setFormData({ ...formData, currentSoftware: e.target.value })}
                  placeholder="e.g. Manual Excel, Basic Tally"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

