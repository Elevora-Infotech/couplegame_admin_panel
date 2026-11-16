import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
  ShieldAlert, ShieldCheck, Search, Filter, Calendar, RefreshCw, Eye, X,
  Clock, User, CheckCircle2, AlertCircle, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ActionLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null); // For JSON Diff Modal

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: pagination.limit,
      };
      if (search.trim()) params.search = search.trim();
      if (actionType) params.actionType = actionType;

      const response = await api.get('/admin/audit-logs', { params });
      if (response.data?.status === 'success') {
        const { logs: fetchedLogs, pagination: p } = response.data.data;
        setLogs(fetchedLogs || []);
        setPagination(p);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load action audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'REFUND_PURCHASE':
      case 'REFUND_DUPLICATE_PAYMENT':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'FORCE_END_GAME':
      case 'PAUSE_ALL_TIMERS':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'RESUME_ALL_TIMERS':
      case 'UNBLOCK_USER':
      case 'SEED_FREE_POOL_DEFAULT':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'BLOCK_USER':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'UPDATE_RUNTIME_SETTINGS':
      case 'UPDATE_CONTROL_MAINTENANCE_BANNER':
      case 'UPDATE_CONTROL_APP_VERSION_CONTROL':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'GRANT_COMPLIMENTARY_SUBSCRIPTION':
      case 'CREATE_CARD_VERSION_1':
      case 'UPDATE_CARD_PROMPT_VERSION':
      case 'CREATE_AB_EXPERIMENT':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      case 'CLOSE_STUCK_ROOM':
      case 'RESTORE_LOST_CARD':
      case 'EXTEND_CARD_TIMER':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'ADMIN_LOGIN_SUCCESS':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Action Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Immutable Ledger (Part B1)
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Tamper-proof record of all administrative operations, timestamps (IST), state diffs, and mandatory reasons.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(pagination.page)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Admin Name, Reason, Target ID, or Action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="" className="bg-slate-900">All Action Types</option>
            <option value="UPDATE_RUNTIME_SETTINGS" className="bg-slate-900">Update Game Settings</option>
            <option value="PAUSE_ALL_TIMERS" className="bg-slate-900">Emergency Pause Timers</option>
            <option value="RESUME_ALL_TIMERS" className="bg-slate-900">Resume Timers</option>
            <option value="UPDATE_CONTROL_MAINTENANCE_BANNER" className="bg-slate-900">Maintenance Banner</option>
            <option value="GRANT_COMPLIMENTARY_SUBSCRIPTION" className="bg-slate-900">Grant Subscription</option>
            <option value="UPDATE_CARD_PROMPT_VERSION" className="bg-slate-900">Card Version Bump</option>
            <option value="SEED_FREE_POOL_DEFAULT" className="bg-slate-900">Seed Free Pool</option>
            <option value="REFUND_DUPLICATE_PAYMENT" className="bg-slate-900">Refund Duplicate</option>
            <option value="FORCE_END_GAME" className="bg-slate-900">Force End Game</option>
            <option value="CLOSE_STUCK_ROOM" className="bg-slate-900">Close Stuck Room</option>
            <option value="RESTORE_LOST_CARD" className="bg-slate-900">Restore Lost Card</option>
            <option value="EXTEND_CARD_TIMER" className="bg-slate-900">Extend Card Timer</option>
            <option value="BLOCK_USER" className="bg-slate-900">Block User</option>
            <option value="UNBLOCK_USER" className="bg-slate-900">Unblock User</option>
            <option value="ADMIN_LOGIN_SUCCESS" className="bg-slate-900">Login Success</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-3.5">Time (IST)</th>
                <th className="px-6 py-3.5">Admin & Role</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Target</th>
                <th className="px-6 py-3.5">Mandatory Reason</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                    Loading action logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        {log.created_at_ist || log.created_at}
                      </div>
                    </td>

                    {/* Admin & Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.admin_name}</div>
                      <div className="text-xs text-slate-400 capitalize">
                        Role: <span className="text-violet-300 font-medium">{log.role}</span>
                      </div>
                    </td>

                    {/* Action Type Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="text-slate-400 capitalize">{log.target_entity}:</span>{' '}
                      <span className="font-mono text-white bg-white/5 px-1.5 py-0.5 rounded">
                        {log.target_id}
                      </span>
                    </td>

                    {/* Mandatory Reason */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-300 font-medium line-clamp-2 max-w-md">
                        "{log.reason}"
                      </div>
                    </td>

                    {/* Diff Modal Trigger */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(log.before_state || log.after_state) ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Diff
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <span className="text-white font-bold">{pagination.page}</span> of{' '}
              <span className="text-white font-bold">{pagination.totalPages}</span> ({pagination.total} total events)
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-2xl max-w-2xl w-full p-6 border border-white/10 bg-[#0B0F19] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-400" />
                  State Diff Inspection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Action: <span className="text-white font-semibold">{selectedLog.action_type}</span> on{' '}
                  <span className="text-violet-300 font-mono">{selectedLog.target_entity} {selectedLog.target_id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Reason Given</label>
                <p className="text-sm text-slate-200 bg-white/5 p-3 rounded-xl mt-1 border border-white/5 font-medium">
                  "{selectedLog.reason}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before State */}
                <div>
                  <label className="text-xs font-semibold text-rose-400 uppercase mb-1 block">
                    Before State
                  </label>
                  <pre className="text-xs font-mono p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-rose-200 overflow-x-auto">
                    {selectedLog.before_state
                      ? JSON.stringify(selectedLog.before_state, null, 2)
                      : 'null'}
                  </pre>
                </div>

                {/* After State */}
                <div>
                  <label className="text-xs font-semibold text-emerald-400 uppercase mb-1 block">
                    After State
                  </label>
                  <pre className="text-xs font-mono p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-200 overflow-x-auto">
                    {selectedLog.after_state
                      ? JSON.stringify(selectedLog.after_state, null, 2)
                      : 'null'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
