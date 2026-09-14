import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '@/lib/types';
import { Bell, Send, Clock, CheckCircle, Mail, Phone, Calendar } from 'lucide-react';

export function Reminders() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true });
    setAppointments(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function sendReminder(apt: Appointment) {
    setSending(apt.id);
    await new Promise((r) => setTimeout(r, 800));

    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', apt.id);

    setSentIds((prev) => new Set(prev).add(apt.id));
    setSending(null);
    loadData();
  }

  const sentCount = appointments.filter((a) => a.reminder_sent).length;
  const pendingCount = appointments.filter((a) => !a.reminder_sent && a.status === 'scheduled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-serif text-4xl font-bold mb-2">Appointment Reminders</h2>
        <p className="text-charcoal-300">Send automated reminders to clients about upcoming appointments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <Calendar className="text-gold-300 mb-2" size={22} />
          <p className="text-2xl font-bold font-serif">{appointments.length}</p>
          <p className="text-xs text-charcoal-400">Total Upcoming</p>
        </div>
        <div className="glass-card p-5">
          <Bell className="text-blue-400 mb-2" size={22} />
          <p className="text-2xl font-bold font-serif">{pendingCount}</p>
          <p className="text-xs text-charcoal-400">Pending Reminders</p>
        </div>
        <div className="glass-card p-5">
          <CheckCircle className="text-green-400 mb-2" size={22} />
          <p className="text-2xl font-bold font-serif">{sentCount}</p>
          <p className="text-xs text-charcoal-400">Reminders Sent</p>
        </div>
      </div>

      {/* Reminder list */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-2xl font-bold mb-4">Upcoming Appointments</h3>
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto text-charcoal-500 mb-3" size={32} />
            <p className="text-charcoal-400">No upcoming appointments to remind.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const aptDate = new Date(apt.appointment_date + 'T00:00:00');
              const daysAway = Math.ceil((aptDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isSent = apt.reminder_sent || sentIds.has(apt.id);

              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSent
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-charcoal-700/40 border-gold-500/10 hover:border-gold-400/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gold-500/15 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-gold-300 text-xs font-bold uppercase">
                        {aptDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-gold-200 font-bold text-xl leading-none">
                        {aptDate.getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cream-50">{apt.customer_name}</p>
                      <p className="text-sm text-charcoal-400">{apt.service_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-300">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {apt.appointment_time}
                        </span>
                        <span>{apt.duration_minutes} min</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          daysAway <= 1 ? 'bg-red-500/15 text-red-300' : daysAway <= 3 ? 'bg-orange-500/15 text-orange-300' : 'bg-blue-500/15 text-blue-300'
                        }`}>
                          {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway} days away`}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSent ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle size={18} />
                          <span className="hidden sm:inline">Sent</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendReminder(apt)}
                          disabled={sending === apt.id}
                          className="btn-gold text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50"
                        >
                          {sending === apt.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={14} /> Send Reminder
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reminder preview */}
                  {isSent && (
                    <div className="mt-3 p-3 rounded-lg bg-charcoal-800/50 border border-green-500/10">
                      <div className="flex items-center gap-2 text-xs text-green-400 mb-1">
                        <Mail size={12} /> Reminder sent to {apt.customer_name}
                      </div>
                      <p className="text-xs text-charcoal-400">
                        "Hi {apt.customer_name}, this is a reminder for your {apt.service_name} appointment on {aptDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {apt.appointment_time}. We look forward to seeing you at Crown Cuts!"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="glass-card p-6 border-gold-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
            <Phone className="text-gold-300" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gold-200 mb-1">How Reminders Work</h4>
            <p className="text-sm text-charcoal-300 leading-relaxed">
              Click "Send Reminder" to notify clients about their upcoming appointment. Reminders are sent via email and include the appointment date, time, and service details. Clients can confirm or reschedule directly from the reminder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
