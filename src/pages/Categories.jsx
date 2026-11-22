import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  Plus, Edit3, Trash2, X, Loader2,
  FolderTree, ToggleLeft, ToggleRight, CheckCircle, XCircle
} from 'lucide-react';

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

// ── Category Modal ─────────────────────────────────────────────
function CategoryModal({ editCat, nextOrder, onClose, onSaved }) {
  const [form, setForm] = useState(editCat ? {
    name:        editCat.name || '',
    description: editCat.description || '',
    theme_color: editCat.theme_color || '#4f46e5',
    icon_url:    editCat.icon_url || '',
    order_index: editCat.order_index ?? 1,
    is_active:   editCat.is_active ?? true,
  } : {
    name: '', description: '', theme_color: '#4f46e5',
    icon_url: '', order_index: nextOrder, is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, order_index: parseInt(form.order_index, 10) || 1 };
      if (editCat) {
        await axiosInstance.put(`/admin/dashboard/categories/${editCat.id}`, payload);
        toast.success('Category updated');
      } else {
        await axiosInstance.post('/admin/dashboard/categories', payload);
        toast.success('Category created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{editCat ? 'Edit Category' : 'Add New Category'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g., Romance & Intimacy"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description <span className="text-slate-600 font-normal">(optional)</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={2} placeholder="Short description…"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
          </div>

          {/* Color + Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Theme Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.theme_color} onChange={e => set('theme_color', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-slate-800 border border-slate-700" />
                <input type="text" value={form.theme_color} onChange={e => set('theme_color', e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sort Order</label>
              <input type="number" min="1" value={form.order_index} onChange={e => set('order_index', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
          </div>

          {/* Icon URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Category Image URL <span className="text-slate-600 font-normal">(PNG, JPG, WebP)</span>
              </label>
              {form.icon_url && (
                <button
                  type="button"
                  onClick={() => set('icon_url', '')}
                  className="text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                >
                  Clear URL
                </button>
              )}
            </div>
            <input
              value={form.icon_url}
              onChange={e => set('icon_url', e.target.value)}
              placeholder="https://... (e.g. https://your-domain.com/category.png)"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-white">Active</p>
              <p className="text-xs text-slate-500">Inactive categories are hidden from users in the app</p>
            </div>
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Preview */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-600 shrink-0 bg-slate-800 flex items-center justify-center shadow-md">
              {form.icon_url ? (
                <img
                  key={form.icon_url}
                  src={form.icon_url}
                  alt={form.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex items-center justify-center text-sm font-bold text-white ${form.icon_url ? 'hidden' : 'flex'}`}
                style={{ backgroundColor: form.theme_color || '#4f46e5' }}
              >
                {form.name ? form.name.charAt(0).toUpperCase() : '#'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate">{form.name || 'Category Name'}</p>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: form.theme_color || '#4f46e5' }} />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{form.description || 'No description provided'}</p>
              {form.icon_url ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
                  ✓ Image preview active
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Color preview only (no image URL)
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : editCat ? 'Update' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
let categoriesCache = null;
try {
  const saved = sessionStorage.getItem('ssf_categories_cache');
  if (saved) categoriesCache = JSON.parse(saved);
} catch (e) {}

export default function Categories() {
  const [categories, setCategories] = useState(() => categoriesCache || []);
  const [loading, setLoading]       = useState(!categoriesCache);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editCat, setEditCat]       = useState(null);

  const fetchCategories = async (isBackground = false) => {
    if (!isBackground && !categoriesCache) setLoading(true);
    try {
      // Also fetch card counts per category
      const [catRes, cardRes] = await Promise.all([
        axiosInstance.get('/admin/dashboard/categories'),
        axiosInstance.get('/admin/dashboard/cards'),
      ]);
      const cats  = catRes.data?.data?.categories || [];
      const cards = cardRes.data?.data?.cards || [];

      // Build card count map
      const countMap = {};
      cards.forEach(c => {
        const cid = c.card_categories?.id || c.category_id;
        if (cid) countMap[cid] = (countMap[cid] || 0) + 1;
      });

      const updated = cats.map(c => ({ ...c, card_count: countMap[c.id] || 0 }));
      setCategories(updated);
      categoriesCache = updated;
      try { sessionStorage.setItem('ssf_categories_cache', JSON.stringify(updated)); } catch (e) {}
    } catch (e) {
      if (!isBackground) toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(Boolean(categoriesCache));
  }, []);

  const handleToggle = async (cat) => {
    try {
      await axiosInstance.put(`/admin/dashboard/categories/${cat.id}`, { ...cat, is_active: !cat.is_active });
      toast.success(cat.is_active ? 'Category deactivated' : 'Category activated');
      fetchCategories();
    } catch (e) {
      toast.error('Failed to toggle category');
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"? This soft-deletes it (sets inactive).`)) return;
    try {
      await axiosInstance.delete(`/admin/dashboard/categories/${cat.id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const total    = categories.length;
  const active   = categories.filter(c => c.is_active).length;
  const inactive = total - active;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">Manage card categories — name, color, sort order, and active status.</p>
        </div>
        <button onClick={() => { setEditCat(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={FolderTree}   label="Total"    value={total}    color="bg-indigo-500/80" />
        <StatCard icon={CheckCircle}  label="Active"   value={active}   color="bg-emerald-500/80" />
        <StatCard icon={XCircle}      label="Inactive" value={inactive} color="bg-slate-600" />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white text-sm">
            {loading ? 'Loading…' : `${total} Categories`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <FolderTree className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-3 text-left">Image / Color</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Cards</th>
                  <th className="px-6 py-3 text-left">Order</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {categories.map(cat => (
                  <tr key={cat.id} className={`hover:bg-slate-800/30 transition-colors ${!cat.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center shadow-sm">
                          {cat.icon_url ? (
                            <img
                              src={cat.icon_url}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center text-xs font-bold text-white ${cat.icon_url ? 'hidden' : 'flex'}`}
                            style={{ backgroundColor: cat.theme_color || '#4f46e5' }}
                          >
                            {cat.name ? cat.name.charAt(0).toUpperCase() : '#'}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: cat.theme_color || '#4f46e5' }} />
                            <span className="text-xs text-slate-300 font-mono font-medium">{cat.theme_color || '#4f46e5'}</span>
                          </div>
                          {cat.icon_url ? (
                            <span className="text-[11px] text-emerald-400 font-medium">Image active</span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Color only</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{cat.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs max-w-[180px] truncate">
                      {cat.description || <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-300">{cat.card_count}</span>
                      <span className="text-xs text-slate-500 ml-1">cards</span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{cat.order_index ?? '—'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(cat)} title={cat.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-all">
                        {cat.is_active ? (
                          <><ToggleRight className="w-5 h-5 text-emerald-400" /><span className="text-xs text-emerald-400 font-semibold">Active</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-slate-600" /><span className="text-xs text-slate-500">Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditCat(cat); setModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat)}
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

      {modalOpen && (
        <CategoryModal
          editCat={editCat}
          nextOrder={categories.length + 1}
          onClose={() => { setModalOpen(false); setEditCat(null); }}
          onSaved={fetchCategories}
        />
      )}
    </div>
  );
}
