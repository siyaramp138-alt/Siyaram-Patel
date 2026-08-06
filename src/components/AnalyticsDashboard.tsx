import React from 'react';
import { BarChart2, TrendingUp, PhoneCall, CalendarCheck, Clock, ShieldCheck, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { DemoBooking, CallAnalytics } from '../types';

interface AnalyticsDashboardProps {
  demoBookings: DemoBooking[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ demoBookings }) => {
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
            Real-time call volume, demo booking conversions, and objection resolution metrics for Grow Business Solutions
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
          <span className="text-xs font-bold text-slate-400 uppercase">Objections Overcome</span>
          <div className="text-2xl font-bold text-indigo-400 flex items-center justify-between">
            <span>{stats.objectionsHandled}</span>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[10px] text-indigo-300">Busy & Existing Software handled</span>
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
