import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Users, Activity, UserPlus, Gamepad2, CheckCircle2, Layers, AlertOctagon, TrendingUp, Sparkles } from 'lucide-react';
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
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-violet-500/20"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, delay }) => (
    <div 
      className={`relative overflow-hidden rounded-[2rem] glass-card p-5 md:p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] group animate-in fade-in slide-in-from-bottom-8 fill-mode-both`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700`}></div>
      
      {/* Shimmer effect border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 mb-2 md:mb-3 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tighter">
            {value}
          </h3>
        </div>
        <div className={`p-3 md:p-4 rounded-2xl ${colorClass} bg-white/5 border border-white/5 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent opacity-20`}></div>
          <Icon className="w-5 h-5 md:w-7 md:h-7 relative z-10" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-violet-400 animate-pulse" />
            <span className="text-[10px] md:text-sm font-bold text-violet-400 uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">System Overview</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 md:mt-2 font-medium">Real-time metrics and platform intelligence.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Row - Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={(stats?.totalUsers || 0).toLocaleString()} 
            icon={Users} 
            colorClass="text-violet-400" 
            gradientClass="from-violet-500"
            delay={100}
          />
          <StatCard 
            title="DAU (Today)" 
            value={(stats?.dau || 0).toLocaleString()} 
            icon={Activity} 
            colorClass="text-emerald-400" 
            gradientClass="from-emerald-500"
            delay={200}
          />
          <StatCard 
            title="New Users Today" 
            value={(stats?.newUsersToday || 0).toLocaleString()} 
            icon={UserPlus} 
            colorClass="text-blue-400" 
            gradientClass="from-blue-500"
            delay={300}
          />
          <StatCard 
            title="Active Games" 
            value={(stats?.activeSessions || 0).toLocaleString()} 
            icon={Gamepad2} 
            colorClass="text-amber-400" 
            gradientClass="from-amber-500"
            delay={400}
          />
        </div>

        {/* Bottom Row - Game Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Completed Games" 
            value={(stats?.completedGames || 0).toLocaleString()} 
            icon={CheckCircle2} 
            colorClass="text-purple-400" 
            gradientClass="from-purple-500"
            delay={500}
          />
          <StatCard 
            title="Avg Cards/Game" 
            value={stats?.avgCardsPlayed || 0} 
            icon={Layers} 
            colorClass="text-rose-400" 
            gradientClass="from-rose-500"
            delay={600}
          />
          <StatCard 
            title="Avg Penalties/Game" 
            value={stats?.avgPenalties || 0} 
            icon={AlertOctagon} 
            colorClass="text-orange-400" 
            gradientClass="from-orange-500"
            delay={700}
          />
        </div>
      </div>
    </div>
  );
}
