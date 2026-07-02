import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Users, Activity, Clock, TrendingUp, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeSessions: 0, lastUpdated: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        if (response.data?.status === 'success') {
          setStats(response.data.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Cache for 30s as per specs could mean polling or just not re-fetching
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users, 
      color: 'from-blue-500/20 to-blue-600/10',
      textColor: 'text-blue-400',
      trend: '+12.5%'
    },
    { 
      title: 'Active Sessions', 
      value: stats.activeSessions.toLocaleString(), 
      icon: Activity, 
      color: 'from-emerald-500/20 to-emerald-600/10',
      textColor: 'text-emerald-400',
      trend: '+5.2%'
    },
    { 
      title: 'Last Updated', 
      value: stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : '--:--', 
      icon: Clock, 
      color: 'from-purple-500/20 to-purple-600/10',
      textColor: 'text-purple-400',
      trend: 'Live'
    }
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview Stats</h1>
        <p className="text-slate-400 mt-2">Real-time metrics for the EleVora platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-3xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 shadow-xl hover:border-slate-600 transition-all duration-300 group`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">{stat.title}</p>
                  <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${stat.textColor}`} />
                    <span className={`text-sm font-medium ${stat.textColor}`}>{stat.trend}</span>
                    <span className="text-xs text-slate-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl bg-slate-900/50 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative Welcome Area */}
      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#1e293b] to-slate-900 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Command Center</h2>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              This dashboard provides complete control over the EleVora application. 
              Manage card catalogs, monitor user engagement, and configure the onboarding experience seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
