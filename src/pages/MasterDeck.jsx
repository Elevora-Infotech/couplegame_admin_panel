import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Layers, Plus, Trash2, X, Loader2, Search,
  Shield, BarChart2, Users, Library, ToggleRight, ToggleLeft,
  AlertTriangle, CheckCircle, Zap, RefreshCw
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────
const PLAN_META = {
  '7_DAYS':  { label: '7-Day Plan',  cards_given: 7,  color: 'from-blue-600 to-cyan-500',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  '30_DAYS': { label: '30-Day Plan', cards_given: 30, color: 'from-indigo-600 to-purple-500', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
};

const TYPE_STYLES = {
  ACTION:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  WILDCARD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEFENSE:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REACTION: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Stat Pill ─────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-white">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Card Picker Modal ─────────────────────────────────────────
function CardPickerModal({ deckId, poolCardIds, onClose, onAdded }) {
  const [allCards, setAllCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await axiosInstance.get('/admin/dashboard/cards', {
          params: { is_active: 'true' }
        });
        // Filter out deflect cards (only regular cards can be added)
        setAllCards((r.data.data.cards || []).filter(c => !c.deflect_action));
      } catch { toast.error('Failed to load cards'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = allCards.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.card_categories?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (card) => {
    if (poolCardIds.includes(card.id)) {
      toast('Already in this deck pool', { icon: 'ℹ️' });
      return;
    }
    setAdding(card.id);
    try {
      const r = await axiosInstance.post(`/admin/master-decks/${deckId}/cards`, { card_id: card.id });
      const msg = r.data.data?.message || 'Card added';
      if (r.data.data?.already_exists) toast(msg, { icon: 'ℹ️' });
      else toast.success(msg);
      onAdded();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add card');
    } finally { setAdding(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Cards to Pool</h2>
              <p className="text-xs text-slate-500">Only active regular cards (no deflect cards)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by card name or category…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No cards found.</div>
          ) : filtered.map(card => {
            const inPool = poolCardIds.includes(card.id);
            return (
              <div key={card.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${inPool ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{card.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border font-semibold ${TYPE_STYLES[card.card_type] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {card.card_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    {card.card_categories?.theme_color && (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: card.card_categories.theme_color }} />
                    )}
                    {card.card_categories?.name || '—'}
                  </p>
                </div>
                {inPool ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold shrink-0">
                    <CheckCircle className="w-4 h-4" /> In Pool
                  </span>
                ) : (
                  <button onClick={() => handleAdd(card)} disabled={adding === card.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60 shrink-0">
                    {adding === card.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Deck Panel ────────────────────────────────────────────────
function DeckPanel({ deck, onRefresh }) {
  const [detail, setDetail]     = useState(null);
  const [stats, setStats]       = useState(null);
  const [loadingD, setLoadingD] = useState(true);
  const [loadingS, setLoadingS] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [toggling, setToggling] = useState(false);

  const meta = PLAN_META[deck.plan_type] || {};

  const fetchDetail = useCallback(async () => {
    setLoadingD(true);
    try {
      const r = await axiosInstance.get(`/admin/master-decks/${deck.id}`);
      setDetail(r.data.data.deck);
    } catch { toast.error('Failed to load deck detail'); }
    finally { setLoadingD(false); }
  }, [deck.id]);

  const fetchStats = useCallback(async () => {
    setLoadingS(true);
    try {
      const r = await axiosInstance.get(`/admin/master-decks/${deck.id}/stats`);
      setStats(r.data.data.stats);
    } catch {}
    finally { setLoadingS(false); }
  }, [deck.id]);

  useEffect(() => { fetchDetail(); fetchStats(); }, [fetchDetail, fetchStats]);

  const handleRemove = async (masterDeckCardId, cardName) => {
    if (!confirm(`Remove "${cardName}" from this deck pool?\nThis only affects future room joins — already distributed cards are NOT affected.`)) return;
    setRemoving(masterDeckCardId);
    try {
      const r = await axiosInstance.delete(`/admin/master-decks/${deck.id}/cards/${masterDeckCardId}`);
      toast.success(r.data.data?.message || 'Card removed');
      fetchDetail(); fetchStats(); onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove card');
    } finally { setRemoving(null); }
  };

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      await axiosInstance.put(`/admin/master-decks/${deck.id}`, { is_active: !deck.is_active });
      toast.success(deck.is_active ? 'Deck deactivated' : 'Deck activated');
      onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update deck');
    } finally { setToggling(false); }
  };

  const poolCardIds = (detail?.cards || []).map(c => c.id);

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden ${deck.is_active ? 'border-slate-800' : 'border-slate-800 opacity-70'}`}>
      {/* Deck Header */}
      <div className={`bg-gradient-to-r ${meta.color || 'from-slate-700 to-slate-600'} p-6`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{deck.plan_type?.replace('_', '-')}</span>
              {!deck.is_active && <span className="text-xs bg-black/30 text-white/70 px-2 py-0.5 rounded-full">Inactive</span>}
            </div>
            <h3 className="text-xl font-bold text-white">{deck.name || meta.label}</h3>
            {deck.description && <p className="text-sm text-white/70 mt-1">{deck.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleActive} disabled={toggling}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Toggle active">
              {toggling ? <Loader2 className="w-4 h-4 text-white animate-spin" /> :
                deck.is_active ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-white/50" />}
            </button>
          </div>
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{deck.pool_size ?? '—'}</p>
            <p className="text-xs text-white/70 mt-0.5">Pool Size</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{deck.card_count}</p>
            <p className="text-xs text-white/70 mt-0.5">Cards / User</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {loadingS ? '…' : (stats?.unique_users_served ?? 0)}
            </p>
            <p className="text-xs text-white/70 mt-0.5">Users Served</p>
          </div>
        </div>
      </div>

      {/* Analytics Strip */}
      {!loadingS && stats && (
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-800">
          <StatPill icon={Library}    label="Pool Size"           value={stats.pool_size}           color="bg-indigo-500/80" />
          <StatPill icon={Users}      label="Unique Users Served" value={stats.unique_users_served} color="bg-emerald-500/80" />
          <StatPill icon={BarChart2}  label="Total Cards Given"   value={stats.total_cards_given}   color="bg-purple-500/80" />
          <StatPill icon={Zap}        label="Cards Per User"      value={stats.cards_per_user}       color="bg-amber-500/80" />
        </div>
      )}

      {/* Warning if pool too small */}
      {!loadingD && detail && detail.pool_size < deck.card_count && (
        <div className="mx-4 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            <span className="font-bold">Pool too small!</span> Pool has {detail.pool_size} card{detail.pool_size !== 1 ? 's' : ''} but each user needs {deck.card_count}. Add more cards to ensure proper distribution.
          </p>
        </div>
      )}

      {/* Card Pool Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 mt-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Card Pool ({loadingD ? '…' : detail?.pool_size ?? 0} cards)
        </p>
        <button onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Cards
        </button>
      </div>

      {/* Card Pool List */}
      <div className="max-h-72 overflow-y-auto">
        {loadingD ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : !detail?.cards?.length ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Library className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No cards in pool yet.</p>
            <button onClick={() => setPickerOpen(true)} className="mt-2 text-xs text-indigo-400 hover:underline">
              Add first card
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-600 uppercase tracking-wider border-b border-slate-800/50">
                <th className="px-5 py-2.5 text-left">Card</th>
                <th className="px-5 py-2.5 text-left">Type</th>
                <th className="px-5 py-2.5 text-left">Added</th>
                <th className="px-5 py-2.5 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {detail.cards.map(card => (
                <tr key={card.master_deck_card_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{card.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {card.card_categories?.theme_color && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.card_categories.theme_color }} />
                        )}
                        {card.card_categories?.name || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border font-semibold ${TYPE_STYLES[card.card_type] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {card.card_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{fmtDate(card.added_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleRemove(card.master_deck_card_id, card.name)}
                      disabled={removing === card.master_deck_card_id}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Remove from pool">
                      {removing === card.master_deck_card_id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Card Picker Modal */}
      {pickerOpen && (
        <CardPickerModal
          deckId={deck.id}
          poolCardIds={poolCardIds}
          onClose={() => setPickerOpen(false)}
          onAdded={() => { fetchDetail(); fetchStats(); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MasterDeck() {
  const [decks, setDecks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axiosInstance.get('/admin/master-decks');
      setDecks(r.data.data.decks || []);
    } catch (e) {
      toast.error('Failed to load master decks');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDecks(); }, [fetchDecks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Master Deck Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage the two free card pools granted automatically when users join a room.
            <span className="text-indigo-400 ml-1">7-Day = 7 cards/user. 30-Day = 30 cards + 5 deflect/user.</span>
          </p>
        </div>
        <button onClick={fetchDecks} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* How it works banner */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-300">How the Master Deck Engine Works</p>
          <p className="text-xs text-slate-400 mt-1">
            When a partner joins a room (making it <span className="text-emerald-400 font-semibold">ACTIVE</span>), the backend automatically distributes free cards from the correct pool to BOTH players using an <span className="text-white font-semibold">80/20 Fisher-Yates algorithm</span> (80% new cards, 20% repeat favourites). Removing a card from the pool only affects <span className="text-white font-semibold">future</span> room joins — already-distributed cards are untouched.
          </p>
        </div>
      </div>

      {/* Deck Panels */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Layers className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No master decks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {decks.map(deck => (
            <DeckPanel key={deck.id} deck={deck} onRefresh={fetchDecks} />
          ))}
        </div>
      )}
    </div>
  );
}
