import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { SplitSquareHorizontal, Plus, Play, Pause, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ABTesting() {
  const [data, setData] = useState({ abTests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/admin/dashboard/growth-analytics');
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load A/B tests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <SplitSquareHorizontal className="w-8 h-8 text-amber-500" />
            A/B Testing System
          </h1>
          <p className="text-slate-400 mt-1">Run experiments on notification wording, cards, and penalties.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Create New Test
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-amber-500">Loading...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase text-slate-500 font-medium tracking-wider">
              <tr>
                <th className="px-6 py-4">Experiment Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.abTests?.map((test) => (
                <tr key={test.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white">{test.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{test.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {test.test_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {test.status === 'ACTIVE' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Play className="w-3 h-3"/> Active</span>}
                    {test.status === 'PAUSED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20"><Pause className="w-3 h-3"/> Paused</span>}
                    {test.status === 'COMPLETED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20"><CheckCircle2 className="w-3 h-3"/> Completed</span>}
                    {test.status === 'DRAFT' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-400 border border-slate-700">Draft</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(test.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!data.abTests || data.abTests.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No active A/B experiments. Click "Create New Test" to begin optimizing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
