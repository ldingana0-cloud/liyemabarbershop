import { useState, useEffect } from 'react';
import { Scissors, Sparkles, Calendar, Gift, Share2, Bell, Menu, X } from 'lucide-react';

export type TabId = 'dashboard' | 'ai-studio' | 'bookings' | 'loyalty' | 'social' | 'reminders';

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof Scissors;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
  { id: 'ai-studio', label: 'AI Studio', icon: Scissors },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'loyalty', label: 'Loyalty', icon: Gift },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'reminders', label: 'Reminders', icon: Bell },
];

interface SidebarProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [active]);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-charcoal-800 border border-gold-500/30 rounded-xl p-2.5 text-gold-300"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-charcoal-800 border-r border-gold-500/20 z-40 transition-transform duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-8 py-8 border-b border-gold-500/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Scissors className="text-charcoal-900" size={24} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold gold-text leading-none">Crown Cuts</h1>
              <p className="text-xs text-charcoal-400 mt-1 tracking-widest uppercase">AI Marketing Suite</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                    : 'text-charcoal-300 hover:text-gold-200 hover:bg-charcoal-700/50 border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-gold-500/15">
          <div className="text-xs text-charcoal-400 leading-relaxed">
            <p className="text-gold-300 font-medium mb-1">Premium Grooming</p>
            <p>AI-powered marketing for the modern barbershop.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
