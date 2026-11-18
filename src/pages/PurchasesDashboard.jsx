import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Loader2, TrendingUp, Filter, Search, ExternalLink, 
  AlertCircle, CheckCircle2, RotateCcw, Calendar, Smartphone, Crown,
  Gift, ShieldCheck, X, Sparkles, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRevenueApi } from '../api/adminRevenueApi';
import { useAuth } from '../context/AuthContext';
import RoomPlansPricingManager from '../components/RoomPlansPricingManager';

export default function PurchasesDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'subscriptions' | 'transactions' | 'analytics'
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subPage, setSubPage] = useState(1);
  const [subPagination, setSubPagination] = useState({ total: 0, pages: 1 });
  const [subStatusFilter, setSubStatusFilter] = useState('');
  const [subPlatformFilter, setSubPlatformFilter] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txSearch, setTxSearch] = useState('');

  // Revenue Metrics & KPIs State
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Modals State
  const [refundModal, setRefundModal] = useState({ open: false, purchaseId: null, amount: 0 });
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  const [grantModal, setGrantModal] = useState({ open: false });
  const [grantForm, setGrantForm] = useState({ roomId: '', seasonNumber: 1, durationDays: 30, reason: '' });
  const [isGranting, setIsGranting] = useState(false);

  // ── Fetch Metrics ───────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const res = await adminRevenueApi.getMetrics();
      if (res.data?.status === 'success') {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.warn('Metrics fetch error:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // ── Fetch Subscriptions ─────────────────────────────────────
  const fetchSubscriptions = useCallback(async (page = 1) => {
    try {
      setSubLoading(true);
      const res = await adminRevenueApi.getSubscriptions({
        page,
        limit: 15,
        status: subStatusFilter,
        platform: subPlatformFilter,
        search: subSearch,
      });
      if (res.data?.status === 'success') {
        setSubscriptions(res.data.data.subscriptions || []);
        setSubPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load subscriptions');
    } finally {
      setSubLoading(false);
    }
  }, [subStatusFilter, subPlatformFilter, subSearch]);

  // ── Fetch Transactions ──────────────────────────────────────
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setTxLoading(true);
      // Fetch via revenue metrics or purchases endpoint
      const res = await adminRevenueApi.getSubscriptions({ page, limit: 20 });
      // We also fetch transactions list
    } catch (err) {
      console.warn(err);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchSubscriptions(1);
  }, [fetchMetrics, fetchSubscriptions]);

  // ── Handle Refund ───────────────────────────────────────────
  const submitRefund = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Restricted: Only Admin users can issue refunds.');
      return;
    }
    if (!refundReason.trim() || refundReason.trim().length < 5) {
      toast.error('Refund rejected: A detailed reason (minimum 5 characters) is mandatory.');
      return;
    }

    setIsRefunding(true);
    try {
      const res = await adminRevenueApi.processRefund(refundModal.purchaseId, refundReason.trim());
      toast.success(res.data?.data?.message || 'Refund successfully processed');
      setRefundModal({ open: false, purchaseId: null, amount: 0 });
      setRefundReason('');
      fetchMetrics();
      fetchSubscriptions(subPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  // ── Handle Complimentary Grant ──────────────────────────────
  const submitGrant = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Restricted: Only Admin users can grant complimentary access.');
      return;
    }
    if (!grantForm.roomId.trim()) {
      toast.error('Please enter a valid Couple Room ID.');
      return;
    }
    if (!grantForm.reason.trim() || grantForm.reason.trim().length < 5) {
      toast.error('A detailed reason (minimum 5 characters) is mandatory.');
      return;
    }

    setIsGranting(true);
    try {
      const res = await adminRevenueApi.grantComplimentary({
        roomId: grantForm.roomId.trim(),
        seasonNumber: Number(grantForm.seasonNumber),
        durationDays: Number(grantForm.durationDays),
        reason: grantForm.reason.trim(),
      });
      toast.success(res.data?.data?.message || 'Complimentary season pass granted!');
      setGrantModal({ open: false });
      setGrantForm({ roomId: '', seasonNumber: 1, durationDays: 30, reason: '' });
      fetchMetrics();
      fetchSubscriptions(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grant complimentary subscription');
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
              <CreditCard className="w-6 h-6 text-emerald-400" />
            </div>
            Business, Subscriptions & Revenue Operations
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            RevenueCat-powered subscription lifecycle, couple entitlement registries, and financial analytics.
          </p>
        </div>

        {/* Header Action: Grant Season Pass */}
        {isAdmin && (
          <button
            onClick={() => setGrantModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02]"
          >
            <Gift className="w-4 h-4" />
            Grant Complimentary Pass
          </button>
        )}
      </div>

      {/* KPI Cards (All in INR ₹) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monthly Recurring Revenue</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              ₹{metrics?.kpis?.mrr?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-1 font-medium">Active Season Subscriptions</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gross Revenue (INR)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-3xl font-black text-white">
              ₹{metrics?.kpis?.gross_revenue?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Net: ₹{metrics?.kpis?.net_revenue?.toLocaleString('en-IN') || '0'}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Paying Couples</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-3xl font-black text-white">
              {metrics?.kpis?.total_paying_couples || 0}
            </span>
          </div>
          <p className="text-[10px] text-indigo-400 mt-1 font-medium">ARPPU: ₹{metrics?.kpis?.arppu || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 group hover:-translate-y-1 transition-all">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Refund Rate</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-3xl font-black text-amber-400">
              {metrics?.kpis?.refund_rate || 0}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Refunded: ₹{metrics?.kpis?.refunded_amount?.toLocaleString('en-IN') || 0}</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Crown className="w-4 h-4 text-emerald-400" />
          Couple Subscriptions & Season Passes
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
            {subPagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Revenue & Subscription Analytics
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'plans'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-lg shadow-violet-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Crown className="w-4 h-4 text-violet-400" />
          💎 VIP Room Plans & Dynamic Pricing
        </button>
      </div>

      {/* ── TAB 0: VIP ROOM PLANS & PRICING MANAGER ── */}
      {activeTab === 'plans' && (
        <RoomPlansPricingManager />
      )}

      {/* ── TAB 1: COUPLE SUBSCRIPTIONS & SEASON PASSES ────────────────────── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Room Code (e.g. ELV-XXXX), Payer Name..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <select
              value={subStatusFilter}
              onChange={(e) => setSubStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="autopay_off">Autopay Off</option>
              <option value="ended">Ended / Expired</option>
            </select>
            <select
              value={subPlatformFilter}
              onChange={(e) => setSubPlatformFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Platforms</option>
              <option value="ios">Apple In-App Purchase</option>
              <option value="android">Google Play Billing</option>
            </select>
            {(subSearch || subStatusFilter || subPlatformFilter) && (
              <button
                onClick={() => { setSubSearch(''); setSubStatusFilter(''); setSubPlatformFilter(''); }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subscriptions Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
            {subLoading ? (
              <div className="flex items-center justify-center py-20 text-emerald-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Crown className="w-12 h-12 mb-3 opacity-30 text-emerald-400" />
                <p className="text-sm">No subscriptions found matching the selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-white/[0.02]">
                      <th className="px-6 py-3.5 text-left">Room Code</th>
                      <th className="px-6 py-3.5 text-left">Golden Payer</th>
                      <th className="px-6 py-3.5 text-left">Partner</th>
                      <th className="px-6 py-3.5 text-left">Season</th>
                      <th className="px-6 py-3.5 text-left">Autopay Status</th>
                      <th className="px-6 py-3.5 text-left">Duration / Expiry</th>
                      <th className="px-6 py-3.5 text-left">Platform</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions.map((sub) => (
                      <tr key={sub.subscription_id} className="hover:bg-white/[0.03] transition-all">
                        {/* Room Code */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/couple/${sub.couple_id}`)}
                            className="font-mono font-bold text-white hover:text-emerald-400 flex items-center gap-1 group"
                            title="Open Couple Screen"
                          >
                            {sub.room_code}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <span className="text-[10px] text-slate-500">₹{sub.price_inr} / season</span>
                        </td>

                        {/* Payer */}
                        <td className="px-6 py-4">
                          {sub.payer ? (
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Golden Payer">
                                <Crown className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <button
                                  onClick={() => navigate(`/player/${sub.payer.id}`)}
                                  className="font-semibold text-white hover:text-indigo-400 text-xs text-left"
                                >
                                  {sub.payer.name}
                                </button>
                                <p className="text-[11px] font-mono text-slate-400">{sub.payer.phone_masked}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Unknown Payer</span>
                          )}
                        </td>

                        {/* Partner */}
                        <td className="px-6 py-4">
                          {sub.partner ? (
                            <div>
                              <button
                                onClick={() => navigate(`/player/${sub.partner.id}`)}
                                className="font-semibold text-slate-300 hover:text-indigo-400 text-xs text-left"
                              >
                                {sub.partner.name}
                              </button>
                              <p className="text-[11px] font-mono text-slate-500">{sub.partner.phone_masked}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Waiting for partner</span>
                          )}
                        </td>

                        {/* Season Number */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold text-xs">
                            Season {sub.season_number}
                          </span>
                        </td>

                        {/* Autopay Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${sub.autopay_status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            <span className="text-xs font-semibold capitalize text-slate-300">
                              {sub.autopay_status === 'active' ? 'Auto-Renewing' : 'Autopay Off'}
                            </span>
                          </div>
                        </td>

                        {/* Duration & Days Left */}
                        <td className="px-6 py-4">
                          <div>
                            <span className={`text-xs font-bold ${sub.days_remaining <= 3 ? 'text-amber-400' : 'text-slate-200'}`}>
                              {sub.days_remaining} days left
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sub.ends_at_ist}</p>
                          </div>
                        </td>

                        {/* Platform */}
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                            {sub.payment_source}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/couple/${sub.couple_id}`)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                            title="Open Couple Screen"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: REVENUE & SUBSCRIPTION ANALYTICS ────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Platform Split & Conversion Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* iOS vs Android Split */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                Store Platform Revenue Split
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Apple App Store (iOS)</span>
                    <span className="text-white">₹{metrics?.platform_breakdown?.ios?.revenue?.toLocaleString('en-IN') || 0} ({metrics?.platform_breakdown?.ios?.transactions || 0} tx)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(10, ((metrics?.platform_breakdown?.ios?.revenue || 0) / Math.max(1, metrics?.kpis?.gross_revenue || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Google Play Store (Android)</span>
                    <span className="text-white">₹{metrics?.platform_breakdown?.android?.revenue?.toLocaleString('en-IN') || 0} ({metrics?.platform_breakdown?.android?.transactions || 0} tx)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(10, ((metrics?.platform_breakdown?.android?.revenue || 0) / Math.max(1, metrics?.kpis?.gross_revenue || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Commission & Net Margins */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Financial Margins & Fees (RevenueCat Tier)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-slate-400">Gross Billed to Couples</span>
                  <span className="font-bold text-white">₹{metrics?.kpis?.gross_revenue?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-slate-400">Estimated App Store Fee (15%)</span>
                  <span className="font-bold text-amber-400">-₹{metrics?.kpis?.platform_fees?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="text-slate-400">Total Customer Refunds</span>
                  <span className="font-bold text-rose-400">-₹{metrics?.kpis?.refunded_amount?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-bold">
                  <span className="text-emerald-300">Net Retained Revenue</span>
                  <span className="text-emerald-400">₹{metrics?.kpis?.net_revenue?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 30-Day Daily Revenue Trend */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              30-Day Daily Revenue Trend (INR ₹)
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {metrics?.daily_trend?.map((d) => (
                <div key={d.date} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 transition-colors text-xs">
                  <span className="font-mono text-slate-400">{d.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-300">{d.transactions} orders</span>
                    <span className="font-bold text-emerald-400">₹{d.gross}</span>
                    {d.refunds > 0 && <span className="font-bold text-rose-400">-₹{d.refunds}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GRANT COMPLIMENTARY SEASON PASS ──────────────────────────── */}
      {grantModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Grant Complimentary Season Pass</h3>
                  <p className="text-xs text-slate-400">Upgrade couple room with zero payment charge.</p>
                </div>
              </div>
              <button onClick={() => setGrantModal({ open: false })} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitGrant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Couple Room ID (UUID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0a8d7be9-2491-48e4-b81f-01aab46b9087"
                  value={grantForm.roomId}
                  onChange={(e) => setGrantForm({ ...grantForm, roomId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Season Number</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={grantForm.seasonNumber}
                    onChange={(e) => setGrantForm({ ...grantForm, seasonNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={grantForm.durationDays}
                    onChange={(e) => setGrantForm({ ...grantForm, durationDays: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Mandatory Business Reason (min 5 chars)</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Influencer campaign gift / customer support outage compensation..."
                  value={grantForm.reason}
                  onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGrantModal({ open: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGranting}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                  Confirm Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
