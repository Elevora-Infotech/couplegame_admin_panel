import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Search, Plus, Edit3, Trash2, X, Loader2,
  Shield, ToggleLeft, ToggleRight, Library, Zap, Eye, EyeOff, Filter
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────
const CARD_TYPES = ['ACTION', 'WILDCARD', 'DEFENSE', 'REACTION'];

const DEFLECT_ACTIONS = [
  { value: '', label: '— None (Regular Card) —' },
  { value: 'CANCEL_ANY',         label: 'CANCEL_ANY — Cancel SENT or WAITING' },
  { value: 'CANCEL_SENT_ONLY',   label: 'CANCEL_SENT_ONLY — Cancel only if SENT (Nice Try)' },
  { value: 'CANCEL_IN_PROGRESS', label: 'CANCEL_IN_PROGRESS — Cancel even if IN_PROGRESS (Party Pooper)' },
  { value: 'CANCEL_IMMUNE',      label: 'CANCEL_IMMUNE — Cancel + make immune (Not Today Satan)' },
  { value: 'REVERSE_ROLES',      label: 'REVERSE_ROLES — Swap sender/receiver' },
  { value: 'TIMEOUT',            label: 'TIMEOUT — Add +10 min to deadline' },
];

const TYPE_STYLES = {
  ACTION:   'bg-rose-500/10   text-rose-400   border-rose-500/20',
  WILDCARD: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  DEFENSE:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
  REACTION: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

const EMPTY_FORM = {
  category_id: '', name: '', power_description: '',
  card_type: 'ACTION', deflect_action: '', image_url: '', is_active: true,
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Card Form Modal ───────────────────────────────────────────
function CardModal({ categories, editCard, onClose, onSaved }) {
  const deflectCat = categories.find(c => c.name.toLowerCase().includes('deflect'));
  const isExistingDeflect = editCard && (editCard.deflect_action || (deflectCat && editCard.card_categories?.id === deflectCat.id));

  const [form, setForm] = useState(editCard ? {
    category_id:       isExistingDeflect && deflectCat ? deflectCat.id : (editCard.card_categories?.id || ''),
    name:              editCard.name || '',
    power_description: editCard.power_description || '',
    card_type:         isExistingDeflect ? 'DEFENSE' : (editCard.card_type || 'ACTION'),
    deflect_action:    editCard.deflect_action || '',
    image_url:         editCard.image_url || '',
    is_active:         editCard.is_active ?? true,
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.name || !form.power_description) {
      toast.error('Category, name and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, deflect_action: form.deflect_action || null };
      
      // Enforce deflect card rules on payload
      if (isExistingDeflect) {
        payload.card_type = 'DEFENSE';
        if (deflectCat) payload.category_id = deflectCat.id;
      }

      if (editCard) {
        await axiosInstance.put(`/admin/dashboard/cards/${editCard.id}`, payload);
        toast.success('Card updated');
      } else {
        await axiosInstance.post('/admin/dashboard/cards', payload);
        toast.success('Card created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = isExistingDeflect 
    ? (deflectCat ? [deflectCat] : categories)
    : categories.filter(c => !deflectCat || c.id !== deflectCat.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Library className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{editCard ? 'Edit Card' : 'Add New Card'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} required disabled={isExistingDeflect}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="" disabled>Select category…</option>
              {categoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g., The Honest Hour"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>

          {/* Power Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Power Description *</label>
            <textarea value={form.power_description} onChange={e => set('power_description', e.target.value)} required
              rows={3} placeholder="Describe what this card does…"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
          </div>

          {/* Card Type + Deflect Action side by side */}
          <div className={`grid ${isExistingDeflect ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Type *</label>
              <select value={form.card_type} onChange={e => set('card_type', e.target.value)} disabled={isExistingDeflect}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
                {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {isExistingDeflect && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Deflect Action <span className="text-purple-400">(Deflect cards only)</span>
                </label>
                <select value={form.deflect_action} onChange={e => set('deflect_action', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  {DEFLECT_ACTIONS.filter(d => d.value !== '').map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Image URL <span className="text-slate-600 font-normal">(optional)</span></label>
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-slate-500">Inactive cards are hidden from user decks and master deck selection</p>
            </div>
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Deflect hint */}
          {form.deflect_action && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-xs text-purple-300">
                <span className="font-semibold">⚡ Deflect Card:</span> This card will be granted automatically to users in 30-day rooms (5 random deflect cards per user). It is NOT sent via the normal card-send flow.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : editCard ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CardCatalog() {
  const [cards, setCards]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editCard, setEditCard]     = useState(null);

  // Filters
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [catFilter, setCatFilter]     = useState('');
  const [deflectOnly, setDeflectOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');

  const fetchCategories = async () => {
    try {
      const r = await axiosInstance.get('/admin/dashboard/categories');
      setCategories(r.data.data.categories || []);
    } catch (_) {}
  };

  const fetchStats = async () => {
    try {
      const r = await axiosInstance.get('/admin/dashboard/cards/stats');
      setStats(r.data.data.stats);
    } catch (_) {}
  };

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)       params.search = search;
      if (typeFilter)   params.card_type = typeFilter;
      if (catFilter)    params.category_id = catFilter;
      if (deflectOnly)  params.deflect_only = true;
      if (activeFilter) params.is_active = activeFilter;
      const r = await axiosInstance.get('/admin/dashboard/cards', { params });
      setCards(r.data.data.cards || []);
    } catch (e) {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, catFilter, deflectOnly, activeFilter]);

  useEffect(() => { fetchCategories(); fetchStats(); }, []);
  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleToggleActive = async (card) => {
    try {
      await axiosInstance.patch(`/admin/dashboard/cards/${card.id}/toggle`, { is_active: !card.is_active });
      toast.success(card.is_active ? 'Card deactivated' : 'Card activated');
      fetchCards();
      fetchStats();
    } catch (e) {
      toast.error('Failed to toggle card status');
    }
  };

  const handleDelete = async (card) => {
    if (!confirm(`Delete "${card.name}"? This soft-deletes it (sets inactive).`)) return;
    try {
      await axiosInstance.delete(`/admin/dashboard/cards/${card.id}`);
      toast.success('Card deleted');
      fetchCards();
      fetchStats();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete card');
    }
  };

  const openEdit = (card) => { setEditCard(card); setModalOpen(true); };
  const openCreate = () => { setEditCard(null); setModalOpen(true); };

  const handleSearchSubmit = (e) => { e.preventDefault(); setSearch(searchInput); };
  const clearFilters = () => {
    setSearch(''); setSearchInput('');
    setTypeFilter(''); setCatFilter('');
    setDeflectOnly(false); setActiveFilter('');
  };
  const hasFilters = search || typeFilter || catFilter || deflectOnly || activeFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Card Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">Manage regular cards and deflect cards — create, edit, toggle active status.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Library}   label="Total Cards"    value={stats?.total}         color="bg-indigo-500/80" />
        <StatCard icon={Eye}       label="Active"         value={stats?.active}         color="bg-emerald-500/80" />
        <StatCard icon={EyeOff}    label="Inactive"       value={stats?.inactive}       color="bg-slate-600" />
        <StatCard icon={Shield}    label="Deflect Cards"  value={stats?.deflect_cards}  color="bg-purple-500/80" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search cards by name…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {/* Card Type */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option value="">All Types</option>
            {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Category */}
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Active */}
          <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Deflect toggle */}
          <button type="button" onClick={() => setDeflectOnly(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${deflectOnly ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}>
            <Shield className="w-4 h-4" />
            Deflect Cards Only
          </button>

          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl border border-slate-700 transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">
            {loading ? 'Loading…' : `${cards.length} Cards`}
            {deflectOnly && <span className="ml-2 text-xs text-purple-400">(Deflect only)</span>}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Library className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No cards found.</p>
            <button onClick={openCreate} className="mt-3 text-xs text-indigo-400 hover:underline">Add the first card</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-3 text-left">Card</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Deflect Action</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {cards.map(card => (
                  <tr key={card.id} className={`hover:bg-slate-800/30 transition-colors ${!card.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {card.image_url ? (
                          <img src={card.image_url} alt={card.name} className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                            {card.deflect_action ? <Shield className="w-4 h-4 text-purple-400" /> : <Zap className="w-4 h-4 text-indigo-400" />}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{card.name}</p>
                          <p className="text-xs text-slate-500 max-w-[200px] truncate">{card.power_description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300">
                        {card.card_categories?.theme_color && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: card.card_categories.theme_color }} />
                        )}
                        {card.card_categories?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_STYLES[card.card_type] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {card.card_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {card.deflect_action ? (
                        <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20 font-semibold">
                          <Shield className="w-3 h-3" /> {card.deflect_action}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleActive(card)} title={card.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className="flex items-center gap-1.5 transition-all hover:opacity-80">
                        {card.is_active ? (
                          <><ToggleRight className="w-5 h-5 text-emerald-400" /><span className="text-xs text-emerald-400 font-semibold">Active</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-slate-600" /><span className="text-xs text-slate-500">Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(card)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(card)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <CardModal
          categories={categories}
          editCard={editCard}
          onClose={() => { setModalOpen(false); setEditCard(null); }}
          onSaved={() => { fetchCards(); fetchStats(); }}
        />
      )}
    </div>
  );
}
