import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, RefreshCw, DollarSign, Target, Clock, Plus, X, 
  Loader2, Megaphone, ShieldCheck, PieChart, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRevenueApi } from '../api/adminRevenueApi';
import { useAuth } from '../context/AuthContext';

export default function BusinessKPIs() {
  const { isAdmin } = useAuth();
  const [roiData, setRoiData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for Ad Spend Entry
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    week_start_ist: new Date().toISOString().split('T')[0],
    week_end_ist: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    campaign_type: 'install',
    ad_angle: 'Angle A',
    amount_inr: 5000,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminRevenueApi.getMarketingROI();
      if (res.data?.status === 'success') {
        setRoiData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load Marketing & CAC metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordSpend = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Restricted: Only Admin users can record ad spend.');
      return;
    }
    if (!formData.reason.trim() || formData.reason.trim().length < 5) {
      toast.error('A detailed business reason (minimum 5 characters) is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminRevenueApi.recordAdSpend({
        ...formData,
        amount_inr: Number(formData.amount_inr),
        reason: formData.reason.trim(),
      });
      toast.success(res.data?.data?.message || 'Ad spend recorded successfully');
      setModalOpen(false);
      setFormData({
        week_start_ist: new Date().toISOString().split('T')[0],
        week_end_ist: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        campaign_type: 'install',
        ad_angle: 'Angle A',
        amount_inr: 5000,
        reason: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record ad spend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-violet-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            Business KPIs, Ad Spend & CAC Payback
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Track blended CAC, marketing return on ad spend (ROAS), campaign angles, and payback velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Record Marketing Spend
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-sm font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Ad Spend (INR)</p>
          <p className="text-2xl md:text-3xl font-black text-white mt-1">
            ₹{roiData?.metrics?.total_ad_spend?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Logged marketing campaigns</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Blended CAC</p>
          <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mt-1">
            ₹{roiData?.metrics?.blended_cac || 0}
          </p>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">Per Paying Couple Acquired</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Return On Ad Spend (ROAS)</p>
          <p className="text-2xl md:text-3xl font-black text-white mt-1">
            {roiData?.metrics?.roas || 0}x
          </p>
          <p className="text-[10px] text-indigo-400 mt-0.5">Gross Revenue / Ad Spend</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CAC Payback Velocity</p>
          <p className="text-2xl md:text-3xl font-black text-purple-400 mt-1">
            {roiData?.metrics?.cac_payback_days || 0} days
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">To break even on season renewals</p>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            Performance by Campaign Angle
          </h2>

          <div className="space-y-3">
            {(!roiData?.campaign_breakdown || roiData.campaign_breakdown.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No campaign angle data recorded yet. Click "Record Marketing Spend" to log a week.
              </div>
            ) : (
              roiData.campaign_breakdown.map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white uppercase">{c.ad_angle}</span>
                    <p className="text-slate-400 mt-0.5 capitalize">{c.campaign_type} campaign</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm">₹{c.total_spend.toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-slate-500">{c.entries_count} logged week(s)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ad Spend Log */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent Marketing Spend Entries
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {(!roiData?.recent_entries || roiData.recent_entries.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No entries logged yet.
              </div>
            ) : (
              roiData.recent_entries.map((entry) => (
                <div key={entry.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white font-mono">{entry.week_start_ist} → {entry.week_end_ist}</span>
                    <p className="text-slate-400 mt-0.5">{entry.ad_angle} · {entry.campaign_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">₹{Number(entry.amount_inr).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL: RECORD AD SPEND ────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Record Marketing Ad Spend</h3>
                  <p className="text-xs text-slate-400">Log weekly marketing spend for blended CAC tracking.</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSpend} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Week Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.week_start_ist}
                    onChange={(e) => setFormData({ ...formData, week_start_ist: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Week End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.week_end_ist}
                    onChange={(e) => setFormData({ ...formData, week_end_ist: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Campaign Type</label>
                  <select
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="install">App Install Campaign</option>
                    <option value="retargeting">Retargeting Campaign</option>
                    <option value="brand">Brand Awareness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Ad Creative Angle</label>
                  <select
                    value={formData.ad_angle}
                    onChange={(e) => setFormData({ ...formData, ad_angle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="Angle A">Angle A (Playful / Spiciness)</option>
                    <option value="Angle B">Angle B (Deep Intimacy / Emotional)</option>
                    <option value="retargeting">Retargeting Lapsed Couples</option>
                    <option value="general">General App Store Ads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Amount Spent (INR ₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount_inr}
                  onChange={(e) => setFormData({ ...formData, amount_inr: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Mandatory Business Reason (min 5 chars)</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Meta Ads weekly spend invoice reconciliation..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Save Spend Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
