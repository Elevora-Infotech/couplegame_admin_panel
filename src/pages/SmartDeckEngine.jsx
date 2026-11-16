import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, RefreshCw, Search, ShieldCheck, AlertTriangle, 
  Layers, CheckCircle2, Sparkles, PieChart, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminIntelligenceApi } from '../api/adminIntelligenceApi';
import api from '../api/axiosInstance';

export default function SmartDeckEngine() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  const fetchActiveRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/games?limit=15&status=ACTIVE');
      const gameRooms = res.data?.data?.games || [];
      setRooms(gameRooms);
      if (gameRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(gameRooms[0].id);
        fetchAudit(gameRooms[0].id);
      }
    } catch (err) {
      toast.error('Failed to load active couple rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudit = async (roomId) => {
    try {
      setAuditLoading(true);
      const res = await adminIntelligenceApi.getSmartDeckAudit(roomId);
      if (res.data?.status === 'success') {
        setAudit(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to audit couple smart deck');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    fetchAudit(roomId);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <LayoutGrid className="w-6 h-6" />
            </div>
            Smart Deck & 80/20 Distribution Engine (Part C1)
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Read-only algorithmic audit inspecting the 80% novel / 20% repeat card distribution across active couples.
          </p>
        </div>
        <button
          onClick={fetchActiveRooms}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center gap-3 text-xs text-cyan-300">
        <Info className="w-5 h-5 shrink-0 text-cyan-400" />
        <p>
          <strong>Read-Only Engine Inspection:</strong> This audit dashboard reads deal statistics and deck depth. It does not alter or re-shuffle active player hands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Active Rooms Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Active Couple Room</p>
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading active rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No active rooms found.</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {rooms.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRoom(r.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                    selectedRoomId === r.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/5'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-white text-sm">{r.code}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{r.host?.name || 'Host'} & {r.partner?.name || 'Partner'}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Smart Deck Audit Metrics */}
        <div className="md:col-span-2 space-y-4">
          {auditLoading ? (
            <div className="h-64 flex items-center justify-center text-cyan-400">
              Auditing deck allocation algorithm...
            </div>
          ) : !audit ? (
            <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl border border-white/10">
              Select an active room on the left to inspect its smart deck distribution.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Cards Dealt</p>
                  <p className="text-2xl font-black text-white mt-1">{audit.metrics?.total_cards_dealt || 0}</p>
                  <p className="text-[10px] text-slate-500">In this room</p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Novel Cards</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{audit.metrics?.novel_cards || 0}</p>
                  <p className="text-[10px] text-emerald-400/80">First-time prompts</p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Repeat Cards</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">{audit.metrics?.repeat_cards || 0}</p>
                  <p className="text-[10px] text-purple-400/80">Replayed favorites</p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Remaining Pool</p>
                  <p className="text-2xl font-black text-cyan-400 mt-1">{audit.metrics?.remaining_pool_depth || 0}</p>
                  <p className="text-[10px] text-cyan-400/80">Unplayed cards</p>
                </div>
              </div>

              {/* 80/20 Ratio Health Panel */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    80/20 Distribution Ratio Health
                  </h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    audit.metrics?.algorithm_health === 'HEALTHY'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {audit.metrics?.algorithm_health}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Target Standard:</span>
                    <span className="text-white font-mono">{audit.metrics?.target_ratio}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Current Room Ratio:</span>
                    <span className="text-emerald-400 font-mono font-bold">{audit.metrics?.actual_ratio}</span>
                  </div>
                </div>

                {/* Deck Saturation Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Catalog Deck Saturation:</span>
                    <span className="font-bold text-white">{audit.metrics?.saturation_percentage}% exhausted</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${audit.metrics?.saturation_percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Couple room code: <strong className="text-white font-mono">{audit.room_code}</strong> ({audit.host_name} & {audit.partner_name})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
