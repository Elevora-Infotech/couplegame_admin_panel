import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Gamepad2, Activity, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Loader2, AlertTriangle, ZapOff,
  Shield, Users, CreditCard, Eye, AlertOctagon, RotateCcw, Swords
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGameApi } from '../api/adminGameApi';

// ── Helpers ───────────────────────────────────────────────────
const STATUS_STYLES = {
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  WAITING:   'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  COMPLETED: 'bg-slate-700      text-slate-300   border-slate-600',
  EXPIRED:   'bg-red-500/10    text-red-400     border-red-500/20',
};

const CARD_STATUS_STYLES = {
  SENT:                 'bg-blue-500/10    text-blue-400',
  WAITING:              'bg-yellow-500/10  text-yellow-400',
  IN_PROGRESS:          'bg-indigo-500/10  text-indigo-400',
  COMPLETED_BY_RECEIVER:'bg-purple-500/10  text-purple-400',
  COMPLETED:            'bg-emerald-500/10 text-emerald-400',
  DEFLECTED:            'bg-orange-500/10  text-orange-400',
  PENALTY:              'bg-red-500/10     text-red-400',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Game Detail Modal ─────────────────────────────────────────
function GameDetailModal({ game, onClose, onForceEnd, loading }) {
  if (!game) return null;
  const { room, stats, sends, penalties, deflects, hostDeck, partnerDeck } = game;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl my-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white font-mono">{room.code}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[room.status] || STATUS_STYLES.COMPLETED}`}>
                  {room.status}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">
                  {room.expiry_type?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Started {fmtTime(room.created_at)} · Expires {fmtTime(room.expires_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Players */}
        <div className="p-6 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Players</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{ label: '👑 Host', u: room.host }, { label: '🤝 Partner', u: room.partner }].map(({ label, u }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/40 to-emerald-500/40 flex items-center justify-center text-sm font-bold text-white border border-slate-700">
                  {u?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-white truncate">{u?.name || '—'}</p>
                  <p className="text-xs text-slate-500 truncate">{u?.email || 'Waiting for partner…'}</p>
                </div>
                {u?.is_blocked && <span className="ml-auto text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">Blocked</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="p-6 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Game Stats</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Cards Played', value: stats.total_cards_played, icon: CreditCard, color: 'text-indigo-400' },
              { label: 'Completed',    value: stats.completed,          icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Pending',      value: stats.pending,            icon: Clock,        color: 'text-yellow-400' },
              { label: 'Deflected',    value: stats.deflected,          icon: Shield,       color: 'text-orange-400' },
              { label: 'Penalties',    value: stats.penalty,            icon: AlertOctagon, color: 'text-red-400' },
              { label: 'Total Penalties', value: stats.total_penalties, icon: AlertTriangle, color: 'text-red-400' },
              { label: 'Deflect Cards Used', value: stats.deflect_cards_used, icon: Swords, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-white">{s.value ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Sends */}
        {sends.length > 0 && (
          <div className="p-6 border-b border-slate-800">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Card Activity ({sends.length})
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {sends.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{s.cards?.name || 'Card'}</p>
                    <p className="text-xs text-slate-500">{s.sender?.name} → {s.receiver?.name}</p>
                    {s.message && <p className="text-xs text-slate-400 italic mt-0.5 truncate">"{s.message}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CARD_STATUS_STYLES[s.status] || 'bg-slate-700 text-slate-400'}`}>
                      {s.status?.replace(/_/g,' ')}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">{fmtTime(s.sent_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Decks */}
        {(hostDeck?.regular?.length > 0 || partnerDeck?.regular?.length > 0) && (
          <div className="p-6 border-b border-slate-800">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Player Decks
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Host Deck */}
              {hostDeck && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 flex flex-col">
                  <p className="text-sm font-bold text-white mb-3">👑 {room.host?.name || 'Host'}'s Deck</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 flex-1">
                    {hostDeck.regular?.map(d => (
                      <div key={d.id} className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${d.is_used ? 'bg-slate-800/50 text-slate-500' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'}`}>
                        <span className="truncate pr-2 font-medium">{d.cards?.name}</span>
                        <span className={`shrink-0 font-semibold ${d.is_used ? '' : 'text-indigo-400'}`}>{d.is_used ? 'Used' : 'Available'}</span>
                      </div>
                    ))}
                    {!hostDeck.regular?.length && <p className="text-xs text-slate-500 italic py-2">No cards in deck</p>}
                  </div>
                </div>
              )}
              {/* Partner Deck */}
              {partnerDeck && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 flex flex-col">
                  <p className="text-sm font-bold text-white mb-3">🤝 {room.partner?.name || 'Partner'}'s Deck</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 flex-1">
                    {partnerDeck.regular?.map(d => (
                      <div key={d.id} className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${d.is_used ? 'bg-slate-800/50 text-slate-500' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
                        <span className="truncate pr-2 font-medium">{d.cards?.name}</span>
                        <span className={`shrink-0 font-semibold ${d.is_used ? '' : 'text-emerald-400'}`}>{d.is_used ? 'Used' : 'Available'}</span>
                      </div>
                    ))}
                    {!partnerDeck.regular?.length && <p className="text-xs text-slate-500 italic py-2">No cards in deck</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Penalties */}
        {penalties.length > 0 && (
          <div className="p-6 border-b border-slate-800">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Penalties ({penalties.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {penalties.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                  <p className="text-xs text-slate-300 truncate">{p.reason || 'Penalty'}</p>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_resolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.is_resolved ? 'Resolved' : 'Active'}
                    </span>
                    <span className="text-xs text-slate-600">{fmtTime(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deflect Cards — per-user panels */}
        {(hostDeck?.deflect?.length > 0 || partnerDeck?.deflect?.length > 0) && (
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Deflect Cards
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                {(hostDeck?.deflect?.length || 0) + (partnerDeck?.deflect?.length || 0)} total · {(hostDeck?.deflect?.filter(d => d.is_used).length || 0) + (partnerDeck?.deflect?.filter(d => d.is_used).length || 0)} used
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Host Deflect Cards */}
              {hostDeck && (
                <div className="bg-purple-900/10 rounded-xl p-4 border border-purple-500/20 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <p className="text-sm font-bold text-white">👑 {room.host?.name || 'Host'}</p>
                    <span className="ml-auto text-xs text-purple-400 font-semibold">
                      {hostDeck.deflect?.filter(d => d.is_used).length || 0}/{hostDeck.deflect?.length || 0} used
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 flex-1">
                    {hostDeck.deflect?.length > 0 ? hostDeck.deflect.map(d => (
                      <div key={d.id} className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${
                        d.is_used
                          ? 'bg-slate-800/60 border border-slate-700/40'
                          : 'bg-purple-500/10 border border-purple-500/20'
                      }`}>
                        <span className={`truncate pr-2 font-medium ${d.is_used ? 'text-slate-500 line-through' : 'text-purple-200'}`}>
                          {d.cards?.name}
                        </span>
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          d.is_used
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {d.is_used ? 'Used' : 'Available'}
                        </span>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 italic py-2">No deflect cards</p>
                    )}
                  </div>
                </div>
              )}
              {/* Partner Deflect Cards */}
              {partnerDeck && (
                <div className="bg-purple-900/10 rounded-xl p-4 border border-purple-500/20 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <p className="text-sm font-bold text-white">🤝 {room.partner?.name || 'Partner'}</p>
                    <span className="ml-auto text-xs text-purple-400 font-semibold">
                      {partnerDeck.deflect?.filter(d => d.is_used).length || 0}/{partnerDeck.deflect?.length || 0} used
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 flex-1">
                    {partnerDeck.deflect?.length > 0 ? partnerDeck.deflect.map(d => (
                      <div key={d.id} className={`p-2.5 rounded-lg text-xs flex justify-between items-center ${
                        d.is_used
                          ? 'bg-slate-800/60 border border-slate-700/40'
                          : 'bg-purple-500/10 border border-purple-500/20'
                      }`}>
                        <span className={`truncate pr-2 font-medium ${d.is_used ? 'text-slate-500 line-through' : 'text-purple-200'}`}>
                          {d.cards?.name}
                        </span>
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          d.is_used
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {d.is_used ? 'Used' : 'Available'}
                        </span>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-500 italic py-2">No deflect cards</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex flex-wrap gap-3">
          {(room.status === 'ACTIVE' || room.status === 'WAITING') && (
            <button
              onClick={() => onForceEnd(room.id)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              <ZapOff className="w-4 h-4" />
              Force End Game
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-medium transition-all ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.COMPLETED}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' :
        status === 'WAITING' ? 'bg-yellow-400' :
        status === 'EXPIRED' ? 'bg-red-400' : 'bg-slate-500'
      }`} />
      {status}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function GameManagement() {
  const [games, setGames]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedGame, setSelectedGame]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchGames = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminGameApi.getAll({ page, limit: pagination.limit, status: statusFilter, search });
      setGames(res.data.data.games);
      setPagination(p => ({ ...p, ...res.data.data.pagination }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminGameApi.getStats();
      setStats(res.data.data.stats);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchGames(1); }, [search, statusFilter]);
  useEffect(() => { fetchStats(); }, []);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await adminGameApi.getById(id);
      setSelectedGame(res.data.data);
    } catch (e) {
      toast.error('Failed to load game detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleForceEnd = async (roomId) => {
    if (!confirm('Force-end this game? All pending cards will be closed. This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await adminGameApi.forceEnd(roomId);
      toast.success(res.data.data?.message || 'Game ended successfully');
      setSelectedGame(null);
      fetchGames(pagination.page);
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to end game');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Game Management</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor all active and completed games, view card activity, and force-end games.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatCard icon={Gamepad2}     label="Total Games"    value={stats?.total_games}         color="bg-indigo-500/80" />
        <StatCard icon={Activity}     label="Active"         value={stats?.active_games}         color="bg-emerald-500/80" />
        <StatCard icon={Clock}        label="Waiting"        value={stats?.waiting_games}        color="bg-yellow-500/80" />
        <StatCard icon={CheckCircle2} label="Completed"      value={stats?.completed_games}      color="bg-slate-600" />
        <StatCard icon={Gamepad2}     label="Started Today"  value={stats?.games_started_today}  color="bg-blue-500/80" />
        <StatCard icon={CreditCard}   label="Cards Sent"     value={stats?.total_cards_sent}     color="bg-purple-500/80" />
        <StatCard icon={AlertOctagon} label="Penalties"      value={stats?.total_penalties}      color="bg-red-500/80" />
        <StatCard icon={Swords}       label="Deflects Used"  value={stats?.deflects_used}        color="bg-orange-500/80" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by room code (e.g. ELV-XXXXX)..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="WAITING">Waiting</option>
            <option value="COMPLETED">Completed</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all">
            Search
          </button>
          {(search || statusFilter) && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition-all"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Games Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">
            {loading ? 'Loading…' : `${pagination.total} Games Found`}
          </h2>
          <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Gamepad2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No games found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-3 text-left">Room</th>
                  <th className="px-6 py-3 text-left">Players</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Cards</th>
                  <th className="px-6 py-3 text-left">Started</th>
                  <th className="px-6 py-3 text-left">Expires</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {games.map(g => (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-white text-sm">{g.code}</p>
                      <p className="text-xs text-slate-600 truncate max-w-[100px]">{g.id.slice(0,8)}…</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-yellow-500">👑</span>
                          <span className="text-xs text-slate-300 truncate max-w-[120px]">{g.host?.name || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">🤝</span>
                          <span className="text-xs text-slate-500 truncate max-w-[120px]">{g.partner?.name || 'Waiting…'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                        {g.expiry_type?.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-300 font-semibold">{g.cards.total}</span>
                        <span className="text-slate-600">total</span>
                        {g.cards.pending > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20 text-xs font-semibold">
                            {g.cards.pending} pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{fmt(g.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs ${new Date(g.expires_at) < new Date() ? 'text-red-400' : 'text-slate-400'}`}>
                        {fmt(g.expires_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(g.id)}
                          disabled={detailLoading}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(g.status === 'ACTIVE' || g.status === 'WAITING') && (
                          <button
                            onClick={() => handleForceEnd(g.id)}
                            disabled={actionLoading}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Force End Game"
                          >
                            <ZapOff className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchGames(pagination.page - 1)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-slate-500">{pagination.page} / {pagination.pages}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchGames(pagination.page + 1)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onForceEnd={handleForceEnd}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
