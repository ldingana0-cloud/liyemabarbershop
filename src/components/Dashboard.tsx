import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, Customer, Service, SocialPost, ContentGeneration } from '@/lib/types';
import { TrendingUp, Users, Calendar, Gift, Scissors, Sparkles, ArrowUpRight, Share2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: 'dashboard' | 'ai-studio' | 'bookings' | 'loyalty' | 'social' | 'reminders') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [apptsRes, custRes, svcRes, socialRes, contentRes] = await Promise.all([
      supabase.from('appointments').select('*').order('appointment_date', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').eq('active', true),
      supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('content_generations').select('*', { count: 'exact', head: true }),
    ]);

    setAppointments(apptsRes.data || []);
    setCustomers(custRes.data || []);
    setServices(svcRes.data || []);
    setSocialPosts(socialRes.data || []);
    setContentCount(contentRes.count || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter((a) => a.appointment_date >= today && a.status === 'scheduled')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0);
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const revenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => {
      const svc = services.find((s) => s.id === a.service_id);
      return sum + (svc?.price_cents || 0);
    }, 0);

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'from-blue-400 to-blue-600' },
    { label: 'Upcoming Bookings', value: upcomingAppointments.length, icon: Calendar, color: 'from-gold-300 to-gold-500' },
    { label: 'Loyalty Points Issued', value: totalLoyaltyPoints, icon: Gift, color: 'from-green-400 to-green-600' },
    { label: 'AI Content Created', value: contentCount, icon: Sparkles, color: 'from-gold-400 to-gold-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="glass-card p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-gold-300 text-sm tracking-widest uppercase mb-2">Welcome back</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-3">Your Barbershop at a Glance</h2>
          <p className="text-charcoal-300 max-w-xl">
            Generate marketing content, manage bookings, track loyalty rewards, and schedule social posts — all from one elegant dashboard.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNavigate('ai-studio')} className="btn-gold flex items-center gap-2">
              <Scissors size={18} /> Create Content
            </button>
            <button onClick={() => onNavigate('bookings')} className="btn-outline flex items-center gap-2">
              <Calendar size={18} /> View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-6 group hover:border-gold-400/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="text-charcoal-900" size={20} />
                </div>
                <ArrowUpRight className="text-charcoal-500 group-hover:text-gold-400 transition-colors" size={18} />
              </div>
              <p className="text-3xl font-bold font-serif">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-charcoal-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold">Upcoming Appointments</h3>
            <button onClick={() => onNavigate('bookings')} className="text-gold-300 text-sm hover:text-gold-200 transition-colors">
              View all →
            </button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-charcoal-500 mb-3" size={32} />
              <p className="text-charcoal-400">No upcoming appointments</p>
              <button onClick={() => onNavigate('bookings')} className="mt-4 btn-outline text-sm">
                Book an appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-charcoal-700/40 hover:bg-charcoal-700/60 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex flex-col items-center justify-center">
                    <span className="text-gold-300 text-xs font-bold uppercase">
                      {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-gold-200 font-bold text-lg leading-none">
                      {new Date(apt.appointment_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cream-50 truncate">{apt.customer_name}</p>
                    <p className="text-sm text-charcoal-400">{apt.service_name} · {apt.appointment_time}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gold-500/15 text-gold-300 whitespace-nowrap">
                    {apt.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats card */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-2xl font-bold mb-6">Performance</h3>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-300 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" /> Revenue
                </span>
                <span className="text-gold-300 font-semibold">${(revenue / 100).toFixed(2)}</span>
              </div>
              <div className="h-2 bg-charcoal-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: `${Math.min(completedAppointments * 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-300 flex items-center gap-2">
                  <Calendar size={16} className="text-gold-400" /> Completed
                </span>
                <span className="text-gold-300 font-semibold">{completedAppointments}</span>
              </div>
              <div className="h-2 bg-charcoal-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full" style={{ width: `${Math.min(completedAppointments * 10, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-300 flex items-center gap-2">
                  <Share2 size={16} className="text-blue-400" /> Social Posts
                </span>
                <span className="text-gold-300 font-semibold">{socialPosts.length}</span>
              </div>
              <div className="h-2 bg-charcoal-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${Math.min(socialPosts.length * 15, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gold-500/15">
            <button onClick={() => onNavigate('social')} className="w-full btn-outline text-sm flex items-center justify-center gap-2">
              <Share2 size={16} /> Manage Social Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
