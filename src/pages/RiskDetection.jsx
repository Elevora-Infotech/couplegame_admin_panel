import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, RefreshCw, AlertTriangle, ExternalLink, Clock, 
  HeartHandshake, ShieldCheck, Flag 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminIntelligenceApi } from '../api/adminIntelligenceApi';

export default function RiskDetection() {
  const navigate = useNavigate();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const res = await adminIntelligenceApi.getRiskDetection();
      if (res.data?.status === 'success') {
        setFlags(res.data.data.flagged_rooms || []);
      }
    } catch (err) {
      toast.error('Failed to load risk detection flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const mediumRisks = flags.filter(f => f.risk_level === 'MEDIUM').length;
  const criticalRisks = flags.filter(f => f.risk_level === 'HIGH' || f.risk_level === 'CRITICAL').length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            Risk Detection & Friction Monitor (Part C4)
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Proactive alerts identifying couples experiencing friction, prolonged stall, or repeated deflections.
          </p>
        </div>
        <button
          onClick={fetchRisks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5">
          <div className="text-3xl font-black text-rose-400">{criticalRisks}</div>
          <div className="text-sm font-bold text-slate-300 mt-1">High Risk Alerts</div>
          <p className="text-xs text-slate-500 mt-0.5">Consecutive deflections or severe stall</p>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="text-3xl font-black text-amber-400">{mediumRisks}</div>
          <div className="text-sm font-bold text-slate-300 mt-1">Medium Friction Alerts</div>
          <p className="text-xs text-slate-500 mt-0.5">Inactivity over 5 days during active season</p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
          <div className="text-3xl font-black text-emerald-400">{flags.length - criticalRisks - mediumRisks}</div>
          <div className="text-sm font-bold text-slate-300 mt-1">Optimal Couples</div>
          <p className="text-xs text-slate-500 mt-0.5">Normal reciprocity and dare completion</p>
        </div>
      </div>

      {/* Flagged Couples Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h2 className="font-semibold text-white text-sm">
            {loading ? 'Scanning couple activities…' : `${flags.length} Monitored Couples`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-orange-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : flags.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-40" />
            <p className="text-sm">No risk alerts detected. All couples playing smoothly.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-white/[0.02]">
                  <th className="px-6 py-3.5 text-left">Room Code</th>
                  <th className="px-6 py-3.5 text-left">Partners</th>
                  <th className="px-6 py-3.5 text-left">Risk Level</th>
                  <th className="px-6 py-3.5 text-left">Friction Trigger / Reason</th>
                  <th className="px-6 py-3.5 text-left">Last Active</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {flags.map((item) => (
                  <tr key={item.room_id} className="hover:bg-white/[0.03] transition-all">
                    {/* Room Code */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white text-sm">{item.room_code}</span>
                    </td>

                    {/* Partners */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-200 text-xs">{item.host_name} & {item.partner_name}</p>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        item.risk_level === 'HIGH' || item.risk_level === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : item.risk_level === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {item.risk_level}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-300">{item.risk_reason}</span>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {item.last_active_ist}
                    </td>

                    {/* Jump Link to Couple Workbench */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/couple/${item.room_id}`)}
                        className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 font-semibold text-xs border border-violet-500/30 transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        Open Couple
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
  );
}
