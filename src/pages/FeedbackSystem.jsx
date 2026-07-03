import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { MessageSquareMore, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  OPEN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  IN_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
};

const TYPE_STYLES = {
  BUG: 'bg-rose-500/10 text-rose-400',
  FEATURE_REQUEST: 'bg-purple-500/10 text-purple-400',
  GENERAL: 'bg-blue-500/10 text-blue-400',
  CARD_FEEDBACK: 'bg-cyan-500/10 text-cyan-400',
};

export default function FeedbackSystem() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editingNotes, setEditingNotes] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      const res = await axiosInstance.get(`/admin/intelligence/feedback?${params}`);
      setFeedback(res.data.data || []);
    } catch { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter, typeFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axiosInstance.patch(`/admin/intelligence/feedback/${id}`, { status, admin_notes: editingNotes[id] || '' });
      toast.success('Feedback updated!');
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const STAR_COLORS = ['', 'text-red-400', 'text-orange-400', 'text-amber-400', 'text-lime-400', 'text-emerald-400'];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquareMore className="w-8 h-8 text-purple-500" />
            Feedback System
          </h1>
          <p className="text-slate-400 mt-1">Review and respond to user-submitted bugs, feature requests, and card feedback.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-medium transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500">
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500">
          <option value="">All Types</option>
          <option value="BUG">Bug Reports</option>
          <option value="FEATURE_REQUEST">Feature Requests</option>
          <option value="GENERAL">General</option>
          <option value="CARD_FEEDBACK">Card Feedback</option>
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-purple-500">Loading feedback...</div>
      ) : (
        <div className="space-y-4">
          {feedback.length === 0 && (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No feedback found. Users can submit feedback through the mobile app.
            </div>
          )}
          {feedback.map(f => (
            <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${TYPE_STYLES[f.feedback_type] || 'bg-slate-800 text-slate-400'}`}>
                    {f.feedback_type?.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${STATUS_STYLES[f.status]}`}>{f.status}</span>
                  {f.rating && <span className={`text-sm font-bold ${STAR_COLORS[f.rating]}`}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>}
                </div>
                <div className="text-xs text-slate-500">{new Date(f.created_at).toLocaleString()}</div>
              </div>

              <p className="text-white mt-3 font-medium">{f.message}</p>
              {f.users && <p className="text-xs text-slate-400 mt-1">— {f.users.name} ({f.users.email})</p>}

              {f.admin_notes && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-300">
                  <span className="text-xs font-bold text-purple-400 mr-2">Admin Note:</span>{f.admin_notes}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <textarea
                  placeholder="Add an internal note (optional)..."
                  value={editingNotes[f.id] || ''}
                  onChange={e => setEditingNotes(n => ({ ...n, [f.id]: e.target.value }))}
                  className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none h-10"
                />
                <div className="flex gap-2">
                  {['IN_REVIEW', 'RESOLVED', 'CLOSED'].map(s => (
                    <button key={s} disabled={updating === f.id || f.status === s}
                      onClick={() => updateStatus(f.id, s)}
                      className="px-3 py-2 text-xs font-bold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-125 bg-slate-800 text-slate-300 border-slate-700">
                      {s === 'IN_REVIEW' ? <><Clock className="w-3 h-3 inline mr-1" />Review</> :
                       s === 'RESOLVED' ? <><CheckCircle2 className="w-3 h-3 inline mr-1" />Resolve</> :
                       <><XCircle className="w-3 h-3 inline mr-1" />Close</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
