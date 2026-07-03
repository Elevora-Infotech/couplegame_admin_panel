import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITY_STYLES = {
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  CRITICAL: 'bg-red-600/10 text-red-400 border-red-600/30',
};

const RISK_LABEL_STYLES = {
  ONE_SIDED_GAMEPLAY: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DISENGAGED_USER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function RiskDetection() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/intelligence/risk-detection');
      setRisks(res.data.data || []);
    } catch { toast.error('Failed to load risk data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? risks : risks.filter(r => r.risk_category === filter);

  const counts = React.useMemo(() => ({
    ONE_SIDED_GAMEPLAY: risks.filter(r => r.risk_category === 'ONE_SIDED_GAMEPLAY').length,
    DISENGAGED_USER: risks.filter(r => r.risk_category === 'DISENGAGED_USER').length,
    CRITICAL: risks.filter(r => r.risk_severity === 'CRITICAL').length,
  }), [risks]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-orange-500" />
            Risk Detection
          </h1>
          <p className="text-slate-400 mt-1">Identifies couples showing one-sided gameplay, disengagement, or at-risk patterns.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-600/5 border border-red-600/20 rounded-2xl p-5">
          <div className="text-3xl font-black text-red-400">{counts.CRITICAL}</div>
          <div className="text-sm text-slate-400 mt-1">Critical Alerts</div>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5">
          <div className="text-3xl font-black text-orange-400">{counts.ONE_SIDED_GAMEPLAY}</div>
          <div className="text-sm text-slate-400 mt-1">One-Sided Gameplay</div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
          <div className="text-3xl font-black text-blue-400">{counts.DISENGAGED_USER}</div>
          <div className="text-sm text-slate-400 mt-1">Disengaged Users</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'ONE_SIDED_GAMEPLAY', 'DISENGAGED_USER'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filter === f ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Risk List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-orange-500">Scanning for risks...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <div key={i} className={`bg-slate-900 border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${SEVERITY_STYLES[r.risk_severity]?.replace('bg-', 'border-') || 'border-slate-800'}`}>
              <div className="flex items-center gap-4">
                <ShieldAlert className={`w-6 h-6 shrink-0 ${r.risk_severity === 'CRITICAL' ? 'text-red-400' : r.risk_severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`} />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${RISK_LABEL_STYLES[r.risk_category] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {r.risk_category?.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${SEVERITY_STYLES[r.risk_severity]}`}>
                      {r.risk_severity}
                    </span>
                  </div>
                  <div className="font-semibold text-white">{r.user_name} & {r.partner_name}</div>
                  <div className="text-sm text-slate-400 mt-1">{r.detail}</div>
                </div>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No risks detected. All couples are healthy! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
}
