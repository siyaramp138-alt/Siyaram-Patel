import React, { useState } from 'react';
import { CalendarCheck, Clock, UserCheck, Phone, CheckCircle2, Copy, Sparkles, Building2, Calendar, ExternalLink, Download, Check, Mail, Video, Loader2 } from 'lucide-react';
import { DemoBooking } from '../types';
import { EmailSummaryModal } from './EmailSummaryModal';
import { createGoogleMeetSpace } from '../lib/googleMeet';

interface DemoBookingsProps {
  bookings: DemoBooking[];
}

export const DemoBookings: React.FC<DemoBookingsProps> = ({ bookings }) => {
  const [syncedBooking, setSyncedBooking] = useState<DemoBooking | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailBooking, setEmailBooking] = useState<DemoBooking | null>(null);

  // Google Meet links state by booking ID
  const [meetLinks, setMeetLinks] = useState<Record<string, string>>({});
  const [generatingMeetId, setGeneratingMeetId] = useState<string | null>(null);

  const handleCreateGoogleMeet = async (booking: DemoBooking) => {
    setGeneratingMeetId(booking.id);
    try {
      const space = await createGoogleMeetSpace();
      setMeetLinks((prev) => ({ ...prev, [booking.id]: space.meetingUri }));
    } catch (err) {
      console.error('Failed to create Meet space:', err);
    } finally {
      setGeneratingMeetId(null);
    }
  };

  const generateGoogleCalendarUrl = (booking: DemoBooking) => {
    const meetUrl = meetLinks[booking.id] ? `\nGoogle Meet Link: ${meetLinks[booking.id]}` : '';
    const title = encodeURIComponent(`10-Min Software Demo: ${booking.companyName} x Grow Business Solutions`);
    const details = encodeURIComponent(
      `Customer Demo Session\n\nClient: ${booking.customerName}\nCompany: ${booking.companyName}\nPhone: ${booking.phone}\nAssigned Consultant: ${booking.assignedExpert}\nInterested Solutions: ${booking.interestedServices.join(', ')}${meetUrl}\n\nNotes: ${booking.notes}`
    );
    const location = encodeURIComponent(meetLinks[booking.id] || `Phone Call / Online Demo (${booking.phone})`);

    // Parse date & time string e.g., "Tomorrow", "Aug 10", "11:00 AM"
    // Create default start date today/tomorrow or fallback
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default tomorrow
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 min duration

    const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  const handleOpenGoogleCalendar = (booking: DemoBooking) => {
    const url = generateGoogleCalendarUrl(booking);
    window.open(url, '_blank', 'noopener,noreferrer');
    setSyncedBooking(booking);
  };

  const handleDownloadICS = (booking: DemoBooking) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Grow Business Solutions//SIYA AI Telecaller//EN
BEGIN:VEVENT
SUMMARY:10-Min Software Demo: ${booking.companyName}
DESCRIPTION:Client: ${booking.customerName}\\nPhone: ${booking.phone}\\nExpert: ${booking.assignedExpert}\\nNotes: ${booking.notes}
LOCATION:Phone Call (${booking.phone})
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `demo-${booking.companyName.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyInvite = (booking: DemoBooking) => {
    const inviteText = `10-Minute Software Demo Invitation - Grow Business Solutions
Client: ${booking.customerName} (${booking.companyName})
Phone: ${booking.phone}
Date & Time: ${booking.demoDate} at ${booking.demoTime}
Assigned Expert: ${booking.assignedExpert}
Interested Solutions: ${booking.interestedServices.join(', ')}
Notes: ${booking.notes}`;

    navigator.clipboard.writeText(inviteText);
    setCopiedId(booking.id);
    setTimeout(() => setCopiedId(null), 3000);
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

                  {/* Google Meet Link Section */}
                  <div className="pt-2 border-t border-slate-800/80">
                    {meetLinks[booking.id] ? (
                      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                        <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] truncate">
                          <Video className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-mono font-bold truncate">{meetLinks[booking.id]}</span>
                        </div>
                        <a
                          href={meetLinks[booking.id]}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          Join <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCreateGoogleMeet(booking)}
                        disabled={generatingMeetId === booking.id}
                        className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {generatingMeetId === booking.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                            <span>Creating Meet Space...</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Create Google Meet Space</span>
                          </>
                        )}
                      </button>
                    )}
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

              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenGoogleCalendar(booking)}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Sync Google Calendar</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>

                  <button
                    onClick={() => handleDownloadICS(booking)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                    title="Download .ics Calendar File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEmailBooking(booking)}
                    className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs transition-all border border-indigo-500/30"
                    title="Draft and send client summary email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Booked: {booking.bookedAt}</span>
                  <button
                    onClick={() => handleCopyInvite(booking)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white font-medium transition-all"
                  >
                    {copiedId === booking.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Invite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync Overlay Modal Confirmation */}
      {syncedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-bold text-base">Google Calendar Event Created!</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Opened Google Calendar for <strong className="text-white">{syncedBooking.customerName} ({syncedBooking.companyName})</strong> with pre-filled event details, consultant name, and demo notes.
            </p>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-emerald-400 font-bold">{syncedBooking.demoDate} @ {syncedBooking.demoTime}</div>
              <div className="text-slate-400">Assigned Expert: {syncedBooking.assignedExpert}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSyncedBooking(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Summary Modal */}
      {emailBooking && (
        <EmailSummaryModal
          isOpen={!!emailBooking}
          onClose={() => setEmailBooking(null)}
          leadData={{
            name: emailBooking.customerName,
            company: emailBooking.companyName,
            phone: emailBooking.phone
          }}
          demoData={{
            demoDate: emailBooking.demoDate,
            demoTime: emailBooking.demoTime,
            assignedExpert: emailBooking.assignedExpert,
            notes: emailBooking.notes
          }}
          callSummary={`Demo call booked for ${emailBooking.customerName} (${emailBooking.companyName}) on ${emailBooking.demoDate} @ ${emailBooking.demoTime}.`}
        />
      )}
    </div>
  );
};

