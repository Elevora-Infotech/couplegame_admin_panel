import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  BarChart3, TrendingUp, CheckCircle, XCircle, AlertTriangle, 
  Clock, Search, ArrowUpDown, Loader2, RefreshCw 
} from 'lucide-react';

export default function CardAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'times_played', direction: 'desc' });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/dashboard/cards-analytics');
      setAnalytics(data.data.analytics);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load card analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = [...analytics];
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title?.toLowerCase().includes(lower) || 
        c.category_name?.toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) => {
      const valA = a[sortConfig.key] || 0;
      const valB = b[sortConfig.key] || 0;
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [analytics, searchTerm, sortConfig]);

  const Th = ({ label, sortKey }) => (
    <th 
      onClick={() => handleSort(sortKey)}
      className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortConfig.key === sortKey ? 'text-primary-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
      </div>
    </th>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            Card Performance Analytics
          </h1>
          <p className="text-slate-400 mt-1">Deep insights into how users are engaging with each card.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-medium border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Global Stats Overview (Averages of all cards) */}
      {!loading && analytics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard 
            icon={TrendingUp} label="Total Plays" color="bg-blue-500"
            value={analytics.reduce((acc, c) => acc + Number(c.times_played), 0).toLocaleString()} 
          />
          <StatCard 
            icon={CheckCircle} label="Avg Accept Rate" color="bg-emerald-500"
            value={`${(analytics.reduce((acc, c) => acc + Number(c.acceptance_rate), 0) / analytics.length).toFixed(1)}%`} 
          />
          <StatCard 
            icon={AlertTriangle} label="Avg Penalty Rate" color="bg-rose-500"
            value={`${(analytics.reduce((acc, c) => acc + Number(c.penalty_rate), 0) / analytics.length).toFixed(1)}%`} 
          />
          <StatCard 
            icon={XCircle} label="Avg Deflect Rate" color="bg-purple-500"
            value={`${(analytics.reduce((acc, c) => acc + Number(c.deflect_rate), 0) / analytics.length).toFixed(1)}%`} 
          />
          <StatCard 
            icon={Clock} label="Avg Response" color="bg-amber-500"
            value={`${(analytics.reduce((acc, c) => acc + Number(c.avg_response_time_minutes), 0) / analytics.length).toFixed(1)}m`} 
          />
        </div>
      )}

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">Card Metrics Breakdown</h2>
          <div className="relative w-64">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search cards or categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <Th label="Card Title" sortKey="title" />
                <Th label="Category" sortKey="category_name" />
                <Th label="Plays" sortKey="times_played" />
                <Th label="Accept %" sortKey="acceptance_rate" />
                <Th label="Complete %" sortKey="completion_rate" />
                <Th label="Penalty %" sortKey="penalty_rate" />
                <Th label="Deflect %" sortKey="deflect_rate" />
                <Th label="Avg Resp (m)" sortKey="avg_response_time_minutes" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />
                    Crunching analytics data...
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No card analytics found.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(c => (
                  <tr key={c.card_id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      <span className="px-2 py-1 bg-slate-800 rounded-md text-xs border border-slate-700">
                        {c.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{Number(c.times_played).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <MetricBadge value={c.acceptance_rate} goodThreshold={70} suffix="%" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <MetricBadge value={c.completion_rate} goodThreshold={60} suffix="%" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <MetricBadge value={c.penalty_rate} goodThreshold={20} inverse suffix="%" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <MetricBadge value={c.deflect_rate} goodThreshold={15} inverse suffix="%" />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {c.avg_response_time_minutes}m
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none mb-1">{value}</p>
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function MetricBadge({ value, goodThreshold, inverse = false, suffix = '' }) {
  const num = Number(value);
  let color = 'text-slate-400 bg-slate-800/50'; // Default gray
  
  if (num > 0) {
    if (inverse) {
      // Lower is better (Penalties, Deflects)
      if (num > goodThreshold) color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      else color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else {
      // Higher is better (Acceptance, Completion)
      if (num >= goodThreshold) color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      else color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  }

  return (
    <span className={`px-2 py-1 rounded border inline-flex items-center justify-center text-xs font-semibold ${color}`}>
      {num}{suffix}
    </span>
  );
}
