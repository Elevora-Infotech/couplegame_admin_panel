import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Filter, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FunnelTracking() {
  const [data, setData] = useState({ funnel: [], retention: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/admin/dashboard/growth-analytics');
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load funnel data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Filter className="w-8 h-8 text-emerald-500" />
            Funnel Tracking & Retention
          </h1>
          <p className="text-slate-400 mt-1">Track the exact journey from install to first card played.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-emerald-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversion Funnel */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Onboarding Funnel
            </h2>
            <div className="space-y-4">
              {data.funnel?.map((step, i) => (
                <div key={i} className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">{step.step_name}</span>
                    <span className="text-sm font-bold text-white">{step.user_count} Users</span>
                  </div>
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${step.conversion_rate}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right">
                    <span className="text-xs text-emerald-400 font-semibold">{step.conversion_rate}% Conversion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Cohorts */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Monthly Retention (Day 3 / 7 / 30)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                    <th className="pb-3 font-medium">Cohort</th>
                    <th className="pb-3 font-medium text-center">Total</th>
                    <th className="pb-3 font-medium text-center">Day 3</th>
                    <th className="pb-3 font-medium text-center">Day 7</th>
                    <th className="pb-3 font-medium text-center">Day 30</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.retention?.map((r, i) => (
                    <tr key={i} className="text-sm text-slate-300">
                      <td className="py-3">{r.cohort}</td>
                      <td className="py-3 text-center font-semibold text-white">{r.total_users}</td>
                      <td className="py-3 text-center">
                        <span className="text-emerald-400">{r.d3_retained}</span>
                        <span className="text-slate-600 text-xs ml-1">({Math.round((r.d3_retained/r.total_users)*100)}%)</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-blue-400">{r.d7_retained}</span>
                        <span className="text-slate-600 text-xs ml-1">({Math.round((r.d7_retained/r.total_users)*100)}%)</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-purple-400">{r.d30_retained}</span>
                        <span className="text-slate-600 text-xs ml-1">({Math.round((r.d30_retained/r.total_users)*100)}%)</span>
                      </td>
                    </tr>
                  ))}
                  {(!data.retention || data.retention.length === 0) && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">No retention data available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
