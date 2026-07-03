import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { SplitSquareHorizontal, Plus, Play, Pause, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ABTesting() {
  const [data, setData] = useState({ abTests: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    test_type: 'NOTIFICATION',
    variants: [
      { name: 'A', config: '{}', traffic: 50 },
      { name: 'B', config: '{}', traffic: 50 }
    ]
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/dashboard/growth-analytics');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return toast.error('Please fill required fields');
    
    setCreating(true);
    try {
      await axiosInstance.post('/admin/dashboard/ab-tests', formData);
      toast.success('A/B Test created successfully!');
      setIsModalOpen(false);
      setFormData({
        name: '', description: '', test_type: 'NOTIFICATION',
        variants: [{ name: 'A', config: '{}', traffic: 50 }, { name: 'B', config: '{}', traffic: 50 }]
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create test');
    } finally {
      setCreating(false);
    }
  };

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
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors">
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

      {/* Create Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Create A/B Experiment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experiment Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500" placeholder="e.g. Penalty Urgency Notification" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500" placeholder="Testing urgency wording vs normal wording" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Test Type</label>
                <select value={formData.test_type} onChange={e => setFormData({...formData, test_type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500">
                  <option value="NOTIFICATION">Notification Wording</option>
                  <option value="CARD_TYPE">Card Type Testing</option>
                  <option value="PENALTY_RULE">Penalty Rule Testing</option>
                  <option value="UI_LAYOUT">UI Layout</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800/50">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Variants Config (JSON)</label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-sm font-bold text-amber-500 mb-2">Variant {v.name}</div>
                      <textarea 
                        value={v.config} 
                        onChange={(e) => {
                          const newV = [...formData.variants];
                          newV[idx].config = e.target.value;
                          setFormData({...formData, variants: newV});
                        }}
                        className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        placeholder='{"title": "Hurry!"}'
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button disabled={creating} type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50">
                  {creating ? 'Saving...' : 'Start Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
