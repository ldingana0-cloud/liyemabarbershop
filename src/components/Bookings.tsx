import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, Service, Customer } from '@/lib/types';
import { ChevronLeft, ChevronRight, Plus, X, Clock, CheckCircle, XCircle, User, Scissors } from 'lucide-react';

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  completed: 'bg-green-500/15 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  'no-show': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
};

export function Bookings() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    const [apptsRes, svcRes, custRes] = await Promise.all([
      supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
      supabase.from('services').select('*').eq('active', true),
      supabase.from('customers').select('*').order('name', { ascending: true }),
    ]);
    setAppointments(apptsRes.data || []);
    setServices(svcRes.data || []);
    setCustomers(custRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const appointmentsByDate = appointments.reduce<Record<string, Appointment[]>>((acc, apt) => {
    if (!acc[apt.appointment_date]) acc[apt.appointment_date] = [];
    acc[apt.appointment_date].push(apt);
    return acc;
  }, {});

  function formatDateKey(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  async function handleBook() {
    if (!customerName.trim() || !selectedDate || !selectedTime || !selectedService) return;

    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    // Find or create customer
    let customerId: string | null = null;
    const existing = customers.find(
      (c) => c.name.toLowerCase() === customerName.toLowerCase() ||
        (customerEmail && c.email?.toLowerCase() === customerEmail.toLowerCase())
    );

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          name: customerName,
          email: customerEmail || null,
          phone: customerPhone || null,
        })
        .select()
        .single();
      if (newCustomer) customerId = (newCustomer as Customer).id;
    }

    await supabase.from('appointments').insert({
      customer_id: customerId,
      customer_name: customerName,
      service_id: selectedService,
      service_name: service.name,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      duration_minutes: service.duration_minutes,
      notes: notes || null,
    });

    setShowBooking(false);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedService('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setNotes('');
    loadData();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id);
    loadData();
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const upcomingList = appointments
    .filter((a) => a.appointment_date >= todayKey)
    .sort((a, b) => (a.appointment_date + a.appointment_time).localeCompare(b.appointment_date + b.appointment_time));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-4xl font-bold mb-2">Booking Calendar</h2>
          <p className="text-charcoal-300">Manage appointments and schedule new bookings.</p>
        </div>
        <button onClick={() => setShowBooking(true)} className="btn-gold flex items-center gap-2">
          <Plus size={18} /> New Booking
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold">{monthName}</h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-charcoal-700/50 hover:bg-charcoal-700 text-charcoal-200 hover:text-gold-300 transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-charcoal-700/50 hover:bg-charcoal-700 text-charcoal-200 hover:text-gold-300 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs text-charcoal-400 font-medium py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(day);
              const dayAppts = appointmentsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              return (
                <div
                  key={day}
                  className={`min-h-[64px] p-1.5 rounded-lg border transition-all ${
                    isToday
                      ? 'border-gold-400/50 bg-gold-500/10'
                      : 'border-charcoal-700/50 hover:border-gold-500/20'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-gold-300' : 'text-charcoal-300'}`}>
                    {day}
                  </span>
                  {dayAppts.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      className="mt-1 text-[10px] px-1.5 py-1 rounded bg-gold-500/15 text-gold-200 truncate"
                    >
                      {apt.appointment_time}
                    </div>
                  ))}
                  {dayAppts.length > 2 && (
                    <div className="text-[10px] text-charcoal-400 mt-0.5">+{dayAppts.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-2xl font-bold mb-4">Upcoming</h3>
          {upcomingList.length === 0 ? (
            <p className="text-charcoal-400 text-sm text-center py-8">No upcoming appointments.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {upcomingList.map((apt) => (
                <div key={apt.id} className="p-4 rounded-xl bg-charcoal-700/40 border border-gold-500/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-cream-50">{apt.customer_name}</p>
                      <p className="text-xs text-charcoal-400">{apt.service_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_STYLES[apt.status] || ''}`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-charcoal-300 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>{apt.appointment_time}</span>
                    <span>{apt.duration_minutes}min</span>
                  </div>
                  {apt.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(apt.id, 'completed')}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} /> Complete
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, 'cancelled')}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-all flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowBooking(false)}>
          <div className="glass-card p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold gold-text">New Booking</h3>
              <button onClick={() => setShowBooking(false)} className="text-charcoal-400 hover:text-gold-300 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block flex items-center gap-1.5">
                  <User size={14} /> Customer Name
                </label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-field" placeholder="John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gold-300 font-medium mb-1.5 block">Email</label>
                  <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="input-field" placeholder="john@email.com" />
                </div>
                <div>
                  <label className="text-sm text-gold-300 font-medium mb-1.5 block">Phone</label>
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input-field" placeholder="(555) 123-4567" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block flex items-center gap-1.5">
                  <Scissors size={14} /> Service
                </label>
                <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="input-field">
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ${(s.price_cents / 100).toFixed(2)} ({s.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gold-300 font-medium mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={todayKey}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-gold-300 font-medium mb-1.5 block">Time</label>
                  <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="input-field">
                    <option value="">Select time...</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[60px] resize-none" placeholder="Special requests..." />
              </div>

              <button
                onClick={handleBook}
                disabled={!customerName.trim() || !selectedDate || !selectedTime || !selectedService}
                className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
