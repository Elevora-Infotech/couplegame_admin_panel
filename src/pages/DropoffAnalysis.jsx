import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { UserMinus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DropoffAnalysis() {
  const [data, setData] = useState({ dropoff: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/admin/dashboard/growth-analytics');
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load dropoff data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserMinus className="w-8 h-8 text-rose-500" />
            Drop-off Analysis
          </h1>
          <p className="text-slate-400 mt-1">Identify exact points where users abandon the app.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-rose-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.dropoff?.map((stage, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/50 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle className="w-24 h-24 text-rose-500" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{stage.dropoff_stage}</h3>
              
              <div className="flex items-end gap-3 mt-6">
                <span className="text-4xl font-black text-rose-500">{stage.users_dropped}</span>
                <span className="text-slate-400 pb-1">Users lost</span>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Abandonment Rate</span>
                  <span>{stage.dropoff_percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${stage.dropoff_percentage}%` }}></div>
                </div>
              </div>
            </div>
          ))}
          {(!data.dropoff || data.dropoff.length === 0) && (
             <div className="col-span-2 p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
               No drop-off data available yet.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
