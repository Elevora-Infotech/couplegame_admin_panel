import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { GitBranch, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContentVersioning() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [cardIdFilter, setCardIdFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = cardIdFilter ? `?cardId=${cardIdFilter}` : '';
      const res = await axiosInstance.get(`/admin/intelligence/card-versions${params}`);
      setVersions(res.data.data || []);
    } catch { toast.error('Failed to load version history'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Group by card
  const grouped = React.useMemo(() => {
    const map = {};
    versions.forEach(v => {
      if (!map[v.card_id]) map[v.card_id] = { card_id: v.card_id, name: v.name, versions: [] };
      map[v.card_id].versions.push(v);
    });
    return Object.values(map);
  }, [versions]);

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-lime-500" />
            Content Versioning
          </h1>
          <p className="text-slate-400 mt-1">Full audit trail of every change made to cards, including what changed and who changed it.</p>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Filter by Card ID..." value={cardIdFilter} onChange={e => setCardIdFilter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-lime-500" />
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-lime-500">Loading version history...</div>
      ) : grouped.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No version history found. Card version snapshots will appear here after the first card edit.
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(card => (
            <div key={card.card_id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button onClick={() => toggle(card.card_id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-lime-500" />
                  <span className="font-semibold text-white">{card.name || 'Unnamed Card'}</span>
                  <span className="text-xs text-slate-500 font-mono">{card.card_id.split('-')[0]}...</span>
                  <span className="text-xs px-2 py-0.5 bg-lime-500/10 text-lime-400 border border-lime-500/20 rounded-md font-bold">
                    {card.versions.length} version{card.versions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {expanded[card.card_id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {expanded[card.card_id] && (
                <div className="border-t border-slate-800 divide-y divide-slate-800/50">
                  {card.versions.map(v => (
                    <div key={v.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-lime-500 ring-2 ring-lime-500/20" />
                        <div className="w-px flex-1 bg-slate-800 mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-sm font-bold text-white">Version {v.version_number}</span>
                          <span className="text-xs text-slate-400">{new Date(v.created_at).toLocaleString()}</span>
                          {v.admins?.name && <span className="text-xs text-lime-400">by {v.admins.name}</span>}
                        </div>
                        {v.change_reason && <p className="text-sm text-slate-300 mb-2">📝 {v.change_reason}</p>}
                        <details className="group">
                          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Show snapshot JSON</summary>
                          <pre className="mt-2 text-xs text-slate-400 bg-slate-950 rounded-xl p-3 overflow-x-auto">
                            {JSON.stringify(v.snapshot_json, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
