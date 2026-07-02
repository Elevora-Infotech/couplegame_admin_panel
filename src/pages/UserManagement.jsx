import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShieldOff, ShieldCheck, RotateCcw, Eye, X, Users, UserCheck, UserX, Home, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminUserApi } from '../api/adminUserApi';

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────
function UserDetailModal({ user, onClose, onBlock, onUnblock, onResetRoom, loading }) {
  if (!user) return null;
  const u = user.user;
  const s = user.stats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {u.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{u.name}</h2>
              <p className="text-sm text-slate-400">{u.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_blocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {u.is_blocked ? '🔴 Blocked' : '🟢 Active'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 capitalize border border-slate-700">
                  {u.auth_provider}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Rooms', value: s.total_rooms },
            { label: 'Cards Sent', value: s.card_stats.total_sent },
            { label: 'Cards Received', value: s.card_stats.total_received },
            { label: 'Completed', value: s.card_stats.completed },
            { label: 'Rejected', value: s.card_stats.rejected },
            { label: 'Total Penalties', value: s.total_penalties },
            { label: 'Cards in Deck', value: s.deck_cards_remaining },
            { label: 'Purchases', value: s.total_purchases },
          ].map(st => (
            <div key={st.label} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
              <p className="text-xs text-slate-500">{st.label}</p>
              <p className="text-lg font-bold text-white">{st.value ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Active Room */}
        {s.active_room && (
          <div className="mx-6 mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-400 font-semibold mb-1">ACTIVE ROOM</p>
            <p className="text-white font-mono font-bold">{s.active_room.code}</p>
            <p className="text-xs text-slate-400">{s.active_room.expiry_type} · Created {new Date(s.active_room.created_at).toLocaleDateString()}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-wrap gap-3 border-t border-slate-800 mt-2">
          {u.is_blocked ? (
            <button
              onClick={() => onUnblock(u.id)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> Unblock User
            </button>
          ) : (
            <button
              onClick={() => onBlock(u.id)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <ShieldOff className="w-4 h-4" /> Block User
            </button>
          )}
          {s.active_room && (
            <button
              onClick={() => onResetRoom(u.id)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Reset Active Room
            </button>
          )}
          <p className="text-xs text-slate-500 self-center ml-auto">
            Joined {new Date(u.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Room History */}
        {user.rooms?.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Room History</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {user.rooms.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                  <div>
                    <p className="text-sm font-mono font-bold text-white">{r.code}</p>
                    <p className="text-xs text-slate-500">{r.expiry_type}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    r.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                    r.status === 'WAITING' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminUserApi.getAll({ page, limit: pagination.limit, search, status: statusFilter });
      setUsers(res.data.data.users);
      setPagination(p => ({ ...p, ...res.data.data.pagination }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminUserApi.getStats();
      setStats(res.data.data.stats);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchUsers(1); }, [search, statusFilter]);
  useEffect(() => { fetchStats(); }, []);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await adminUserApi.getById(id);
      setSelectedUser(res.data.data);
    } catch (e) {
      toast.error('Failed to load user detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBlock = async (id) => {
    if (!confirm('Block this user? They will lose access to the app.')) return;
    setActionLoading(true);
    try {
      await adminUserApi.block(id);
      toast.success('User blocked successfully');
      setSelectedUser(null);
      fetchUsers(pagination.page);
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    setActionLoading(true);
    try {
      await adminUserApi.unblock(id);
      toast.success('User unblocked successfully');
      setSelectedUser(null);
      fetchUsers(pagination.page);
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetRoom = async (id) => {
    if (!confirm('Force-close the active room? All cards in this room will be expired. This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await adminUserApi.resetRoom(id);
      toast.success(res.data.message);
      setSelectedUser(null);
      fetchUsers(pagination.page);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reset room');
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
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 text-sm mt-1">View, search, block, and manage all registered users.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users} color="bg-indigo-500/80" />
        <StatCard icon={UserCheck} label="New Today" value={stats?.new_today} color="bg-emerald-500/80" />
        <StatCard icon={Users} label="Last 7 Days" value={stats?.new_last_7_days} color="bg-blue-500/80" />
        <StatCard icon={Users} label="Last 30 Days" value={stats?.new_last_30_days} color="bg-purple-500/80" />
        <StatCard icon={UserX} label="Blocked" value={stats?.blocked_users} color="bg-red-500/80" />
        <StatCard icon={Home} label="Active Rooms" value={stats?.active_rooms} color="bg-amber-500/80" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
            <option value="">All Users</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
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

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">
            {loading ? 'Loading...' : `${pagination.total} Users Found`}
          </h2>
          <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Auth</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/40 to-emerald-500/40 flex items-center justify-center text-sm font-bold text-white border border-slate-700">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-lg capitalize border border-slate-700">
                        {u.auth_provider}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit text-xs px-2 py-1 rounded-full font-semibold border ${
                        u.is_blocked
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_blocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        {u.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(u.id)}
                          disabled={detailLoading}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {u.is_blocked ? (
                          <button
                            onClick={() => handleUnblock(u.id)}
                            disabled={actionLoading}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="Unblock"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(u.id)}
                            disabled={actionLoading}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Block"
                          >
                            <ShieldOff className="w-4 h-4" />
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
              onClick={() => fetchUsers(pagination.page - 1)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-slate-500">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onResetRoom={handleResetRoom}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
