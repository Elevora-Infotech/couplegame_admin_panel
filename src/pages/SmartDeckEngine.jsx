import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SmartDeckEngine() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/intelligence/smart-deck');
      setRecs(res.data.data || []);
    } catch { toast.error('Failed to load recommendations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Group by user
  const grouped = React.useMemo(() => {
    const map = {};
    recs.forEach(r => {
      if (!map[r.user_id]) map[r.user_id] = { user_name: r.user_name, user_id: r.user_id, recs: [] };
      map[r.user_id].recs.push(r);
    });
    return Object.values(map);
  }, [recs]);

  const users = grouped;
  const displayedUser = selectedUser || users[0];
  const displayedRecs = grouped.find(g => g.user_id === displayedUser?.user_id)?.recs || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-cyan-500" />
            Smart Deck Engine
          </h1>
          <p className="text-slate-400 mt-1">Personalized card recommendations per user based on engagement gaps.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-cyan-500">Analyzing engagement patterns...</div>
      ) : (
        <div className="flex gap-6">
          {/* User List */}
          <div className="w-64 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-fit">
            <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">Users</div>
            <div className="max-h-[500px] overflow-y-auto">
              {users.map(u => (
                <button key={u.user_id} onClick={() => setSelectedUser(u)}
                  className={`w-full px-4 py-3 text-left border-b border-slate-800/50 flex items-center gap-3 transition-colors ${
                    displayedUser?.user_id === u.user_id ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-slate-800/50'
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                    {u.user_name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.user_name}</div>
                    <div className="text-xs text-slate-500">{u.recs.length} suggestions</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="flex-1 space-y-4">
            {displayedUser && (
              <div className="text-lg font-semibold text-white">
                Recommendations for <span className="text-cyan-400">{displayedUser.user_name}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedRecs.map((rec, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-base font-bold text-white">{rec.recommended_category}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                      rec.cards_played_in_category == 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {rec.cards_played_in_category == 0 ? 'UNTRIED' : 'LOW PLAY'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{rec.reason}</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{rec.cards_in_category} cards in category</span>
                    <span>{rec.cards_played_in_category} played</span>
                  </div>
                  <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (Number(rec.cards_played_in_category) / Math.max(1, Number(rec.cards_in_category))) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
