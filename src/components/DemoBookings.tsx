import React from 'react';
import { CalendarCheck, Clock, UserCheck, Phone, CheckCircle2, Copy, Sparkles, Building2 } from 'lucide-react';
import { DemoBooking } from '../types';

interface DemoBookingsProps {
  bookings: DemoBooking[];
}

export const DemoBookings: React.FC<DemoBookingsProps> = ({ bookings }) => {
  const handleCopyInvite = (booking: DemoBooking) => {
    const inviteText = `10-Minute Software Demo Invitation - Grow Business Solutions
Client: ${booking.customerName} (${booking.companyName})
Phone: ${booking.phone}
Date & Time: ${booking.demoDate} at ${booking.demoTime}
Assigned Expert: ${booking.assignedExpert}
Interested Solutions: ${booking.interestedServices.join(', ')}
Notes: ${booking.notes}`;

    navigator.clipboard.writeText(inviteText);
    alert('Demo invite copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold tracking-tight">10-Minute Demo Call Schedule</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Follow-up meeting calendar automatically booked by AI Telecaller 'SIYA' for Grow Business Solutions experts
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">Bookings</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">{bookings.length}</span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Demo Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When SIYA completes telecaller conversations and customer agrees to a 10-minute demo, bookings will automatically populate here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{booking.customerName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{booking.companyName}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {booking.status}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Demo Slot:
                    </span>
                    <span className="font-bold text-emerald-400">{booking.demoDate} @ {booking.demoTime}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone:
                    </span>
                    <span className="font-mono text-slate-200">{booking.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Expert:
                    </span>
                    <span className="font-medium text-slate-200">{booking.assignedExpert}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Interested Products
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.interestedServices.map((service, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {booking.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    "{booking.notes}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Booked: {booking.bookedAt}</span>
                <button
                  onClick={() => handleCopyInvite(booking)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Invite</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
