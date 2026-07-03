import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Lightbulb, ShieldAlert, Users, TrendingUp, Trophy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const SEGMENT_CONFIG = {
  CHAMPION: { color: 'bg-emerald-500', label: 'Champions', icon: Trophy },
  ACTIVE: { color: 'bg-blue-500', label: 'Active', icon: TrendingUp },
  AT_RISK: { color: 'bg-amber-500', label: 'At Risk', icon: ShieldAlert },
  CHURNED: { color: 'bg-rose-500', label: 'Churned', icon: Users },
};

export default function InsightDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/intelligence/insights');
      setData(res.data.data);
    } catch { toast.error('Failed to load insights'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="p-8 h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-slate-400">Crunching intelligence data...</p>
      </div>
    </div>
  );

  const totalSegments = Object.values(data?.userSegments || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
            Insight Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Single-view intelligence summary: KPIs, user segments, risks, and champions.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {data?.kpis?.map((kpi, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:border-yellow-500/30 transition-colors">
            <div className="text-xl font-black text-white">{kpi.kpi_value}</div>
            <div className="text-xs text-slate-500 mt-1 leading-tight">{kpi.kpi_name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Segment Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" /> User Segments
          </h2>
          <div className="flex h-4 rounded-full overflow-hidden mb-5">
            {Object.entries(data?.userSegments || {}).map(([label, count]) => (
              <div key={label} className={`${SEGMENT_CONFIG[label]?.color || 'bg-slate-700'} transition-all`}
                style={{ width: `${totalSegments > 0 ? (count / totalSegments) * 100 : 0}%` }}
                title={`${label}: ${count}`} />
            ))}
          </div>
          <div className="space-y-2">
            {Object.entries(SEGMENT_CONFIG).map(([label, cfg]) => {
              const Icon = cfg.icon;
              const count = data?.userSegments?.[label] || 0;
              return (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                    <span className="text-sm text-slate-300">{cfg.label}</span>
                  </div>
                  <span className="font-bold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" /> Risk Overview
          </h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${(data?.criticalRisks || 0) > 0 ? 'bg-red-600/5 border-red-600/20' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className={`text-3xl font-black ${(data?.criticalRisks || 0) > 0 ? 'text-red-400' : 'text-slate-400'}`}>{data?.criticalRisks || 0}</div>
              <div className="text-sm text-slate-400 mt-1">Critical Alerts</div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="text-3xl font-black text-amber-400">{data?.riskAlerts || 0}</div>
              <div className="text-sm text-slate-400 mt-1">Total Risk Flags</div>
            </div>
          </div>
        </div>

        {/* Champions & At-Risk Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" /> Top Users
          </h2>
          <div className="space-y-2 mb-4">
            {data?.topChampions?.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">{u.user_name?.charAt(0)}</div>
                  <span className="text-sm text-slate-300 truncate max-w-[100px]">{u.user_name}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{u.overall_score}</span>
              </div>
            ))}
          </div>
          {data?.atRiskUsers?.length > 0 && (
            <>
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Needs Attention</div>
              <div className="space-y-2">
                {data.atRiskUsers.slice(0, 3).map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                    <span className="text-sm text-slate-400 truncate max-w-[120px]">{u.user_name}</span>
                    <span className="text-xs font-bold text-rose-400">{u.score_label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
