import React, { useState, useEffect } from 'react';
import { Bell, Send, Clock, Edit2, CheckCircle2, XCircle, Trash2, History, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminNotificationApi } from '../api/adminNotificationApi';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('templates');
  
  // Data
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Send State
  const [manualTitle, setManualTitle] = useState('');
  const [manualBody, setManualBody] = useState('');
  const [manualTarget, setManualTarget] = useState('all');
  const [manualUserId, setManualUserId] = useState('');
  const [sendingManual, setSendingManual] = useState(false);
  const [triggeringAnniv, setTriggeringAnniv] = useState(false);

  // Scheduled Send State
  const [schedTitle, setSchedTitle] = useState('');
  const [schedBody, setSchedBody] = useState('');
  const [schedTarget, setSchedTarget] = useState('all');
  const [schedUserId, setSchedUserId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Edit Template State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, tempRes, schedRes, logRes] = await Promise.all([
        adminNotificationApi.getStats(),
        adminNotificationApi.getTemplates(),
        adminNotificationApi.getScheduled(),
        adminNotificationApi.getLogs()
      ]);
      setStats(statsRes.data.stats);
      setTemplates(tempRes.data.templates);
      setScheduled(schedRes.data.scheduled);
      setLogs(logRes.data.logs);
    } catch (err) {
      toast.error('Failed to load notifications data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTemplate = async (id, isEnabled) => {
    try {
      await adminNotificationApi.toggleTemplate(id, isEnabled);
      toast.success(`Template ${isEnabled ? 'enabled' : 'disabled'}`);
      setTemplates(templates.map(t => t.id === id ? { ...t, is_enabled: isEnabled } : t));
    } catch (err) {
      toast.error('Failed to toggle template');
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await adminNotificationApi.updateTemplate(editingTemplate.id, { title: editTitle, body: editBody });
      toast.success('Template updated successfully');
      setTemplates(templates.map(t => t.id === editingTemplate.id ? res.data.template : t));
      setEditingTemplate(null);
    } catch (err) {
      toast.error('Failed to update template');
    }
  };

  const handleSendManual = async (e) => {
    e.preventDefault();
    if (!manualTitle || !manualBody) return toast.error('Title and body required');
    if (manualTarget === 'single' && !manualUserId) return toast.error('User ID required');
    
    setSendingManual(true);
    try {
      const payload = { title: manualTitle, body: manualBody, target_user_id: manualTarget === 'single' ? manualUserId : null };
      const res = await adminNotificationApi.sendManual(payload);
      toast.success(`Notification sent to ${res.data.sent_count} user(s)`);
      setManualTitle(''); setManualBody(''); setManualUserId('');
      fetchData(); // refresh logs
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendingManual(false);
    }
  };

  const handleTriggerAnniversaries = async () => {
    setTriggeringAnniv(true);
    try {
      const res = await adminNotificationApi.triggerAnniversaries();
      toast.success(res.message);
      fetchData(); // refresh logs
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger anniversaries');
    } finally {
      setTriggeringAnniv(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!schedTitle || !schedBody || !schedDate) return toast.error('All fields required');
    
    setScheduling(true);
    try {
      const payload = { 
        title: schedTitle, 
        body: schedBody, 
        target_type: schedTarget,
        target_user_id: schedTarget === 'single' ? schedUserId : null,
        scheduled_for: new Date(schedDate).toISOString()
      };
      await adminNotificationApi.scheduleNotification(payload);
      toast.success('Notification scheduled');
      setSchedTitle(''); setSchedBody(''); setSchedDate(''); setSchedUserId('');
      fetchData(); // refresh scheduled list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule notification');
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelScheduled = async (id) => {
    try {
      await adminNotificationApi.cancelScheduled(id);
      toast.success('Scheduled notification cancelled');
      setScheduled(scheduled.map(s => s.id === id ? { ...s, status: 'CANCELLED' } : s));
    } catch (err) {
      toast.error('Failed to cancel schedule');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
          <p className="text-slate-400 text-sm font-medium">Total Sent</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.total_sent || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
          <p className="text-slate-400 text-sm font-medium">Pending Scheduled</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.pending_scheduled || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
          <p className="text-slate-400 text-sm font-medium">Broadcasts Sent</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.total_broadcasts || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
          <p className="text-slate-400 text-sm font-medium">Unread in App</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.total_unread || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800">
        {[
          { id: 'templates', icon: Bell, label: 'Automated Templates' },
          { id: 'manual', icon: Send, label: 'Manual Broadcast' },
          { id: 'scheduled', icon: Clock, label: 'Scheduled' },
          { id: 'logs', icon: History, label: 'History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      
      {/* 1. Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className={`p-5 rounded-2xl border transition-all ${t.is_enabled ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {t.title}
                    {!t.is_enabled && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Disabled</span>}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">{t.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingTemplate(t); setEditTitle(t.title); setEditBody(t.body); }} className="p-1.5 bg-slate-800 hover:bg-indigo-500 hover:text-white rounded-lg text-slate-400 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleToggleTemplate(t.id, !t.is_enabled)}
                    className={`p-1.5 rounded-lg transition-colors ${t.is_enabled ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white'}`}
                  >
                    {t.is_enabled ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">{t.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Template: {editingTemplate.type}</h2>
            <form onSubmit={handleUpdateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Body Text</label>
                <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} required rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingTemplate(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Manual Send Tab */}
      {activeTab === 'manual' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-indigo-400" /> Send Push Notification Now</h2>
          <form onSubmit={handleSendManual} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Audience</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="radio" checked={manualTarget === 'all'} onChange={() => setManualTarget('all')} className="text-indigo-500 focus:ring-indigo-500 bg-slate-950 border-slate-700" />
                  All Active Users
                </label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="radio" checked={manualTarget === 'single'} onChange={() => setManualTarget('single')} className="text-indigo-500 focus:ring-indigo-500 bg-slate-950 border-slate-700" />
                  Specific User
                </label>
              </div>
            </div>
            
            {manualTarget === 'single' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target User ID (UUID)</label>
                <input type="text" value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} required placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Notification Title</label>
              <input type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} required placeholder="e.g. Server Maintenance" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Notification Body</label>
              <textarea value={manualBody} onChange={(e) => setManualBody(e.target.value)} required rows={4} placeholder="e.g. We will be down for 5 minutes..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
            </div>
            
            <button type="submit" disabled={sendingManual} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
              {sendingManual ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Notification Now
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">🎉 Trigger Anniversary Push</h2>
            <p className="text-sm text-slate-400 mb-4">Manually find all users whose anniversary is today and send them a "Happy Anniversary" push notification.</p>
            <button 
              onClick={handleTriggerAnniversaries} 
              disabled={triggeringAnniv}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-pink-500/20"
            >
              {triggeringAnniv ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Send Anniversary Notifications Now
            </button>
          </div>
        </div>
      )}

      {/* 3. Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-400" /> Schedule Future Send</h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target</label>
                <select value={schedTarget} onChange={(e) => setSchedTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none">
                  <option value="all">All Users</option>
                  <option value="single">Specific User</option>
                </select>
              </div>
              {schedTarget === 'single' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">User ID</label>
                  <input type="text" value={schedUserId} onChange={(e) => setSchedUserId(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none font-mono text-sm" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input type="text" value={schedTitle} onChange={(e) => setSchedTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Body</label>
                <textarea value={schedBody} onChange={(e) => setSchedBody(e.target.value)} required rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Schedule For (Local Time)</label>
                <input type="datetime-local" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none" />
              </div>
              <button type="submit" disabled={scheduling} className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Push'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">Pending & Past Schedules</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {scheduled.length === 0 ? (
                <div className="p-8 text-center text-slate-500"><Clock className="w-12 h-12 mx-auto mb-3 opacity-20" /> No scheduled notifications found</div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/50 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Message</th>
                      <th className="px-6 py-4 font-semibold">Scheduled For</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {scheduled.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{s.title}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.body}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(s.scheduled_for).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            s.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                            s.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {s.status === 'PENDING' && (
                            <button onClick={() => handleCancelScheduled(s.id)} className="text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors">
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No manual broadcasts sent yet</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sent At</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Sent To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{log.title}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{log.body}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full font-semibold">{log.type.replace('MANUAL_', '')}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {log.target_user_id ? <span className="font-mono text-slate-500">{log.target_user_id.substring(0, 8)}...</span> : <span className="text-emerald-400">{log.sent_count} users</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
