import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Customer, LoyaltyTransaction } from '@/lib/types';
import { Gift, Plus, Minus, Crown, Star, TrendingUp, Search } from 'lucide-react';

const TIERS = [
  { name: 'Bronze', min: 0, max: 99, color: 'from-orange-400 to-orange-600', icon: Star },
  { name: 'Silver', min: 100, max: 499, color: 'from-gray-300 to-gray-500', icon: Star },
  { name: 'Gold', min: 500, max: 999, color: 'from-gold-300 to-gold-600', icon: Crown },
  { name: 'Platinum', min: 1000, max: Infinity, color: 'from-cyan-300 to-blue-500', icon: Crown },
];

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) || TIERS[0];
}

function getNextTier(points: number) {
  return TIERS.find((t) => points < t.min) || null;
}

export function Loyalty() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

  const loadData = useCallback(async () => {
    const [custRes, txRes] = await Promise.all([
      supabase.from('customers').select('*').order('loyalty_points', { ascending: false }),
      supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setCustomers(custRes.data || []);
    setTransactions(txRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAdjustPoints() {
    if (!selectedCustomer || adjustPoints === 0) return;

    const newTotal = Math.max(0, selectedCustomer.loyalty_points + adjustPoints);
    const isEarn = adjustPoints > 0;

    await supabase
      .from('customers')
      .update({ loyalty_points: newTotal })
      .eq('id', selectedCustomer.id);

    await supabase.from('loyalty_transactions').insert({
      customer_id: selectedCustomer.id,
      points: Math.abs(adjustPoints),
      transaction_type: isEarn ? 'earn' : 'redeem',
      description: adjustReason || (isEarn ? 'Points earned' : 'Points redeemed'),
    });

    setSelectedCustomer(null);
    setAdjustPoints(0);
    setAdjustReason('');
    loadData();
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0);
  const avgPoints = customers.length > 0 ? Math.round(totalPoints / customers.length) : 0;
  const goldMembers = customers.filter((c) => c.loyalty_points >= 500).length;

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
        <h2 className="font-serif text-4xl font-bold mb-2">Loyalty Rewards</h2>
        <p className="text-charcoal-300">Track and manage customer loyalty points and reward tiers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <Gift className="text-gold-300 mb-2" size={22} />
          <p className="text-2xl font-bold font-serif">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-charcoal-400">Total Points Issued</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="text-green-400 mb-2" size={22} />
          <p className="text-2xl font-bold font-serif">{avgPoints.toLocaleString()}</p>
          <p className="text-xs text-charcoal-400">Average per Customer</p>
        </div>
        <div className="glass-card p-5">
          <Crown className="text-gold-400 mb-2" size={22} />
          <p className="text-2xl font-bold font-serif">{goldMembers}</p>
          <p className="text-xs text-charcoal-400">Gold+ Members</p>
        </div>
      </div>

      {/* Tier ladder */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-xl font-bold mb-4">Reward Tiers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const count = customers.filter((c) => getTier(c.loyalty_points).name === tier.name).length;
            return (
              <div key={tier.name} className="p-4 rounded-xl bg-charcoal-700/40 border border-gold-500/10 text-center">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="text-charcoal-900" size={22} />
                </div>
                <p className="font-semibold text-cream-50">{tier.name}</p>
                <p className="text-xs text-charcoal-400">
                  {tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}
                </p>
                <p className="text-sm text-gold-300 mt-1">{count} members</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customers */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl font-bold">Customers</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input-field pl-9 py-2 text-sm w-48"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredCustomers.length === 0 ? (
            <p className="text-charcoal-400 text-sm text-center py-8">No customers found.</p>
          ) : (
            filteredCustomers.map((c) => {
              const tier = getTier(c.loyalty_points);
              const nextTier = getNextTier(c.loyalty_points);
              const progress = nextTier
                ? Math.min(((c.loyalty_points - tier.min) / (nextTier.min - tier.min)) * 100, 100)
                : 100;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="p-4 rounded-xl bg-charcoal-700/40 hover:bg-charcoal-700/60 border border-gold-500/10 hover:border-gold-400/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-cream-50">{c.name}</p>
                      <p className="text-xs text-charcoal-400">{c.email || c.phone || 'No contact info'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${tier.color} text-charcoal-900 font-medium`}>
                        {tier.name}
                      </span>
                      <p className="text-lg font-bold text-gold-300 mt-1">{c.loyalty_points} pts</p>
                    </div>
                  </div>
                  {nextTier && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-charcoal-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-charcoal-500 mt-1">
                        {nextTier.min - c.loyalty_points} pts to {nextTier.name}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-2xl font-bold mb-4">Recent Activity</h3>
        {transactions.length === 0 ? (
          <p className="text-charcoal-400 text-sm text-center py-6">No loyalty activity yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => {
              const customer = customers.find((c) => c.id === tx.customer_id);
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-700/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.transaction_type === 'earn' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                    {tx.transaction_type === 'earn' ? <Plus size={16} className="text-green-400" /> : <Minus size={16} className="text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer?.name || 'Unknown'}</p>
                    <p className="text-xs text-charcoal-400">{tx.description || tx.transaction_type}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.transaction_type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.transaction_type === 'earn' ? '+' : '−'}{tx.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Adjust modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedCustomer(null)}>
          <div className="glass-card p-6 lg:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl font-bold gold-text mb-1">{selectedCustomer.name}</h3>
            <p className="text-sm text-charcoal-400 mb-6">Current balance: {selectedCustomer.loyalty_points} points ({getTier(selectedCustomer.loyalty_points).name})</p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setAdjustPoints(50)} className="flex-1 py-2 rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition-all text-sm font-medium">
                  +50
                </button>
                <button onClick={() => setAdjustPoints(100)} className="flex-1 py-2 rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition-all text-sm font-medium">
                  +100
                </button>
                <button onClick={() => setAdjustPoints(-50)} className="flex-1 py-2 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-all text-sm font-medium">
                  −50
                </button>
                <button onClick={() => setAdjustPoints(-100)} className="flex-1 py-2 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-all text-sm font-medium">
                  −100
                </button>
              </div>

              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block">Custom Amount</label>
                <input
                  type="number"
                  value={adjustPoints || ''}
                  onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                  className="input-field"
                  placeholder="e.g. 25 or -25"
                />
              </div>

              <div>
                <label className="text-sm text-gold-300 font-medium mb-1.5 block">Reason</label>
                <input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Referral bonus, Birthday reward..."
                />
              </div>

              <button
                onClick={handleAdjustPoints}
                disabled={adjustPoints === 0}
                className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adjust Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
