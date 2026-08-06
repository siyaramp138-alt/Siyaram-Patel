import React, { useState } from 'react';
import { BarChart2, TrendingUp, PhoneCall, CalendarCheck, Clock, ShieldCheck, Award, Smile, Frown, Meh, Sparkles, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { DemoBooking, CallAnalytics } from '../types';

interface AnalyticsDashboardProps {
  demoBookings: DemoBooking[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ demoBookings }) => {
  const [activeSentimentView, setActiveSentimentView] = useState<'overall' | 'phase'>('overall');

  const stats: CallAnalytics = {
    totalCalls: 48,
    connectedCalls: 42,
    demosBooked: demoBookings.length + 8,
    conversionRate: Math.round(((demoBookings.length + 8) / 48) * 100),
    avgDurationSeconds: 112,
    objectionsHandled: 29
  };

  const outcomeData = [
    { name: 'Demos Booked', count: stats.demosBooked, color: '#10b981' },
    { name: 'Callback Requested', count: 12, color: '#6366f1' },
    { name: 'Busy / Call Later', count: 15, color: '#f59e0b' },
    { name: 'Not Interested', count: 5, color: '#64748b' },
  ];

  const hourlyData = [
    { time: '10 AM', calls: 8, demos: 3 },
    { time: '11 AM', calls: 12, demos: 5 },
    { time: '12 PM', calls: 6, demos: 2 },
    { time: '2 PM', calls: 10, demos: 4 },
    { time: '4 PM', calls: 12, demos: 3 },
  ];

  // Call Transcript Sentiment Data
  const sentimentSummaryData = [
    { name: 'Positive Sentiment', value: 31, percentage: '65%', color: '#10b981' }, // emerald
    { name: 'Neutral / Curious', value: 11, percentage: '23%', color: '#f59e0b' }, // amber
    { name: 'Negative / Resistant', value: 6, percentage: '12%', color: '#f43f5e' }, // rose
  ];

  // Phase-wise Transcript Sentiment Trajectory (Area chart)
  const phaseSentimentTrajectory = [
    { phase: '1. Greeting', positive: 88, negative: 4, neutral: 8 },
    { phase: '2. Value Pitch', positive: 76, negative: 10, neutral: 14 },
    { phase: '3. Objections', positive: 54, negative: 26, neutral: 20 },
    { phase: '4. Demo CTA', positive: 82, negative: 8, neutral: 10 },
    { phase: '5. Closing', positive: 91, negative: 3, neutral: 6 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold tracking-tight">SIYA Telecalling Performance Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Real-time call volume, demo booking conversions, transcript sentiment analysis, and objection resolution metrics
          </p>
        </div>

        <span className="text-xs font-semibold font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Conversion Rate: {stats.conversionRate}%
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total AI Dials</span>
          <div className="text-2xl font-bold text-white flex items-center justify-between">
            <span>{stats.totalCalls}</span>
            <PhoneCall className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[10px] text-emerald-400">{stats.connectedCalls} Connected</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Demos Booked</span>
          <div className="text-2xl font-bold text-emerald-400 flex items-center justify-between">
            <span>{stats.demosBooked}</span>
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Targeting senior consultant meetings</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Positive Call Sentiment</span>
          <div className="text-2xl font-bold text-emerald-400 flex items-center justify-between">
            <span>65%</span>
            <Smile className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-300">+12% vs last week</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Call Duration</span>
          <div className="text-2xl font-bold text-purple-400 flex items-center justify-between">
            <span>1m 52s</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] text-slate-400">Concise 2-minute intro pitches</span>
        </div>
      </div>

      {/* Call Transcript Sentiment Analysis Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-white">Call Transcript Sentiment Analysis</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural Language Processing (NLP) classification of customer transcript emotion (Positive vs Neutral vs Negative)
            </p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveSentimentView('overall')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSentimentView === 'overall'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overall Breakdown
            </button>
            <button
              onClick={() => setActiveSentimentView('phase')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSentimentView === 'phase'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phase Progression
            </button>
          </div>
        </div>

        {/* Sentiment Stats Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Positive Sentiment</span>
                <span className="text-lg font-bold text-white">31 Calls (65%)</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">High Demo Intent</span>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Meh className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Neutral / Inquiring</span>
                <span className="text-lg font-bold text-white">11 Calls (23%)</span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">Asking Pricing</span>
          </div>

          <div className="bg-slate-950/80 border border-rose-500/30 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Frown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Negative / Objections</span>
                <span className="text-lg font-bold text-white">6 Calls (12%)</span>
              </div>
            </div>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono">Busy / Refused</span>
          </div>
        </div>

        {/* Dynamic Sentiment Chart Render */}
        {activeSentimentView === 'overall' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
            {/* Donut Chart */}
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentSummaryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {sentimentSummaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any, name: any) => [`${val} Transcripts`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Side Bar Comparison Chart */}
            <div className="h-64 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Distribution by Sentiment</h4>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={sentimentSummaryData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" name="Call Transcripts" radius={[0, 8, 8, 0]}>
                    {sentimentSummaryData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Phase Progression Area Chart */
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Transcript Sentiment Trajectory Across Call Stages (%)
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={phaseSentimentTrajectory}>
                  <XAxis dataKey="phase" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="positive" name="Positive %" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="neutral" name="Neutral %" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="negative" name="Negative %" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Trend Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">Call Volume & Demo Conversion Trend</h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="calls" fill="#6366f1" radius={[6, 6, 0, 0]} name="Calls Made" />
                <Bar dataKey="demos" fill="#10b981" radius={[6, 6, 0, 0]} name="Demos Booked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcome Breakdown Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">Call Outcome Distribution</h3>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {outcomeData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300">{item.name}: <strong className="text-white">{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

