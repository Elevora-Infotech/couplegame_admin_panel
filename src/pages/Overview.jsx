import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Users, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Overview() {
  const [stats, setStats] = useState({ totalUsers: 0, activeSessions: 0 });
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-slate-400 mt-1">Real-time metrics for the EleVora platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Total Users</p>
              <h3 className="text-6xl font-bold text-white tracking-tighter">{stats.totalUsers.toLocaleString()}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Active Sessions</p>
              <h3 className="text-6xl font-bold text-white tracking-tighter">{stats.activeSessions.toLocaleString()}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
