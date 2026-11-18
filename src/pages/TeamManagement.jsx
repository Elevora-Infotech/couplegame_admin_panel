import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Shield,
  Key,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
  Mail,
  User,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function TeamManagement() {
  const { user, isAdmin } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  // Form state for creating a new employee
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support',
  });

  const load2FAStatus = async () => {
    try {
      const res = await api.get('/admin/security/2fa-status');
      if (res.data?.status === 'success') {
        setTwoFAEnabled(Boolean(res.data.data.admin_2fa_enabled));
      }
    } catch (e) {
      console.warn('Could not load 2FA status:', e);
    }
  };

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    try {
      const nextState = !twoFAEnabled;
      const res = await api.post('/admin/security/toggle-2fa', { enabled: nextState });
      if (res.data?.status === 'success') {
        setTwoFAEnabled(nextState);
        toast.success(res.data.data.message || (nextState ? '2FA Enabled!' : '2FA Disabled!'));
      }
    } catch (err) {
      toast.error('Failed to toggle 2FA status');
    } finally {
      setToggling2FA(false);
    }
  };

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/team');
      if (res.data?.status === 'success') {
        setTeam(res.data?.data?.team || []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
    load2FAStatus();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in name, email, and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/team', form);
      if (res.data?.status === 'success') {
        toast.success(res.data?.message || 'Employee account created successfully!');
        setIsModalOpen(false);
        setForm({ name: '', email: '', password: '', role: 'support' });
        loadTeam();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, memberName) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${memberName}?`)) return;

    try {
      await api.delete(`/admin/team/${id}`);
      toast.success(`Access revoked for ${memberName}`);
      loadTeam();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove member');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const superAdminsCount = team.filter((m) => m.role === 'super_admin' || m.role === 'admin').length;
  const supportEmployeesCount = team.filter((m) => m.role === 'support').length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Access Control & RBAC
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Team & Employee Management
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Create employee logins, assign Sub-Admin / Support roles, and manage system access permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee / Sub-Admin
          </button>

          <button
            onClick={loadTeam}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2FA Master Switch Card */}
      <div className="bg-[#13141f] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${twoFAEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white">Admin 2-Factor Authentication (OTP / 2FA)</h3>
              <span className={`px-2 py-0.5 text-[10px] md:text-xs rounded-full font-bold uppercase tracking-wider ${twoFAEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {twoFAEnabled ? 'ACTIVE (OTP Required)' : 'DISABLED (Direct Login)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {twoFAEnabled 
                ? 'All administrators and support employees must enter a 6-digit OTP code to log in.' 
                : 'Direct login active: Administrators and support employees can log in instantly with Email and Password without any OTP code.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle2FA}
          disabled={toggling2FA}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${
            twoFAEnabled
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
          }`}
        >
          <Shield className="w-4 h-4" />
          {toggling2FA ? 'Updating...' : twoFAEnabled ? 'Turn OFF 2FA' : 'Turn ON 2FA'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#13141f] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Team</p>
            <p className="text-2xl font-black text-white">{team.length}</p>
          </div>
        </div>

        <div className="bg-[#13141f] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Admins</p>
            <p className="text-2xl font-black text-rose-400">{superAdminsCount}</p>
          </div>
        </div>

        <div className="bg-[#13141f] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Key className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Employees</p>
            <p className="text-2xl font-black text-emerald-400">{supportEmployeesCount}</p>
          </div>
        </div>
      </div>

      {/* Roles & Permissions Info Card */}
      <div className="bg-gradient-to-r from-blue-950/20 to-purple-950/20 border border-blue-500/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <p className="font-bold text-white mb-1">Role-Based Access Control (RBAC) Rules:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="font-extrabold text-rose-400">👑 Super Admin / Admin:</span>
                <p className="text-slate-400 mt-0.5">
                  Full unrestricted access: Can issue refunds, force-end games, edit cards, change prices, pause all system timers, and manage team members.
                </p>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="font-extrabold text-emerald-400">🛡️ Support Employee (Sub-Admin):</span>
                <p className="text-slate-400 mt-0.5">
                  Restricted operator: Can search couples, view player history, add support notes, resend invites, restore cards. 
                  <strong className="text-rose-300"> CANNOT</strong> issue refunds, force-end games, or touch financial settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-[#13141f] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Administrators & Employees ({team.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading team members...</p>
          </div>
        ) : team.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No team members found. Click "Add Employee" above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Permissions Scope</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {team.map((m) => {
                  const isSuper = m.role === 'super_admin' || m.role === 'admin';
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-black text-xs text-slate-300">
                          {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {m.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <span className="flex items-center gap-1.5">
                          {m.email}
                          <button
                            onClick={() => copyToClipboard(m.email, 'Email')}
                            className="text-slate-500 hover:text-white"
                            title="Copy email"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            isSuper
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isSuper ? <Shield className="w-3 h-3" /> : <Key className="w-3 h-3" />}
                          {m.role || 'support'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {isSuper ? (
                          <span className="text-rose-300/80 font-semibold">
                            Full Control (Financials, Outages, Config)
                          </span>
                        ) : (
                          <span className="text-emerald-300/80 font-semibold">
                            Player Support & Room Care (No Refunds)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {m.last_login
                          ? new Date(m.last_login).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                          : 'Never logged in'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user?.email !== m.email ? (
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">You</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#13141f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Create Employee Login</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Employee Email (Login ID)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="employee@elevora.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Employee will use this email & password to sign in to the Admin Panel.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role & Permissions</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="support">🛡️ Support Employee (Restricted - No Refunds / No Force-End)</option>
                  <option value="admin">👑 Administrator (Full Access)</option>
                  <option value="super_admin">⚡ Super Admin (Executive Level)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
