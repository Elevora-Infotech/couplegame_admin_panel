import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  Users, Activity, HeartHandshake, AlertOctagon, 
  Clock, Search, ArrowUpDown, Loader2, RefreshCw, ChevronRight
} from 'lucide-react';

export default function RelationshipDynamics() {
  const [dynamics, setDynamics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'total_accepted', direction: 'desc' });

  const fetchDynamics = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/dashboard/relationship-dynamics');
      setDynamics(data.data.analytics || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load relationship dynamics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamics();
  }, []);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = [...dynamics];
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.host_name?.toLowerCase().includes(lower) || 
        r.partner_name?.toLowerCase().includes(lower)
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
  }, [dynamics, searchTerm, sortConfig]);

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
            <HeartHandshake className="w-8 h-8 text-rose-500" />
            Relationship Dynamics
          </h1>
          <p className="text-slate-400 mt-1">Behavioral analysis of couples: who initiates more, who takes longer to respond.</p>
        </div>
        <button 
          onClick={fetchDynamics}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-medium border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">Couple Game Rooms</h2>
          <div className="relative w-64">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search couples by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <Th label="Couple (Room)" sortKey="host_name" />
                <Th label="Initiation Balance (Host vs P2)" sortKey="host_sends" />
                <Th label="Avg Response Delay" sortKey="host_avg_response_minutes" />
                <Th label="Completion Ratio" sortKey="completion_ratio" />
                <Th label="Penalty Freq." sortKey="total_penalties" />
                <Th label="Status" sortKey="room_status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-500" />
                    Crunching behavioral data...
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No couples found.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(r => (
                  <tr key={r.room_id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-blue-400">
                            {r.host_name?.charAt(0) || 'H'}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-rose-500/20 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-rose-400">
                            {r.partner_name?.charAt(0) || '?'}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{r.host_name} & {r.partner_name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{r.room_id.split('-')[0]}...</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Initiation Balance */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 w-full max-w-[150px]">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400 font-medium">{r.host_sends} sent</span>
                          <span className="text-rose-400 font-medium">{r.partner_sends} sent</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${(Number(r.host_sends) / Math.max(1, (Number(r.host_sends) + Number(r.partner_sends)))) * 100}%` }}
                          />
                          <div 
                            className="h-full bg-rose-500" 
                            style={{ width: `${(Number(r.partner_sends) / Math.max(1, (Number(r.host_sends) + Number(r.partner_sends)))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    
                    {/* Response Delays */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px]">H</span>
                          <span className="text-slate-300">{r.host_avg_response_minutes}m avg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[8px]">P</span>
                          <span className="text-slate-300">{r.partner_avg_response_minutes}m avg</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Completion Ratio */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MetricBadge value={r.completion_ratio} goodThreshold={60} suffix="%" />
                        <span className="text-xs text-slate-500">({r.total_completed}/{r.total_accepted})</span>
                      </div>
                    </td>
                    
                    {/* Penalty Frequency */}
                    <td className="px-4 py-3 text-sm">
                      <MetricBadge value={r.total_penalties} goodThreshold={3} inverse suffix=" total" />
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                        r.room_status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        r.room_status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {r.room_status}
                      </span>
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
function MetricBadge({ value, goodThreshold, inverse = false, suffix = '' }) {
  const num = Number(value);
  let color = 'text-slate-400 bg-slate-800/50';
  
  if (num > 0) {
    if (inverse) {
      if (num > goodThreshold) color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      else color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else {
      if (num >= goodThreshold) color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      else color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  } else {
    // If value is 0 and it's penalties (inverse), that's perfectly good!
    if (inverse) color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  }

  return (
    <span className={`px-2 py-1 rounded border inline-flex items-center justify-center text-xs font-semibold ${color}`}>
      {num}{suffix}
    </span>
  );
}
