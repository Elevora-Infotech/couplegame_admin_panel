import React, { useState, useEffect } from 'react';
import { 
  GitBranch, RefreshCw, ArrowRight, Clock, ShieldCheck, User, 
  FileText, Sparkles, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminContentApi } from '../api/adminContentApi';

export default function ContentVersioning() {
  const [diffs, setDiffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDiffs = async () => {
    try {
      setLoading(true);
      const res = await adminContentApi.getContentDiffs({ limit: 50 });
      if (res.data?.status === 'success') {
        setDiffs(res.data.data.diffs || []);
      }
    } catch (err) {
      toast.error('Failed to load content version diffs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiffs();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-lime-500/20 text-lime-400 border border-lime-500/30">
              <GitBranch className="w-6 h-6" />
            </div>
            Content Versioning & Prompt Diffs (Part C6)
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Immutable version audit trail tracking every card prompt edit, spice rating change, and author justification.
          </p>
        </div>
        <button
          onClick={fetchDiffs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Diffs List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-lime-400">
          Loading content version history...
        </div>
      ) : diffs.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl border border-white/10">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30 text-lime-400" />
          <p className="text-sm">No card version diffs logged yet.</p>
          <p className="text-xs text-slate-600 mt-1">When an admin edits a card prompt in the Card Catalog, the side-by-side snapshot diff will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {diffs.map((diff) => {
            const beforePrompt = diff.before?.prompt;
            const afterPrompt = diff.after?.prompt;
            const beforeVersion = diff.before?.version || 1;
            const afterVersion = diff.after?.version || beforeVersion + 1;

            return (
              <div key={diff.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 font-mono font-bold text-[10px] border border-lime-500/30">
                      {diff.action}
                    </span>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {diff.admin_name}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {diff.created_at_ist}
                  </span>
                </div>

                {/* Business Reason */}
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Author Justification:</span>
                  <p className="text-slate-200 italic">"{diff.reason}"</p>
                </div>

                {/* Side-by-Side Prompt Diff */}
                {diff.action === 'UPDATE_CARD_PROMPT_VERSION' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Previous Snapshot */}
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-400 font-bold uppercase text-[10px]">Previous Prompt</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">v{beforeVersion}</span>
                      </div>
                      <p className="text-slate-300 line-through opacity-80">{beforePrompt || '—'}</p>
                    </div>

                    {/* New Version */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">Updated Prompt</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">v{afterVersion}</span>
                      </div>
                      <p className="text-slate-100 font-medium">{afterPrompt || '—'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
