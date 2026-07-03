import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Brain, RefreshCw, Search, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

const SCORE_COLORS = {
  CHAMPION: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ACTIVE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  AT_RISK: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  CHURNED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  UNSCORED: 'bg-slate-800 text-slate-400 border-slate-700',
};

function ScoreBar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-300 font-mono w-8">{value}</span>
    </div>
  );
}

export default function BehavioralScoring() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('overall_score');

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/intelligence/behavioral-scores');
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load behavioral scores');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = React.useMemo(() => {
    let d = [...users];
    if (filter !== 'ALL') d = d.filter(u => u.score_label === filter);
    if (search) d = d.filter(u => u.user_name?.toLowerCase().includes(search.toLowerCase()));
    return d.sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]));
  }, [users, filter, search, sortKey]);

  const labelCounts = React.useMemo(() => ({
    CHAMPION: users.filter(u => u.score_label === 'CHAMPION').length,
    ACTIVE: users.filter(u => u.score_label === 'ACTIVE').length,
    AT_RISK: users.filter(u => u.score_label === 'AT_RISK').length,
    CHURNED: users.filter(u => u.score_label === 'CHURNED').length,
  }), [users]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-violet-500" />
            Behavioral Scoring Engine
          </h1>
          <p className="text-slate-400 mt-1">Real-time engagement scores computed from actual user activity patterns.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Recalculate
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(labelCounts).map(([label, count]) => (
          <button key={label} onClick={() => setFilter(filter === label ? 'ALL' : label)}
            className={`p-4 rounded-2xl border text-left transition-all ${SCORE_COLORS[label]} ${filter === label ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''}`}>
            <div className="text-2xl font-black">{count}</div>
            <div className="text-xs font-bold mt-1 uppercase tracking-wider">{label}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex gap-3 bg-slate-900/50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users..." className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500" />
          </div>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500">
            <option value="overall_score">Sort: Overall</option>
            <option value="engagement_score">Sort: Engagement</option>
            <option value="risk_score">Sort: Risk</option>
            <option value="initiation_score">Sort: Initiation</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">Overall</th>
                <th className="px-4 py-3 text-left">Engagement</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left">Initiation</th>
                <th className="px-4 py-3 text-left">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-violet-500">Computing scores...</td></tr>
              ) : filtered.map(u => (
                <tr key={u.user_id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                        {u.user_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-white font-medium">{u.user_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${SCORE_COLORS[u.score_label]}`}>{u.score_label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${u.overall_score}%` }} />
                      </div>
                      <span className="text-violet-400 font-bold text-xs">{u.overall_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><ScoreBar value={u.engagement_score} color="bg-blue-500" /></td>
                  <td className="px-4 py-3"><ScoreBar value={u.risk_score} color="bg-rose-500" /></td>
                  <td className="px-4 py-3"><ScoreBar value={u.initiation_score} color="bg-amber-500" /></td>
                  <td className="px-4 py-3"><ScoreBar value={u.response_score} color="bg-emerald-500" /></td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
