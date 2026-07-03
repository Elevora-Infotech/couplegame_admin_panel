import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Users, Activity, UserPlus, Gamepad2, CheckCircle2, Layers, AlertOctagon, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Overview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    newUsersToday: 0,
    dau: 0,
    completedGames: 0,
    avgCardsPlayed: 0,
    avgPenalties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/admin/dashboard/stats');
        if (response.data?.status === 'success') {
          setStats(response.data.data.stats);
        }
      } catch (error) {
        toast.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
    <div className="relative overflow-hidden rounded-3xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 shadow-xl transition-transform hover:scale-[1.02]">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent opacity-30`}></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-bold text-white tracking-tighter">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-20`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time metrics for the EleVora platform.</p>
      </div>

      <div className="space-y-6">
        {/* Top Row - Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={(stats?.totalUsers || 0).toLocaleString()} 
            icon={Users} 
            colorClass="text-indigo-400 bg-indigo-500" 
            gradientClass="from-indigo-500/20" 
          />
          <StatCard 
            title="DAU (Today)" 
            value={(stats?.dau || 0).toLocaleString()} 
            icon={Activity} 
            colorClass="text-emerald-400 bg-emerald-500" 
            gradientClass="from-emerald-500/20" 
          />
          <StatCard 
            title="New Users Today" 
            value={(stats?.newUsersToday || 0).toLocaleString()} 
            icon={UserPlus} 
            colorClass="text-blue-400 bg-blue-500" 
            gradientClass="from-blue-500/20" 
          />
          <StatCard 
            title="Active Games" 
            value={(stats?.activeSessions || 0).toLocaleString()} 
            icon={Gamepad2} 
            colorClass="text-amber-400 bg-amber-500" 
            gradientClass="from-amber-500/20" 
          />
        </div>

        {/* Bottom Row - Game Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Completed Games" 
            value={(stats?.completedGames || 0).toLocaleString()} 
            icon={CheckCircle2} 
            colorClass="text-purple-400 bg-purple-500" 
            gradientClass="from-purple-500/20" 
          />
          <StatCard 
            title="Avg Cards/Game" 
            value={stats?.avgCardsPlayed || 0} 
            icon={Layers} 
            colorClass="text-rose-400 bg-rose-500" 
            gradientClass="from-rose-500/20" 
          />
          <StatCard 
            title="Avg Penalties/Game" 
            value={stats?.avgPenalties || 0} 
            icon={AlertOctagon} 
            colorClass="text-orange-400 bg-orange-500" 
            gradientClass="from-orange-500/20" 
          />
        </div>
      </div>
    </div>
  );
}
