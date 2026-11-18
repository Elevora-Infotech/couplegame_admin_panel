import React, { useState, useEffect } from 'react';
import { 
  Crown, Sparkles, Check, X, Plus, Trash2, Save, RefreshCw, 
  HelpCircle, Copy, AlertTriangle, ShieldCheck, ArrowRight, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMembershipPlans, updateMembershipPlans } from '../api/adminSettingsApi';

export default function RoomPlansPricingManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);

  // Plans State
  const [monthlyPlan, setMonthlyPlan] = useState({
    id: 'monthly',
    name: 'Monthly VIP Pass',
    price_numeric: 99,
    price: '₹99',
    period: '/ month',
    badge: 'MOST POPULAR',
    savings: 'Full 30-Day Room Access & All 700+ Cards',
    productId: 'soulshuffle_monthly_99',
    enabled: true,
  });

  const [yearlyPlan, setYearlyPlan] = useState({
    id: 'yearly',
    name: 'Annual VIP Pass',
    price_numeric: 499,
    price: '₹499',
    period: '/ year',
    badge: 'BEST VALUE',
    savings: 'Save 60% — Unlimited Couple Access',
    productId: 'soulshuffle_pro_annual',
    enabled: false,
  });

  // Features Comparison List State
  const [features, setFeatures] = useState([
    {
      id: 'feat_room_duration',
      name: 'Intimacy Room Duration',
      free: '7 Days Only',
      paid: 'Full 30 Days Active 💖',
      highlight: true,
    },
    {
      id: 'feat_card_library',
      name: 'Dare Cards Library',
      free: 'Starter Pool (40 Cards)',
      paid: 'Full Catalog (700+ Cards) 🔥',
      highlight: true,
    },
    {
      id: 'feat_spice_spectrum',
      name: 'Spice Spectrum',
      free: 'Level 1 & 2 Only',
      paid: 'All Levels (Wild & Steamy 🔥)',
      highlight: true,
    },
    {
      id: 'feat_deflect_shields',
      name: 'Deflect Shields',
      free: '1 per week',
      paid: 'Unlimited / 5 per Game 🛡️',
      highlight: false,
    },
    {
      id: 'feat_flexible_timers',
      name: 'Turn Timers & Deadlines',
      free: 'Fixed 24 Hours',
      paid: 'Flexible (12h, 24h, 48h, 7d)',
      highlight: false,
    },
    {
      id: 'feat_streak_protection',
      name: 'Streak Protection & Moments',
      free: 'None',
      paid: 'Never Lose Streaks ✨',
      highlight: false,
    },
    {
      id: 'feat_vip_support',
      name: 'Priority Real-Time Sync',
      free: 'Standard',
      paid: 'VIP Priority ⚡',
      highlight: false,
    },
  ]);

  const [lastUpdated, setLastUpdated] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMembershipPlans();
      if (res) {
        if (res.plans?.monthly) {
          setMonthlyPlan(prev => ({ ...prev, ...res.plans.monthly }));
        }
        if (res.plans?.yearly) {
          setYearlyPlan(prev => ({ ...prev, ...res.plans.yearly }));
        }
        if (res.features && Array.isArray(res.features) && res.features.length > 0) {
          setFeatures(res.features);
        }
        if (res.updated_at_ist) {
          setLastUpdated(res.updated_at_ist);
        }
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      toast.error('Could not load current plans. Using default settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    toast.success(`Copied SKU: ${sku}`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Add Feature Row
  const handleAddFeature = () => {
    const newId = `feat_${Date.now()}`;
    setFeatures(prev => [
      ...prev,
      {
        id: newId,
        name: 'New Feature',
        free: 'Basic / Limited',
        paid: 'Unlimited / VIP',
        highlight: false,
      }
    ]);
  };

  // Update Feature Row
  const handleUpdateFeature = (index, field, value) => {
    setFeatures(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Remove Feature Row
  const handleRemoveFeature = (index) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  // Save All Changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanMonthly = {
        ...monthlyPlan,
        price: `₹${monthlyPlan.price_numeric}`,
        enabled: true, // Monthly is always enabled
      };

      const cleanYearly = {
        ...yearlyPlan,
        price: `₹${yearlyPlan.price_numeric}`,
        // enabled flag kept as user configured
      };

      await updateMembershipPlans({
        plans: {
          monthly: cleanMonthly,
          yearly: cleanYearly,
        },
        features,
        reason: `Admin updated room plan pricing (Monthly ₹${cleanMonthly.price_numeric}, Yearly Enabled: ${cleanYearly.enabled})`,
      });

      toast.success('Room Plan Pricing & Features saved successfully! Live on mobile app.');
      loadData();
    } catch (err) {
      console.error('Save plans error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save plans');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading VIP Room plans & dynamic pricing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Explainer */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/30 to-rose-950/40 border border-violet-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Crown className="w-5 h-5" />
            </span>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              VIP Room Plans & Dynamic Paywall Engine
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Configure real-time pricing and feature comparison shown in the mobile app's paywall modal (<code className="text-pink-400">FreePlanEndModal</code>). 
            Users attempting to create a <span className="font-bold text-white">30-Day Room</span> are automatically prompted to purchase the Monthly Plan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={saving}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Reload from server"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* ── 1. PLANS CONFIGURATION (Monthly vs Yearly) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Active Subscription Plans
          </h3>
          {lastUpdated && (
            <span className="text-[11px] text-slate-400">
              Last saved: <span className="text-slate-200">{lastUpdated}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1: MONTHLY PLAN (ALWAYS PRIMARY & ACTIVE) */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-violet-500/40 relative overflow-hidden bg-gradient-to-b from-violet-950/20 to-slate-900/60 shadow-xl space-y-4">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-violet-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl text-white shadow-md">
              PRIMARY • 30-DAY ROOM
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
                ₹
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{monthlyPlan.name}</h4>
                <p className="text-[11px] text-slate-400">Default membership for 30-Day Rooms & 700+ Cards</p>
              </div>
            </div>

            {/* Price Edit */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Monthly Price (INR ₹)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">₹</span>
                <input
                  type="number"
                  min="1"
                  value={monthlyPlan.price_numeric}
                  onChange={(e) => setMonthlyPlan({ ...monthlyPlan, price_numeric: Number(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 bg-slate-900 border border-violet-500/50 rounded-xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-xs text-slate-400 font-medium">/ month (Auto-renew)</span>
              </div>
              <p className="text-[10px] text-emerald-400">
                ✨ Recommended default: <strong>₹99</strong> / month
              </p>
            </div>

            {/* Display Texts */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Plan Display Title
                </label>
                <input
                  type="text"
                  value={monthlyPlan.name}
                  onChange={(e) => setMonthlyPlan({ ...monthlyPlan, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Subtitle / Value Proposition
                </label>
                <input
                  type="text"
                  value={monthlyPlan.savings}
                  onChange={(e) => setMonthlyPlan({ ...monthlyPlan, savings: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Google Play Product ID (SKU)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={monthlyPlan.productId}
                    onChange={(e) => setMonthlyPlan({ ...monthlyPlan, productId: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 font-mono text-pink-400 text-xs border border-white/10 rounded-xl focus:border-violet-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopySku(monthlyPlan.productId)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title="Copy SKU for Google Play Console"
                  >
                    {copiedSku === monthlyPlan.productId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Active in Mobile App. Always visible when users select 30-Day Room.</span>
            </div>
          </div>

          {/* CARD 2: YEARLY PLAN (TOGGLEABLE - DEFAULT DISABLED) */}
          <div className={`glass-panel p-6 rounded-2xl border transition-all relative overflow-hidden bg-gradient-to-b ${
            yearlyPlan.enabled 
              ? 'border-indigo-500/40 from-indigo-950/20 to-slate-900/60 shadow-xl' 
              : 'border-white/10 from-slate-900/40 to-slate-950/60 opacity-85'
          } space-y-4`}>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${
                  yearlyPlan.enabled ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-white/10 text-slate-400'
                }`}>
                  📅
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{yearlyPlan.name}</h4>
                  <p className="text-[11px] text-slate-400">Optional long-term couple membership</p>
                </div>
              </div>

              {/* Master Switch for Yearly Plan */}
              <button
                type="button"
                onClick={() => setYearlyPlan(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  yearlyPlan.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    yearlyPlan.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Visibility Status Notice */}
            {!yearlyPlan.enabled ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold">Yearly Plan is DISABLED (Client Spec Rule)</p>
                  <p className="text-amber-200/80 mt-0.5">
                    Mobile app will <strong>ONLY show the Monthly Plan (₹{monthlyPlan.price_numeric})</strong>. The yearly option is completely hidden from users.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <p className="font-bold">Yearly Plan is ENABLED</p>
                  <p className="text-indigo-200/80 mt-0.5">
                    Mobile app will show both Monthly and Annual options side-by-side.
                  </p>
                </div>
              </div>
            )}

            {/* Price Edit */}
            <div className={`p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 ${!yearlyPlan.enabled ? 'opacity-60' : ''}`}>
              <label className="text-[11px] font-semibold text-slate-300 block">
                Yearly Price (INR ₹)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">₹</span>
                <input
                  type="number"
                  min="1"
                  disabled={!yearlyPlan.enabled}
                  value={yearlyPlan.price_numeric}
                  onChange={(e) => setYearlyPlan({ ...yearlyPlan, price_numeric: Number(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 bg-slate-900 border border-indigo-500/50 rounded-xl text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-xs text-slate-400 font-medium">/ year</span>
              </div>
            </div>

            {/* Display Texts */}
            <div className={`space-y-3 ${!yearlyPlan.enabled ? 'opacity-60' : ''}`}>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Plan Display Title
                </label>
                <input
                  type="text"
                  disabled={!yearlyPlan.enabled}
                  value={yearlyPlan.name}
                  onChange={(e) => setYearlyPlan({ ...yearlyPlan, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Subtitle / Value Proposition
                </label>
                <input
                  type="text"
                  disabled={!yearlyPlan.enabled}
                  value={yearlyPlan.savings}
                  onChange={(e) => setYearlyPlan({ ...yearlyPlan, savings: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Google Play Product ID (SKU)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={!yearlyPlan.enabled}
                    value={yearlyPlan.productId}
                    onChange={(e) => setYearlyPlan({ ...yearlyPlan, productId: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 font-mono text-indigo-400 text-xs border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleCopySku(yearlyPlan.productId)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title="Copy SKU for Google Play Console"
                  >
                    {copiedSku === yearlyPlan.productId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── 2. FEATURE COMPARISON TABLE (FREE VS VIP) ── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-pink-400" />
              Paywall Feature Comparison Table (Free vs VIP)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit what users get in Free Plan vs VIP Plan. These rows appear dynamically inside the app's upgrade modal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddFeature}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-semibold text-xs rounded-xl transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Feature Row
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">⭐ Highlight</th>
                <th className="py-2.5 px-3 w-1/3">Feature Name</th>
                <th className="py-2.5 px-3 w-1/4">Free Plan Benefit</th>
                <th className="py-2.5 px-3 w-1/3">VIP Plan Benefit</th>
                <th className="py-2.5 px-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-white/[0.02] transition-colors">
                  
                  {/* Highlight Star */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleUpdateFeature(index, 'highlight', !item.highlight)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.highlight ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={item.highlight ? 'Highlighted (Bold in Paywall)' : 'Click to highlight'}
                    >
                      <Star className={`w-4 h-4 ${item.highlight ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>

                  {/* Feature Name */}
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateFeature(index, 'name', e.target.value)}
                      placeholder="e.g. Intimacy Room Duration"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white font-semibold text-xs focus:border-violet-500 focus:outline-none"
                    />
                  </td>

                  {/* Free Value */}
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={item.free}
                      onChange={(e) => handleUpdateFeature(index, 'free', e.target.value)}
                      placeholder="e.g. 7 Days Only"
                      className="w-full px-3 py-1.5 bg-slate-900/60 border border-white/10 rounded-lg text-slate-300 text-xs focus:border-violet-500 focus:outline-none"
                    />
                  </td>

                  {/* VIP Value */}
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={item.paid}
                      onChange={(e) => handleUpdateFeature(index, 'paid', e.target.value)}
                      placeholder="e.g. Full 30 Days Active 💖"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-pink-500/30 rounded-lg text-pink-300 font-bold text-xs focus:border-pink-500 focus:outline-none"
                    />
                  </td>

                  {/* Delete */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete feature row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. GOOGLE PLAY CONSOLE MONETIZATION INSTRUCTIONS ── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 border border-blue-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Google Play Console Digital Product Linking Instructions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Product ID (SKU)</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-pink-400 font-bold">soulshuffle_monthly_99</span>
              <button
                onClick={() => handleCopySku('soulshuffle_monthly_99')}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Paste exact SKU in Play Console & RevenueCat.</p>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Product Type & Pricing</span>
            <p className="font-semibold text-white">In-App Product / Subscription</p>
            <p className="font-bold text-emerald-400 text-sm">₹99.00 INR (Taxes Included)</p>
            <p className="text-[11px] text-slate-400">Set default price in Indian Rupee.</p>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Play Console Path</span>
            <p className="text-slate-300 font-medium">Monetization &gt; In-app products</p>
            <p className="text-[11px] text-slate-400">
              Click <strong>Create Product</strong> &gt; Set ID <code className="text-pink-400">soulshuffle_monthly_99</code> &gt; Set Price &gt; Click <strong>Activate</strong>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
