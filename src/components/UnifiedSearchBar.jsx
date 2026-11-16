import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Users, HeartHandshake, CreditCard, ChevronRight, X } from 'lucide-react';
import { adminOperationsApi } from '../api/adminOperationsApi';

export default function UnifiedSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Debounced Search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await adminOperationsApi.search(query.trim());
        if (res.data?.status === 'success') {
          setResults(res.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Unified search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCouple = (roomId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/couple/${roomId}`);
  };

  const handleSelectPlayer = (userId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/player/${userId}`);
  };

  const hasResults = results && (
    (results.couples && results.couples.length > 0) ||
    (results.players && results.players.length > 0) ||
    (results.payments && results.payments.length > 0)
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results) setIsOpen(true); }}
          placeholder="Global Search (Name, Email, Masked Phone, Room 4821, UUID, Payment ID)..."
          className="w-full pl-10 pr-9 py-2 bg-[#181926] hover:bg-[#1d1f30] focus:bg-[#13141f] border border-white/10 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#256df2]/50 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[75vh] overflow-y-auto custom-scrollbar animate-in fade-in duration-150">
          {!hasResults ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching couples, players, or payments found for "{query}".
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {/* Couples Category */}
              {results.couples && results.couples.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold text-violet-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Couples ({results.couples.length})
                  </div>
                  <div className="space-y-1">
                    {results.couples.map((c) => (
                      <div
                        key={c.couple_id}
                        onClick={() => handleSelectCouple(c.couple_id)}
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-violet-300 text-xs bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                              {c.room_code}
                            </span>
                            <span className="text-sm font-semibold text-white truncate">
                              {c.partner_1?.name || 'Partner 1'} & {c.partner_2?.name || 'Partner 2'}
                            </span>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              c.mode === 'paid' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {c.mode}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex gap-3">
                            <span>Phone: {c.partner_1?.phone_masked || '—'}</span>
                            <span>Status: {c.status}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players Category */}
              {results.players && results.players.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Players ({results.players.length})
                  </div>
                  <div className="space-y-1">
                    {results.players.map((p) => (
                      <div
                        key={p.player_id}
                        onClick={() => handleSelectPlayer(p.player_id)}
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{p.name}</span>
                            <span className="text-xs text-slate-400 font-mono">({p.email_masked})</span>
                            <span className="text-[10px] text-slate-400 uppercase bg-white/5 px-1.5 rounded">{p.platform}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Phone: <span className="font-mono">{p.phone_masked || '—'}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Category */}
              {results.payments && results.payments.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Payments ({results.payments.length})
                  </div>
                  <div className="space-y-1">
                    {results.payments.map((py) => (
                      <div
                        key={py.purchase_id}
                        onClick={() => { setIsOpen(false); navigate('/purchases'); }}
                        className="p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-amber-300">₹{py.amount_paid}</span>
                            <span className="text-xs text-slate-300 font-mono truncate">{py.store_transaction_id || py.purchase_id}</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded">{py.status}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {py.payment_source} • {py.created_at_ist}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
