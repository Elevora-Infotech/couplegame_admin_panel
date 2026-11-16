import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Plus, Edit3, Trash2, X, Loader2,
  Shield, ToggleLeft, ToggleRight, Library, Zap, Eye, EyeOff, Filter,
  Flame, Clock, GitBranch
} from 'lucide-react';
import { adminContentApi } from '../api/adminContentApi';
import { useAuth } from '../context/AuthContext';

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
    category_id:       isExistingDeflect && deflectCat ? deflectCat.id : (editCard.category_id || editCard.card_categories?.id || ''),
    name:              editCard.name || '',
    power_description: editCard.prompt || editCard.power_description || '',
    card_type:         isExistingDeflect ? 'DEFENSE' : (editCard.card_type || 'ACTION'),
    deflect_action:    editCard.deflect_action || '',
    spice_level:       editCard.spice_level || editCard.attributes?.spice_level || 1,
    timer_hours:       editCard.timer_hours || editCard.attributes?.timer_hours || 24,
    penalty_prompt:    editCard.penalty_prompt || editCard.attributes?.penalty_prompt || '',
    reason:            '',
  } : {
    category_id:       '',
    name:              '',
    power_description: '',
    card_type:         'ACTION',
    deflect_action:    '',
    spice_level:       1,
    timer_hours:       24,
    penalty_prompt:    '',
    reason:            '',
  });

  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.name.trim() || !form.power_description.trim()) {
      toast.error('Category, name and description are required');
      return;
    }
    if (!form.reason.trim() || form.reason.trim().length < 5) {
      toast.error('A detailed business reason (minimum 5 characters) is mandatory.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        prompt: form.power_description.trim(),
        categoryId: form.category_id,
        cardType: form.card_type,
        spiceLevel: Number(form.spice_level) || 1,
        timerHours: Number(form.timer_hours) || 24,
        penaltyPrompt: form.penalty_prompt || '',
        reason: form.reason.trim(),
      };

      if (editCard) {
        await adminContentApi.updateCard(editCard.id, payload);
        toast.success(`Card updated to next version with audit log.`);
      } else {
        await adminContentApi.createCard(payload);
        toast.success('New card created with version 1.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{editCard ? 'Edit Dare Card (Increments Version)' : 'Add New Dare Card'}</h2>
              {editCard && (
                <span className="text-xs text-indigo-300 font-mono">Current: v{editCard.version || editCard.attributes?.version || 1}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
            <select 
              value={form.category_id} 
              onChange={e => set('category_id', e.target.value)} 
              required 
              disabled={isExistingDeflect}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="" disabled>Select category…</option>
              {categoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Name *</label>
            <input 
              value={form.name} 
              onChange={e => set('name', e.target.value)} 
              required
              placeholder="e.g., Midnight Whisper Dare"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
            />
          </div>

          {/* Power Description (Dare Prompt) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dare Prompt / Action *</label>
            <textarea 
              value={form.power_description} 
              onChange={e => set('power_description', e.target.value)} 
              required
              rows={3} 
              placeholder="Describe the exact action or dare the receiver must complete…"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" 
            />
          </div>

          {/* Spice Level & Timer Hours (Dynamic Timers) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Spice Rating (1-5)</label>
              <select
                value={form.spice_level}
                onChange={e => set('spice_level', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="1">Level 1 - Playful & Sweet</option>
                <option value="2">Level 2 - Flirty & Warm</option>
                <option value="3">Level 3 - Spicy</option>
                <option value="4">Level 4 - Very Steamy</option>
                <option value="5">Level 5 - Wild Intimacy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dynamic Timer (Hours)</label>
              <select
                value={form.timer_hours}
                onChange={e => set('timer_hours', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours (Weekend)</option>
              </select>
            </div>
          </div>

          {/* Custom Penalty Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Custom Penalty Prompt (Optional)</label>
            <input 
              value={form.penalty_prompt} 
              onChange={e => set('penalty_prompt', e.target.value)}
              placeholder="e.g., Must prepare breakfast in bed if timer expires"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
            />
          </div>

          {/* Mandatory Audit Reason */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
              Mandatory Business Reason (Min 5 chars) *
            </label>
            <textarea
              required
              rows={2}
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder="e.g., Content refinement for clarity / typo fix / spicy deck refresh..."
              className="w-full px-3 py-2 bg-slate-800 border border-amber-500/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Library className="w-4 h-4" />}
              {editCard ? 'Save Version' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CardCatalog() {
  const { isAdmin } = useAuth();
  const [cards, setCards]             = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editCard, setEditCard]       = useState(null);
  const [modalOpen, setModalOpen]     = useState(false);

  // Filters
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [catFilter, setCatFilter]     = useState('');
  const [spiceFilter, setSpiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCategories = async () => {
    try {
      const r = await adminContentApi.getCategories();
      setCategories(r.data.data.categories || []);
    } catch (_) {}
  };

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminContentApi.getCards({
        search,
        categoryId: catFilter,
        spiceLevel: spiceFilter,
        status: statusFilter,
        limit: 50,
      });
      setCards(res.data.data.cards || []);
    } catch (e) {
      toast.error('Failed to load card catalog');
    } finally {
      setLoading(false);
    }
  }, [search, catFilter, spiceFilter, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleToggleActive = async (card) => {
    if (!isAdmin) {
      toast.error('Restricted: Only Admin users can toggle card availability.');
      return;
    }

    const reason = prompt(`MANDATORY REASON: Please enter reason for ${card.is_active ? 'retiring' : 'restoring'} "${card.name}" (min 5 chars):`);
    if (reason === null) return;
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Action rejected: A detailed reason (minimum 5 characters) is mandatory.');
      return;
    }

    try {
      await adminContentApi.toggleCard(card.id, { isActive: !card.is_active, reason: reason.trim() });
      toast.success(card.is_active ? 'Card retired from deck pool' : 'Card restored to active deck');
      fetchCards();
    } catch (e) {
      toast.error('Failed to update card status');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCatFilter('');
    setSpiceFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Library className="w-6 h-6" />
            </div>
            Card Catalog & Version Control
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Dynamic card catalog with immutable prompt versioning, spice flame ratings, and custom timers.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => { setEditCard(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Add Dare Card
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row flex-wrap gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search prompt or title…"
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </form>

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={spiceFilter}
          onChange={e => setSpiceFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Spice Levels</option>
          <option value="1">🌶️ Level 1 (Warm)</option>
          <option value="2">🌶️ Level 2 (Flirty)</option>
          <option value="3">🌶️ Level 3 (Spicy)</option>
          <option value="4">🌶️ Level 4 (Steamy)</option>
          <option value="5">🌶️ Level 5 (Wild)</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Retired Only</option>
        </select>

        {(search || catFilter || spiceFilter || statusFilter) && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cards Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h2 className="font-semibold text-white text-sm">
            {loading ? 'Loading…' : `${cards.length} Cards in Deck Pool`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-indigo-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Library className="w-12 h-12 mb-3 opacity-30 text-indigo-400" />
            <p className="text-sm">No cards match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-white/[0.02]">
                  <th className="px-6 py-3.5 text-left">Card & Prompt</th>
                  <th className="px-6 py-3.5 text-left">Category</th>
                  <th className="px-6 py-3.5 text-left">Version</th>
                  <th className="px-6 py-3.5 text-left">Spice & Timer</th>
                  <th className="px-6 py-3.5 text-left">Active Pool</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cards.map(card => (
                  <tr key={card.id} className={`hover:bg-white/[0.03] transition-colors ${!card.is_active ? 'opacity-50' : ''}`}>
                    {/* Card Title & Prompt */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white text-sm">{card.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 max-w-md">{card.prompt}</p>
                        {card.penalty_prompt && (
                          <p className="text-[11px] text-amber-400/80 mt-1 italic">
                            Penalty: {card.penalty_prompt}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                          style={{ backgroundColor: card.category_color }} 
                        />
                        {card.category_name}
                      </span>
                    </td>

                    {/* Version Badge (Part C6) */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30 flex items-center gap-1 w-fit">
                        <GitBranch className="w-3 h-3" />
                        v{card.version}
                      </span>
                    </td>

                    {/* Spice & Timer */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs font-semibold text-rose-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Lvl {card.spice_level}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{card.timer_hours}h limit</span>
                        </div>
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(card)}
                        className="flex items-center gap-1.5 transition-all hover:opacity-80"
                        title={card.is_active ? 'Click to retire' : 'Click to restore'}
                      >
                        {card.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-semibold">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-slate-600" />
                            <span className="text-xs text-slate-500">Retired</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Edit Action */}
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => { setEditCard(card); setModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                          title="Edit Card (Creates New Version)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card Edit / Create Modal */}
      {modalOpen && (
        <CardModal
          categories={categories}
          editCard={editCard}
          onClose={() => setModalOpen(false)}
          onSaved={fetchCards}
        />
      )}
    </div>
  );
}
