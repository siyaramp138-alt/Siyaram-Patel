import React, { useState } from 'react';
import {
  Users, PhoneCall, Plus, Search, Filter, CheckCircle2, Clock, XCircle,
  Building2, UserPlus, Flame, ArrowUpDown, Info, ChevronDown, Mail,
  CheckSquare, Square, Trash2, Megaphone, Download, Tag, AlertTriangle, X, Layers, Globe
} from 'lucide-react';
import { Lead, Campaign, SupportedLanguage } from '../types';
import { LANGUAGE_METADATA } from '../data/languagePrompts';
import { calculateLeadScore, ScoreBreakdown } from '../utils/leadScoring';
import { EmailSummaryModal } from './EmailSummaryModal';

interface LeadsManagerProps {
  leads: Lead[];
  campaigns?: Campaign[];
  onSelectLeadToCall: (lead: Lead) => void;
  onAddLead: (newLead: Lead) => void;
  onDeleteLeads?: (leadIds: string[]) => void;
  onAssignCampaign?: (leadIds: string[], campaignTitle: string) => void;
}

export const LeadsManager: React.FC<LeadsManagerProps> = ({
  leads,
  campaigns = [],
  onSelectLeadToCall,
  onAddLead,
  onDeleteLeads,
  onAssignCampaign
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'name' | 'company'>('score-desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedScoreBreakdown, setSelectedScoreBreakdown] = useState<{ lead: Lead; breakdown: ScoreBreakdown } | null>(null);
  const [selectedEmailLead, setSelectedEmailLead] = useState<Lead | null>(null);

  // Multi-select state & bulk actions state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetCampaignName, setTargetCampaignName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    industry: 'Retail & Supermarket',
    currentSoftware: 'Manual Excel / Registers',
    preferredLanguage: 'English' as SupportedLanguage,
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

  // Multi-select helpers
  const visibleLeadIds = sortedLeads.map(({ lead }) => lead.id);
  const isAllSelected = visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selectedLeadIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(visibleLeadIds);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = () => {
    if (onDeleteLeads && selectedLeadIds.length > 0) {
      onDeleteLeads(selectedLeadIds);
    }
    setToastMessage(`Successfully deleted ${selectedLeadIds.length} lead(s).`);
    setSelectedLeadIds([]);
    setShowDeleteModal(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmAssignCampaign = (campaignTitle: string) => {
    if (!campaignTitle.trim()) return;
    if (onAssignCampaign && selectedLeadIds.length > 0) {
      onAssignCampaign(selectedLeadIds, campaignTitle.trim());
    }
    setToastMessage(`Assigned ${selectedLeadIds.length} lead(s) to "${campaignTitle.trim()}".`);
    setSelectedLeadIds([]);
    setShowAssignModal(false);
    setTargetCampaignName('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    const leadsToExport = leads.filter((l) => selectedLeadIds.includes(l.id));
    if (leadsToExport.length === 0) return;

    const headers = ['Name', 'Company', 'Phone', 'Industry', 'Current Software', 'Status', 'Campaign', 'Notes'];
    const rows = leadsToExport.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.industry.replace(/"/g, '""')}"`,
      `"${l.currentSoftware.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${(l.campaignTitle || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvStr = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      preferredLanguage: formData.preferredLanguage,
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
      preferredLanguage: 'English',
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

      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between text-emerald-300 text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-indigo-950/90 border border-indigo-500/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3 text-white">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">{selectedLeadIds.length} Lead{selectedLeadIds.length > 1 ? 's' : ''} Selected</span>
              <p className="text-[11px] text-indigo-300/80">Execute batch operations across selected contacts</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTargetCampaignName(campaigns[0]?.title || 'Retail ERP Upgrade Sprint');
                setShowAssignModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Assign to Campaign</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedLeadIds.length})</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setSelectedLeadIds([])}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 accent-indigo-500 cursor-pointer"
                    title={isAllSelected ? "Deselect all visible leads" : "Select all visible leads"}
                  />
                </th>
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
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No matching leads found. Try relaxing search filters.
                  </td>
                </tr>
              ) : (
                sortedLeads.map(({ lead, breakdown }) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500 hover:bg-indigo-950/60'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(lead.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 accent-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-base flex flex-wrap items-center gap-2">
                          <span>{lead.name}</span>
                          {lead.preferredLanguage && LANGUAGE_METADATA[lead.preferredLanguage] && (
                            <span className="text-[10px] bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 font-mono">
                              <span>{LANGUAGE_METADATA[lead.preferredLanguage].flag}</span>
                              <span>{lead.preferredLanguage}</span>
                            </span>
                          )}
                          {lead.campaignTitle && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <Megaphone className="w-2.5 h-2.5" />
                              <span>{lead.campaignTitle}</span>
                            </span>
                          )}
                        </div>
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

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedEmailLead(lead)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-medium text-xs rounded-full transition-all"
                          title="Draft & send client summary email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </button>

                        <button
                          onClick={() => onSelectLeadToCall(lead)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs rounded-full transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Call with SIYA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
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

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preferred Telecalling Language</label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value as SupportedLanguage })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="English">🌐 English</option>
                  <option value="Hindi">🇮🇳 Hindi (हिंदी)</option>
                  <option value="Marathi">🇮🇳 Marathi (मराठी)</option>
                  <option value="Bengali">🇮🇳 Bengali (বাংলা)</option>
                </select>
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

      {/* Selected Lead Email Summary Modal */}
      {selectedEmailLead && (
        <EmailSummaryModal
          isOpen={!!selectedEmailLead}
          onClose={() => setSelectedEmailLead(null)}
          leadData={{
            name: selectedEmailLead.name,
            company: selectedEmailLead.company,
            phone: selectedEmailLead.phone,
            email: selectedEmailLead.email,
            industry: selectedEmailLead.industry,
            currentSoftware: selectedEmailLead.currentSoftware
          }}
          demoData={{
            demoDate: 'Tomorrow',
            demoTime: '11:00 AM',
            assignedExpert: 'Rohan Gupta (Senior Consultant)',
            notes: `Lead status: ${selectedEmailLead.status}.`
          }}
          callSummary={`Post-call executive summary draft for ${selectedEmailLead.name} (${selectedEmailLead.company}).`}
        />
      )}

      {/* Assign to Campaign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">Assign Selected Leads to Campaign</h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Targeting <span className="font-bold text-white font-mono">{selectedLeadIds.length} lead(s)</span>. Select an existing campaign or enter a new target campaign title below.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Preset / Existing Campaigns:
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {[
                    'Retail ERP Upgrade Sprint',
                    'Supermarket POS Automation',
                    'Pharma Compliance 2026',
                    'Manufacturing Digital Drive',
                    ...campaigns.map((c) => c.title)
                  ]
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .map((campTitle) => (
                      <button
                        key={campTitle}
                        type="button"
                        onClick={() => setTargetCampaignName(campTitle)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          targetCampaignName === campTitle
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{campTitle}</span>
                        </span>
                        {targetCampaignName === campTitle && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Or Custom Campaign Title:
                </label>
                <input
                  type="text"
                  value={targetCampaignName}
                  onChange={(e) => setTargetCampaignName(e.target.value)}
                  placeholder="e.g. Q3 Regional Outreach Drive"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAssignCampaign(targetCampaignName)}
                disabled={!targetCampaignName.trim()}
                className="flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Assign {selectedLeadIds.length} Lead(s)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400 pb-2 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete Selected Leads</h3>
                <p className="text-xs text-rose-400/90 font-mono">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white font-mono">{selectedLeadIds.length} selected lead(s)</strong> from your directory?
            </p>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-32 overflow-y-auto space-y-1 text-xs font-mono">
              {leads
                .filter((l) => selectedLeadIds.includes(l.id))
                .slice(0, 5)
                .map((l) => (
                  <div key={l.id} className="text-slate-300 flex justify-between">
                    <span>{l.name}</span>
                    <span className="text-slate-500">{l.company}</span>
                  </div>
                ))}
              {selectedLeadIds.length > 5 && (
                <div className="text-slate-500 italic text-[11px] pt-1">
                  ...and {selectedLeadIds.length - 5} more
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center space-x-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedLeadIds.length} Lead(s)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

