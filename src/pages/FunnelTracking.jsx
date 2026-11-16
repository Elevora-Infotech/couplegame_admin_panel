import React, { useState, useEffect } from 'react';
import { 
  Filter, ChevronRight, Activity, TrendingUp, Eye, CheckCircle2, 
  ShieldAlert, RefreshCw, Smartphone, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRevenueApi } from '../api/adminRevenueApi';

export default function FunnelTracking() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const res = await adminRevenueApi.getPaywallFunnel();
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load paywall funnel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Filter className="w-6 h-6" />
            </div>
            Paywall Conversion & Funnel Tracking
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Real-time couple onboarding, paywall impressions, trigger screen performance, and renewal funnel.
          </p>
        </div>
        <button
          onClick={fetchFunnelData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Funnel
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Paywall Views</p>
          <p className="text-2xl md:text-3xl font-black text-white mt-1">
            {data?.summary?.total_views || 0}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across all mobile surfaces</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Paywall Paid Conversions</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">
            {data?.summary?.conversions_paid || 0}
          </p>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">Purchased Season Pass</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Conversion Rate</p>
          <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mt-1">
            {data?.summary?.conversion_rate || 0}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Impression to Paid</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Replayed Free / Closed</p>
          <p className="text-2xl md:text-3xl font-black text-slate-400 mt-1">
            {(data?.summary?.conversions_replayed_free || 0) + (data?.summary?.closed_without_action || 0)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Non-paying drop-offs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Complete 6-Stage Conversion Funnel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Full Lifecycle Conversion Funnel
          </h2>

          <div className="space-y-4">
            {data?.funnel_stages?.map((stage, i) => (
              <div key={i} className="relative group">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{stage.count} couples</span>
                    {i > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
                        -{stage.dropoff_rate}% drop
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, (stage.count / Math.max(1, data.funnel_stages[0]?.count || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger Surface Performance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Paywall Trigger Screen Performance
          </h2>

          <div className="space-y-4">
            {(!data?.by_trigger || data.by_trigger.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No trigger events recorded yet.
              </div>
            ) : (
              data.by_trigger.map((t, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      {t.trigger.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {t.views} views · {t.conversions} purchases
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">
                      {t.conversion_rate}%
                    </span>
                    <p className="text-[10px] text-slate-500">Conv. Rate</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
