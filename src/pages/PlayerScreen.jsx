import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Smartphone, CreditCard, HeartHandshake,
  Calendar, CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw, ChevronRight, DoorOpen
} from 'lucide-react';
import { adminUserApi } from '../api/adminUserApi';

export default function PlayerScreen() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlayer = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminUserApi.getById(userId);
      if (res.data?.status === 'success') {
        setPlayer(res.data.data.user);
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load player:', err);
      setError(err.response?.data?.message || 'Player not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchPlayer();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-medium">Loading player dossier...</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Player not found.'}</p>
        <button
          onClick={() => navigate('/users')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/users')}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{player.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              player.is_blocked ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}>
              {player.is_blocked ? '🔴 Blocked' : '🟢 Active'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Player Dossier (Spec B2) • Email Unmasked Exclusively for Support</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
              {player.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">{player.name}</h2>
              {/* Email unmasked exclusively here */}
              <p className="text-xs text-emerald-300 font-mono flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <Mail className="w-3.5 h-3.5" />
                {player.email}
              </p>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Phone: {player.phone_masked || player.phone || '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400 block">Sign-up Method</span>
              <span className="font-bold text-white uppercase mt-0.5 block">{player.auth_provider || 'Email'}</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400 block">Platform</span>
              <span className="font-bold text-white uppercase mt-0.5 block">{player.platform || 'Android'}</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400 block">App Version</span>
              <span className="font-bold text-white font-mono mt-0.5 block">{player.app_version || '1.0.0'}</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400 block">Push Enabled</span>
              <span className="font-bold text-white mt-0.5 block">{player.push_enabled !== false ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Cross-Link to Active Couple */}
        {stats?.active_room && (
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-violet-500/5 p-4 rounded-2xl border border-violet-500/20">
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-xs font-bold text-white">
                  Active in Couple Room <span className="font-mono text-violet-300 font-extrabold">{stats.active_room.code}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Mode: <span className="uppercase text-slate-300 font-semibold">{stats.active_room.mode || 'Free'}</span> • Status: {stats.active_room.status}
                </p>
              </div>
            </div>
            <Link
              to={`/couple/${stats.active_room.id}`}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              Open Couple Workbench <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Gameplay & Room History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Game Stats */}
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Gameplay Performance</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400">Cards Sent</span>
              <p className="text-lg font-bold text-white mt-0.5">{stats?.card_stats?.total_sent || 0}</p>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400">Completed</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{stats?.card_stats?.completed || 0}</p>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400">Penalties</span>
              <p className="text-lg font-bold text-rose-400 mt-0.5">{stats?.total_penalties || 0}</p>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-slate-400">Deck Cards Remaining</span>
              <p className="text-lg font-bold text-violet-300 mt-0.5">{stats?.deck_cards_remaining || 0}</p>
            </div>
          </div>
        </div>

        {/* Room History */}
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rooms Past & Present</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {(!stats?.room_history || stats.room_history.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No past rooms found.</p>
            ) : (
              stats.room_history.map(r => (
                <div key={r.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">{r.code}</span>
                    <span className="text-slate-500 ml-2">Role: {r.is_host ? 'Creator' : 'Joiner'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                      {r.status}
                    </span>
                    <Link to={`/couple/${r.id}`} className="text-violet-400 hover:text-white">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
