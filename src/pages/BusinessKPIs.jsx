import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { TrendingUp, RefreshCw, ArrowUp, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Growth: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Engagement: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Quality: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function BusinessKPIs() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/intelligence/kpis');
      setKpis(res.data.data || []);
    } catch { toast.error('Failed to load KPIs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const grouped = React.useMemo(() => {
    const map = {};
    kpis.forEach(k => {
      if (!map[k.kpi_category]) map[k.kpi_category] = [];
      map[k.kpi_category].push(k);
    });
    return map;
  }, [kpis]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            Business KPI Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Live business health metrics including retention rates, engagement, and content quality.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-emerald-500">Loading KPIs...</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 px-1 ${CATEGORY_COLORS[category]?.split(' ')[0] || 'text-slate-400'}`}>
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((kpi, i) => (
                  <div key={i} className={`bg-slate-900 border rounded-2xl p-6 flex flex-col gap-3 hover:scale-[1.02] transition-transform ${CATEGORY_COLORS[kpi.kpi_category] ? 'border-' + CATEGORY_COLORS[kpi.kpi_category].split('border-')[1] : 'border-slate-800'}`}>
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-slate-400 font-medium">{kpi.kpi_name}</p>
                      {kpi.kpi_trend === 'UP' && <ArrowUp className="w-4 h-4 text-emerald-400" />}
                      {kpi.kpi_trend === 'FLAT' && <ArrowRight className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="text-3xl font-black text-white">{kpi.kpi_value}</div>
                    {kpi.kpi_trend !== 'N/A' && (
                      <div className={`text-xs font-semibold ${kpi.kpi_trend === 'UP' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {kpi.kpi_trend === 'UP' ? '↑ Growing' : '→ Stable'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
