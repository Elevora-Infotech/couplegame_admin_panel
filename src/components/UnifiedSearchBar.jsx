import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Users, HeartHandshake, CreditCard, ChevronRight, X } from 'lucide-react';
import { adminOperationsApi } from '../api/adminOperationsApi';
import { useTheme } from '../context/ThemeContext';

export default function UnifiedSearchBar() {
  const { isDark } = useTheme();
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
          className={`w-full pl-10 pr-9 py-2 border rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#256df2]/50 transition-all shadow-inner ${
            isDark
              ? 'bg-[#181926] hover:bg-[#1d1f30] focus:bg-[#13141f] border-white/10 text-white placeholder-slate-500'
              : 'bg-slate-100 hover:bg-slate-200/70 focus:bg-white border-slate-300 text-slate-900 placeholder-slate-400'
          }`}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); setIsOpen(false); }}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Results Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 right-0 mt-2 backdrop-blur-2xl border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[75vh] overflow-y-auto custom-scrollbar animate-in fade-in duration-150 ${
          isDark ? 'bg-[#0B0F19]/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          {!hasResults ? (
            <div className={`p-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No matching couples, players, or payments found for "{query}".
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {/* Couples Category */}
              {results.couples && results.couples.length > 0 && (
                <div>
                  <div className={`text-[11px] font-extrabold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5 ${
                    isDark ? 'text-violet-400' : 'text-violet-600'
                  }`}>
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Couples ({results.couples.length})
                  </div>
                  <div className="space-y-1">
                    {results.couples.map((c) => (
                      <div
                        key={c.couple_id}
                        onClick={() => handleSelectCouple(c.couple_id)}
                        className={`p-2.5 rounded-xl border border-transparent transition-colors cursor-pointer flex items-center justify-between group ${
                          isDark ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-violet-500 text-xs bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                              {c.room_code}
                            </span>
                            <span className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {c.partner_1?.name || 'Partner 1'} & {c.partner_2?.name || 'Partner 2'}
                            </span>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              c.mode === 'paid' ? 'bg-amber-500/20 text-amber-500' : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700')
                            }`}>
                              {c.mode}
                            </span>
                          </div>
                          <div className={`text-xs mt-0.5 flex gap-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span>Phone: {c.partner_1?.phone_masked || '—'}</span>
                            <span>Status: {c.status}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${
                          isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players Category */}
              {results.players && results.players.length > 0 && (
                <div>
                  <div className={`text-[11px] font-extrabold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    <Users className="w-3.5 h-3.5" />
                    Players ({results.players.length})
                  </div>
                  <div className="space-y-1">
                    {results.players.map((p) => (
                      <div
                        key={p.player_id}
                        onClick={() => handleSelectPlayer(p.player_id)}
                        className={`p-2.5 rounded-xl border border-transparent transition-colors cursor-pointer flex items-center justify-between group ${
                          isDark ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</span>
                            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>({p.email_masked})</span>
                            <span className={`text-[10px] uppercase px-1.5 rounded ${isDark ? 'text-slate-400 bg-white/5' : 'text-slate-600 bg-slate-200'}`}>{p.platform}</span>
                          </div>
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            Phone: <span className="font-mono">{p.phone_masked || '—'}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${
                          isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Category */}
              {results.payments && results.payments.length > 0 && (
                <div>
                  <div className={`text-[11px] font-extrabold uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5 ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    <CreditCard className="w-3.5 h-3.5" />
                    Payments ({results.payments.length})
                  </div>
                  <div className="space-y-1">
                    {results.payments.map((py) => (
                      <div
                        key={py.purchase_id}
                        onClick={() => { setIsOpen(false); navigate('/purchases'); }}
                        className={`p-2.5 rounded-xl border border-transparent transition-colors cursor-pointer flex items-center justify-between group ${
                          isDark ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>₹{py.amount_paid}</span>
                            <span className={`text-xs font-mono truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{py.store_transaction_id || py.purchase_id}</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-1.5 rounded">{py.status}</span>
                          </div>
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {py.payment_source} • {py.created_at_ist}
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'} transition-transform`} />
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
