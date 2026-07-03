import React, { useState, useEffect } from 'react';
import { 
  PackageOpen, Plus, Search, Edit2, Trash2, Tag, 
  CreditCard, Loader2, Image as ImageIcon, ChevronRight, CheckCircle2,
  XCircle, Copy, Check, Library
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function BundlesManagement() {
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', description: '', cover_image_url: '', is_active: true });
  const [planFormData, setPlanFormData] = useState({ name: '', price: '', card_count: 0 });
  const [editingId, setEditingId] = useState(null);
  
  // Card Selection state
  const [allCards, setAllCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [cardSearch, setCardSearch] = useState('');

  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/bundles');
      setBundles(data.data.bundles);
    } catch (error) {
      toast.error('Failed to load bundles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBundleDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/bundles/${id}`);
      setSelectedBundle(data.data.bundle);
    } catch (error) {
      toast.error('Failed to load bundle details');
    }
  };

  const fetchAllCards = async () => {
    try {
      const { data } = await api.get('/admin/dashboard/cards');
      setAllCards(data.data.cards);
    } catch (error) {
      toast.error('Failed to load catalog');
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Bundle ID copied for Store Product mapping!');
  };

  // --- Bundle CRUD ---
  const handleSaveBundle = async () => {
    if (!formData.name) return toast.error('Name is required');
    try {
      if (editingId) {
        await api.put(`/admin/bundles/${editingId}`, formData);
        toast.success('Bundle updated');
      } else {
        await api.post('/admin/bundles', formData);
        toast.success('Bundle created');
      }
      setIsModalOpen(false);
      fetchBundles();
      if (selectedBundle?.id === editingId) fetchBundleDetails(editingId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bundle');
    }
  };

  const handleDeleteBundle = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this bundle?')) return;
    try {
      await api.delete(`/admin/bundles/${id}`);
      toast.success('Bundle deactivated');
      fetchBundles();
      if (selectedBundle?.id === id) setSelectedBundle(null);
    } catch (error) {
      toast.error('Failed to delete bundle');
    }
  };

  // --- Plan CRUD ---
  const handleSavePlan = async () => {
    if (!planFormData.name || !planFormData.price) return toast.error('Name and price required');
    try {
      await api.post(`/admin/bundles/${selectedBundle.id}/plans`, planFormData);
      toast.success('Plan added');
      setIsPlanModalOpen(false);
      fetchBundleDetails(selectedBundle.id);
    } catch (error) {
      toast.error('Failed to add plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Delete this pricing plan?')) return;
    try {
      await api.delete(`/admin/plans/${planId}`);
      toast.success('Plan deleted');
      fetchBundleDetails(selectedBundle.id);
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  // --- Card Management ---
  const handleAddCards = async () => {
    if (selectedCards.length === 0) return toast.error('Select at least one card');
    try {
      await api.post(`/admin/bundles/${selectedBundle.id}/cards`, { card_ids: selectedCards });
      toast.success('Cards added to bundle');
      setIsCardModalOpen(false);
      fetchBundleDetails(selectedBundle.id);
    } catch (error) {
      toast.error('Failed to add cards');
    }
  };

  const handleRemoveCard = async (cardId) => {
    if (!window.confirm('Remove this card from the bundle?')) return;
    try {
      await api.delete(`/admin/bundles/${selectedBundle.id}/cards/${cardId}`);
      toast.success('Card removed');
      fetchBundleDetails(selectedBundle.id);
    } catch (error) {
      toast.error('Failed to remove card');
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <PackageOpen className="w-8 h-8 text-indigo-400" />
            Bundles Management
          </h1>
          <p className="text-slate-400 mt-1">Create and manage curated card bundles for the store.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', cover_image_url: '', is_active: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Bundle
        </button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Bundle List */}
        <div className="w-1/3 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-800/30 font-semibold text-slate-200">
            All Bundles
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : bundles.length === 0 ? (
              <div className="text-center text-slate-500 p-8">No bundles found</div>
            ) : (
              bundles.map(bundle => (
                <div 
                  key={bundle.id}
                  onClick={() => fetchBundleDetails(bundle.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedBundle?.id === bundle.id 
                    ? 'bg-indigo-500/10 border-indigo-500/50' 
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        {bundle.cover_image_url ? (
                          <img src={bundle.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 m-3 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{bundle.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{bundle.description || 'No description'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Bundle Details */}
        <div className="w-2/3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {selectedBundle ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                    {selectedBundle.cover_image_url ? (
                      <img src={selectedBundle.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 m-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-100">{selectedBundle.name}</h2>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedBundle.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {selectedBundle.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">{selectedBundle.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <code className="bg-slate-950 px-2 py-1 rounded text-xs text-slate-500 font-mono">
                        {selectedBundle.id}
                      </code>
                      <button 
                        onClick={() => handleCopyId(selectedBundle.id)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Copy ID for RevenueCat"
                      >
                        {copiedId === selectedBundle.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setFormData({ 
                        name: selectedBundle.name, 
                        description: selectedBundle.description || '', 
                        cover_image_url: selectedBundle.cover_image_url || '',
                        is_active: selectedBundle.is_active 
                      });
                      setEditingId(selectedBundle.id);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBundle(selectedBundle.id)}
                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Plans & Cards Grid */}
              <div className="flex-1 overflow-y-auto p-6 flex gap-6">
                
                {/* Plans List */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" /> Pricing Plans
                    </h3>
                    <button 
                      onClick={() => {
                        setPlanFormData({ name: '', price: '', card_count: 0 });
                        setIsPlanModalOpen(true);
                      }}
                      className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Plan
                    </button>
                  </div>
                  
                  {selectedBundle.bundle_pricing_plans?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedBundle.bundle_pricing_plans.map(plan => (
                        <div key={plan.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center group">
                          <div>
                            <div className="font-medium text-slate-200">{plan.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              ${plan.price} • {plan.card_count === 0 ? 'All Cards' : `${plan.card_count} Cards`}
                            </div>
                          </div>
                          <button onClick={() => handleDeletePlan(plan.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 text-rose-400 rounded transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-slate-800/30 rounded-lg text-slate-500 text-sm border border-dashed border-slate-700">
                      No pricing plans added. This bundle cannot be sold until a plan is created.
                    </div>
                  )}
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <Library className="w-4 h-4 text-emerald-400" /> Bundle Cards
                    </h3>
                    <button 
                      onClick={() => {
                        fetchAllCards();
                        setSelectedCards([]);
                        setIsCardModalOpen(true);
                      }}
                      className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Cards
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 mb-2">
                    Total Cards: {selectedBundle.bundle_cards?.length || 0}
                  </div>

                  {selectedBundle.bundle_cards?.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedBundle.bundle_cards.map(bc => (
                        <div key={bc.card_id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex gap-3 items-center group">
                          <div className="flex-1">
                            <div className="font-medium text-slate-200 text-sm">{bc.cards?.name || 'Unknown Card'}</div>
                            <div className="text-xs text-slate-400 truncate">{bc.cards?.power_description}</div>
                          </div>
                          <button onClick={() => handleRemoveCard(bc.card_id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 text-rose-400 rounded transition-all shrink-0">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-slate-800/30 rounded-lg text-slate-500 text-sm border border-dashed border-slate-700">
                      No cards in this bundle.
                    </div>
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <PackageOpen className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a bundle from the list to view and manage its contents</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT BUNDLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Bundle' : 'Create Bundle'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Bundle Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. The Spicy Expansion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none h-24"
                  placeholder="Describe this bundle..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cover Image URL</label>
                <input 
                  type="text" 
                  value={formData.cover_image_url}
                  onChange={e => setFormData({...formData, cover_image_url: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 bg-slate-950 border-slate-700 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Active (Visible in Store)</label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
              <button onClick={handleSaveBundle} className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium shadow-lg transition-colors">
                Save Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Add Pricing Plan</h2>
              <p className="text-xs text-slate-400 mt-1">For {selectedBundle?.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Plan Name *</label>
                <input 
                  type="text" 
                  value={planFormData.name}
                  onChange={e => setPlanFormData({...planFormData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Small Pack (10 Cards)"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Price ($) *</label>
                  <input 
                    type="number" step="0.01"
                    value={planFormData.price}
                    onChange={e => setPlanFormData({...planFormData, price: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="2.99"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Card Count</label>
                  <input 
                    type="number" 
                    value={planFormData.card_count}
                    onChange={e => setPlanFormData({...planFormData, card_count: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">0 means they get ALL cards</p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30">
              <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancel</button>
              <button onClick={handleSavePlan} className="px-5 py-2 bg-indigo-500 text-white rounded-lg font-medium">Save Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* SELECT CARDS MODAL */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <div>
                <h2 className="text-xl font-bold text-white">Add Cards to Bundle</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedCards.length} selected</p>
              </div>
              <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search cards by name or description..."
                  value={cardSearch}
                  onChange={e => setCardSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {allCards
                .filter(c => 
                  !selectedBundle?.bundle_cards?.find(bc => bc.card_id === c.id) &&
                  (c.name.toLowerCase().includes(cardSearch.toLowerCase()) || 
                   c.power_description.toLowerCase().includes(cardSearch.toLowerCase()))
                )
                .map(card => {
                  const isSelected = selectedCards.includes(card.id);
                  return (
                    <div 
                      key={card.id}
                      onClick={() => {
                        if (isSelected) setSelectedCards(prev => prev.filter(id => id !== card.id));
                        else setSelectedCards(prev => [...prev, card.id]);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex gap-3 items-center ${
                        isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 text-sm flex items-center gap-2">
                          {card.name} 
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">{card.card_categories?.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{card.power_description}</div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30">
              <button onClick={() => setIsCardModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancel</button>
              <button 
                onClick={handleAddCards} 
                disabled={selectedCards.length === 0}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Add {selectedCards.length > 0 ? selectedCards.length : ''} Cards
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
