import React, { useState, useEffect } from 'react';
import {
  TrendingUp, AlertCircle, CheckCircle2, AlertTriangle, RefreshCw,
  Sparkles, DollarSign, Users, Award, Compass, ArrowUpRight, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSoftLaunchMetrics } from '../api/adminSettingsApi';

export default function SoftLaunchDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSoftLaunchMetrics();
      setData(res);
    } catch (err) {
      toast.error('Failed to load soft-launch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Evaluating soft-launch unit economics & cohorts...</p>
        </div>
      </div>
    );
  }

  const decision = data?.decision_box || {};
  const cohorts = data?.cohorts || [];
  const benchmarks = data?.live_benchmarks || {};

  const verdictStyles = {
    GREEN: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
      shadow: 'shadow-emerald-900/20',
    },
    YELLOW: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
      shadow: 'shadow-amber-900/20',
    },
    RED: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: AlertCircle,
      shadow: 'shadow-rose-900/20',
    },
  };

  const currentStyle = verdictStyles[decision.verdict_color] || verdictStyles.GREEN;
  const VerdictIcon = currentStyle.icon;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Growth Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Soft-Launch Decision Engine</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Weekly IST performance cohorts, break-even unit economics, and algorithmic Go / Fix / Rethink verdicts (Part B5, C10–C11).
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 font-bold text-xs transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Engine
        </button>
      </div>

      {/* DECISION VERDICT BOX (Weeks 5 to 8) */}
      <div className={`p-6 md:p-8 rounded-3xl border ${currentStyle.bg} ${currentStyle.shadow} shadow-2xl relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${currentStyle.badge}`}>
                {decision.window_weeks} Decision Window
              </span>
              <span className="text-xs text-slate-400 font-semibold">IST Reporting Timezone</span>
            </div>

            <div className="flex items-center gap-3">
              <VerdictIcon className="w-8 h-8 shrink-0" />
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {decision.verdict_title}
              </h2>
            </div>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {decision.verdict_summary}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Avg Cost / Couple</p>
              <p className="text-lg font-black text-white mt-0.5">₹{decision.avg_cost_per_paired_couple}</p>
              <p className="text-[9px] text-slate-500">Benchmark: &le; ₹100</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Conversion Rate ⭐</p>
              <p className="text-lg font-black text-white mt-0.5">{decision.avg_conversion_rate_pct}%</p>
              <p className="text-[9px] text-emerald-400">Target: &ge; 8.0%</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Played Rate ⭐</p>
              <p className="text-lg font-black text-white mt-0.5">{decision.avg_played_rate_pct}%</p>
              <p className="text-[9px] text-slate-500">&ge; 7 of 14 cards</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Break-Even CAC</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">₹{decision.break_even_cost_inr}</p>
              <p className="text-[9px] text-slate-500">Net ₹{decision.net_received_per_couple_inr}</p>
            </div>
          </div>
        </div>

        {/* Diagnosis Helper if RED */}
        {decision.diagnosis && (
          <div className="mt-6 pt-6 border-t border-rose-500/20 bg-rose-950/30 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-6 md:p-8 rounded-b-3xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/30 text-rose-200">
                    Diagnosis: {decision.diagnosis.locus}
                  </span>
                  <h4 className="text-sm font-bold text-white">{decision.diagnosis.title}</h4>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">{decision.diagnosis.explanation}</p>
                <p className="text-xs text-emerald-300 font-semibold pt-1">
                  <span className="text-slate-400 font-normal">Recommended Prescription:</span> {decision.diagnosis.action_item}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8-WEEK COHORT METRICS TABLE */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-xl">
        <div className="p-5 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" /> 8-Week Cohort Performance Matrix (IST)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive tracking of acquisition spend, free-game completions, and paying conversions</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-500"></span> Weeks 5–8 (Verdict Window)
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Week</th>
                <th className="py-3.5 px-4">Date Range (IST)</th>
                <th className="py-3.5 px-4">Ad Spend (₹)</th>
                <th className="py-3.5 px-4">Paired Couples</th>
                <th className="py-3.5 px-4">Cost / Couple</th>
                <th className="py-3.5 px-4">Free Started / Ended</th>
                <th className="py-3.5 px-4">Played Rate ⭐</th>
                <th className="py-3.5 px-4">Conversion Rate ⭐</th>
                <th className="py-3.5 px-4">New Paying</th>
                <th className="py-3.5 px-4">Renewals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
              {cohorts.map((c) => {
                const isDecision = c.is_decision_window;
                return (
                  <tr key={c.week_number} className={`hover:bg-white/[0.02] transition-colors ${
                    isDecision ? 'bg-violet-500/[0.04]' : ''
                  }`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">Week {c.week_number}</span>
                        {isDecision && (
                          <span className="text-[9px] font-black bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">
                            Window
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{c.date_range_ist}</td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{c.ad_spend_inr?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{c.paired_couples_ad + c.paired_couples_organic}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">({c.paired_couples_ad} ad / {c.paired_couples_organic} org)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${
                        c.cost_per_paired_couple <= 100 ? 'text-emerald-400' : c.cost_per_paired_couple <= 150 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        ₹{c.cost_per_paired_couple}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{c.free_games_started} / {c.free_games_ended}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${c.free_games_played_rate_pct >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {c.free_games_played_rate_pct}%
                        </span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${c.free_games_played_rate_pct >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, c.free_games_played_rate_pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-black px-2 py-0.5 rounded ${
                        c.conversion_per_free_game_pct >= 8.0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : c.conversion_per_free_game_pct >= 5.0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {c.conversion_per_free_game_pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{c.new_paying_couples}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{c.renewals_count}</span>
                      <span className="text-[10px] text-slate-500 ml-1">({c.renewals_rate_pct}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BENCHMARKS FOOTER CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Cost Per Paired Couple</h4>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> &le; ₹100: Viable / High Profit Margin</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> ₹100 – ₹150: Marginal (Optimize Creative)</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> &gt; ₹150: Unsustainable Unit Economics</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Conversion per Free Game ⭐</h4>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> &ge; 8.0%: Green Target Threshold</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 5.0% – 8.0%: Acceptable Minimum</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt; 5.0%: Requires Paywall Review</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Free Game Played Rate ⭐</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Measures the percentage of couples who completed at least 7 of the 14 dealt cards. A healthy threshold of <span className="text-emerald-400 font-bold">&ge; 50%</span> indicates strong initial engagement before the paywall pitch.
          </p>
        </div>
      </div>

    </div>
  );
}
