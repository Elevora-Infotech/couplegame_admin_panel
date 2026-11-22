import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Plus, Edit3, Trash2, X, Loader2,
  Shield, ToggleLeft, ToggleRight, Library, Zap, Eye, EyeOff, Filter,
  Flame, Clock, GitBranch, Upload, HelpCircle, Copy, Check
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
// ── Simple Card Form Modal (Category, Name, Description) ────────────────
function CardModal({ categories, editCard, onClose, onSaved }) {
  const [form, setForm] = useState(editCard ? {
    category_id:       editCard.category_id || editCard.card_categories?.id || '',
    name:              editCard.name || '',
    power_description: editCard.prompt || editCard.power_description || '',
  } : {
    category_id:       categories[0]?.id || '',
    name:              '',
    power_description: '',
  });

  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.name.trim() || !form.power_description.trim()) {
      toast.error('Category, card name and dare prompt are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        prompt: form.power_description.trim(),
        categoryId: form.category_id,
        reason: 'Saved via Card Catalog',
      };

      let savedCard;
      if (editCard) {
        const res = await adminContentApi.updateCard(editCard.id, payload);
        savedCard = res.data?.data?.card || { ...editCard, ...payload };
        toast.success('Card updated successfully!');
      } else {
        const res = await adminContentApi.createCard(payload);
        savedCard = res.data?.data?.card || res.data?.data || { id: Date.now().toString(), ...payload };
        toast.success('Card created successfully!');
      }
      onSaved(savedCard);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 flex items-start justify-center pt-8 md:pt-12 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{editCard ? 'Edit Card' : 'Add New Card'}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
            <select 
              value={form.category_id} 
              onChange={e => set('category_id', e.target.value)} 
              required 
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="" disabled>Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Name / Title *</label>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dare Prompt / Description *</label>
            <textarea 
              value={form.power_description} 
              onChange={e => set('power_description', e.target.value)} 
              required
              rows={4} 
              placeholder="Describe the exact action or dare the receiver must complete…"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" 
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editCard ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Bulk Import Modal (CSV / Text / Excel) ───────────────────
function BulkImportModal({ categories, onClose, onImportSuccess }) {
  const [defaultCatId, setDefaultCatId] = useState(categories[0]?.id || '');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedCards, setParsedCards] = useState([]);
  const [importing, setImporting] = useState(false);

  const parseContent = (content) => {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setParsedCards([]);
      return;
    }

    const cards = [];
    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (firstLineLower.includes('name') || firstLineLower.includes('title') || firstLineLower.includes('prompt') || firstLineLower.includes('description')) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      let parts = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else {
        parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      }

      parts = parts.map(p => p.replace(/^["']|["']$/g, '').trim());

      if (parts.length >= 2) {
        // Smart matching helper
        const findCategory = (str) => {
          if (!str) return null;
          const clean = str.trim().toLowerCase();
          return categories.find(c => {
            const cName = c.name.toLowerCase();
            return cName === clean || cName.includes(clean) || clean.includes(cName);
          });
        };

        if (parts.length >= 3) {
          const catMatch0 = findCategory(parts[0]);
          if (catMatch0) {
            cards.push({ category_id: catMatch0.id, name: parts[1], prompt: parts[2] });
          } else {
            const catMatch2 = findCategory(parts[2]);
            cards.push({ category_id: catMatch2 ? catMatch2.id : defaultCatId, name: parts[0], prompt: parts[1] });
          }
        } else {
          cards.push({ category_id: defaultCatId, name: parts[0], prompt: parts[1] });
        }
      }
    }

    setParsedCards(cards);
  };

  const handleDownloadSample = () => {
    const sampleRows = [
      'Category,Card Name,Description',
      'Romance,Midnight Whisper,Whisper 3 romantic secrets into your partner ear softly',
      'Spicy,Ice & Fire Dare,Gently trace an ice cube along partner neck and shoulders',
      'Fun,Silly Slow Dance,Slow dance for 2 minutes to a song with funny lyrics',
      'Communication,Deep Honest Truth,Share one fear you have never confessed to anyone else',
      'Conflict,Warm Forgiveness,Say one sweet thing you appreciate about how we handle disagreements',
      'Growth,Our 5-Year Vision,Describe your ideal dream vacation together 5 years from now',
      'Support,Pamper Massage,Give your partner a 5-minute relaxing shoulder massage',
      'Power,Deflect Immunity,Shield against the next spicy dare sent your way',
      'Fun,Staring Contest,Stare into partner eyes for 60 seconds without laughing',
      'Romance,Love Letter Note,Write a 2-line love note and hide it in partner pocket',
    ];
    const blob = new Blob([sampleRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soulshuffle_10_categories_cards.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded 10-card multi-category test CSV!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result || '';
      setRawText(text);
      parseContent(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    parseContent(text);
  };

  const handleImportSubmit = async () => {
    if (parsedCards.length === 0) {
      toast.error('No valid cards to import.');
      return;
    }

    setImporting(true);
    try {
      const res = await adminContentApi.createBulkCards({
        cards: parsedCards,
        defaultCategoryId: defaultCatId,
      });

      const count = res.data?.data?.inserted_count || parsedCards.length;
      toast.success(`Successfully imported ${count} cards!`);
      const insertedCards = res.data?.data?.cards || [];
      onImportSuccess(insertedCards);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-5 flex items-center justify-center animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Bulk Import Cards (CSV / Excel / Paste)</h2>
              <p className="text-xs text-slate-400">Upload CSV file or paste lines to import in 1 click.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Default Category (Fallback if CSV Category is missing or misspelled) *
              </label>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
              >
                📥 Download Sample CSV Template
              </button>
            </div>
            <select
              value={defaultCatId}
              onChange={e => {
                setDefaultCatId(e.target.value);
                parseContent(rawText);
              }}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-5 text-center transition-all bg-slate-800/40">
            <input
              type="file"
              accept=".csv,.txt"
              id="csvFileInput"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer flex flex-col items-center gap-1.5">
              <Upload className="w-7 h-7 text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                {fileName ? `Selected: ${fileName}` : 'Click here to choose a CSV file'}
              </span>
              <span className="text-xs text-slate-500">Supports .csv or .txt files (Name, Description)</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or Paste CSV / Multi-line Text Directly:
              </label>
              <span className="text-[11px] text-slate-500">Format: Name, Description</span>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={handleTextChange}
              placeholder={`Midnight Whisper, Whisper 3 secrets in partner's ear\nSunset Promise, Promise one sweet thing for tomorrow\nKitchen Romance, Hug from behind while making coffee`}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-xs"
            />
          </div>

          {parsedCards.length > 0 && (
            <div className="bg-slate-800/60 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400">
                  ✓ {parsedCards.length} Cards Detected & Ready to Import:
                </span>
                <span className="text-[11px] text-slate-400">Showing first {Math.min(3, parsedCards.length)}</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {parsedCards.map((c, i) => (
                  <div key={i} className="text-xs bg-slate-900/90 border border-white/5 px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-slate-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] whitespace-nowrap border border-indigo-500/30">
                        {c.category_name || 'Matched Category'}
                      </span>
                      <span className="font-bold text-white truncate">{c.name}</span>
                    </div>
                    <span className="text-slate-400 text-xs truncate max-w-[260px]">{c.prompt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={importing || parsedCards.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Import ${parsedCards.length} Cards`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI Prompt Modal (JSON & Instructions) ─────────────────────
function AIPromptModal({ onClose }) {
  const [copiedType, setCopiedType] = useState('');

  const jsonPrompt = {
    role: "Expert Couples Dare & Content Creator for SoulShuffle App",
    task: "Generate high-engagement couple dare cards in valid CSV format ready for SoulShuffle Bulk Import.",
    columns: ["Category", "Card Name", "Description"],
    allowed_categories: [
      "Romance, Intimacy & Desire",
      "Communication & Emotional Safety",
      "Conflict, Repair & Healing",
      "Fun, Play & Novelty",
      "Growth, Future & Partnership",
      "Support, Care & Acts of Love",
      "Power, Wildcards & Game Mechanics",
      "Deflect Cards"
    ],
    new_category_rule: "If you need a category not in this list, you MUST first add it in SoulShuffle Admin Panel -> Categories tab. Otherwise, map to the closest allowed category.",
    formatting_requirements: [
      "Row format: Category,Card Name,Description",
      "Card Name: 2-5 words, catchy, creative, romantic or fun",
      "Description: 1-2 sentences of actionable dare for couples",
      "Escape any commas inside text using double-quotes: \"like, this\"",
      "Return ONLY raw CSV text, with no markdown tags or introductory conversational text"
    ],
    sample_csv_output: [
      "Category,Card Name,Description",
      "Romance,Midnight Whisper,Whisper 3 romantic secrets into your partner ear softly",
      "Spicy,Ice & Fire Dare,Gently trace an ice cube along partner neck and shoulders",
      "Fun,Silly Slow Dance,Slow dance for 2 minutes to a song with funny lyrics",
      "Communication,Deep Honest Truth,Share one fear you have never confessed to anyone else"
    ]
  };

  const textPrompt = `Act as an expert content creator for the SoulShuffle couple relationship game.
Generate 20 high-quality couple dare cards in pure CSV format.

CSV Columns:
Category,Card Name,Description

Allowed Categories:
- Romance, Intimacy & Desire (Short: Romance)
- Communication & Emotional Safety (Short: Communication)
- Conflict, Repair & Healing (Short: Conflict)
- Fun, Play & Novelty (Short: Fun)
- Growth, Future & Partnership (Short: Growth)
- Support, Care & Acts of Love (Short: Support)
- Power, Wildcards & Game Mechanics (Short: Power)
- Deflect Cards (Short: Deflect)

Rule: If a card needs a category not listed above, tell the user to first create the category in SoulShuffle Admin Panel -> Categories tab.

Format Example:
Category,Card Name,Description
Romance,Midnight Whisper,Whisper 3 romantic secrets into your partner ear softly
Spicy,Ice & Fire Dare,Gently trace an ice cube along partner neck and shoulders
Fun,Silly Slow Dance,Slow dance for 2 minutes to a song with funny lyrics

Important: Output pure CSV rows only, with no markdown code blocks or preamble!`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type === 'json' ? 'JSON' : 'Text'} Prompt copied to clipboard!`);
    setTimeout(() => setCopiedType(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-5 flex items-center justify-center animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Card Generator Prompt (ChatGPT / Claude / Gemini)</h2>
              <p className="text-xs text-slate-400">Copy this prompt to let AI generate perfectly formatted bulk card CSVs.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Important Rule: What if category not added */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs mt-0.5">⚠️ NOTE</div>
            <div className="text-xs text-amber-200 leading-relaxed">
              <strong className="text-amber-300">What if a Category is NOT added in Admin Panel?</strong>
              <p className="mt-1 text-slate-300">
                If you want to add cards for a category that is not in the list, first navigate to the <strong>Categories (`/categories`)</strong> tab in the Admin Panel and click <strong>"+ Add Category"</strong> to create it. Then, enter that category name in your CSV file — the system will automatically recognize and link all cards directly to your new category!
              </p>
            </div>
          </div>

          {/* Quick Copy Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => copyToClipboard(textPrompt, 'text')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              {copiedType === 'text' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'text' ? 'Copied Prompt!' : 'Copy Direct Prompt (For ChatGPT)'}
            </button>

            <button
              onClick={() => copyToClipboard(JSON.stringify(jsonPrompt, null, 2), 'json')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              {copiedType === 'json' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'json' ? 'Copied JSON!' : 'Copy Structured JSON Prompt'}
            </button>
          </div>

          {/* JSON Display */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt in JSON Format:</span>
              <span className="text-[11px] text-indigo-400 font-mono">Ready to feed to LLMs / APIs</span>
            </div>
            <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto max-h-64 whitespace-pre">
              {JSON.stringify(jsonPrompt, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-slate-900/95 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
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
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);

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

  const handleCardSaved = (savedCard) => {
    if (savedCard) {
      if (editCard) {
        setCards(prev => prev.map(c => c.id === savedCard.id ? { ...c, ...savedCard } : c));
      } else {
        const catObj = categories.find(c => c.id === savedCard.category_id);
        const cardWithCat = {
          ...savedCard,
          card_categories: catObj || { name: 'General' },
        };
        setCards(prev => [cardWithCat, ...prev]);
      }
    } else {
      fetchCards();
    }
  };

  const handleBulkImportSuccess = (newCards) => {
    if (Array.isArray(newCards) && newCards.length > 0) {
      const enriched = newCards.map(c => {
        const catObj = categories.find(cat => cat.id === c.category_id);
        return {
          ...c,
          card_categories: catObj || { name: 'Imported' },
        };
      });
      setCards(prev => [...enriched, ...prev]);
    } else {
      fetchCards();
    }
  };

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

    const nextActive = !card.is_active;
    // Optimistic instant UI update
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_active: nextActive } : c));

    try {
      await adminContentApi.toggleCard(card.id, {
        isActive: nextActive,
        reason: nextActive ? 'Card activated via quick toggle' : 'Card retired via quick toggle',
      });
      toast.success(nextActive ? `"${card.name}" activated!` : `"${card.name}" retired!`);
    } catch (e) {
      toast.error('Failed to update card status');
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, is_active: !nextActive } : c));
    }
  };

  const handleDeleteCard = async (card) => {
    if (!isAdmin) {
      toast.error('Restricted: Only Admin users can delete cards.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete card "${card.name}"?`)) return;

    // Optimistic delete
    setCards(prev => prev.filter(c => c.id !== card.id));

    try {
      await adminContentApi.deleteCard(card.id);
      toast.success(`"${card.name}" deleted successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete card');
      fetchCards();
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
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-850 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:border-emerald-500/50"
            >
              <Upload className="w-4 h-4" /> Bulk Import (CSV)
            </button>
            <button
              onClick={() => setPromptModalOpen(true)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-all shadow-md"
              title="AI Card Generator Prompt (?)"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setEditCard(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Add Dare Card
            </button>
          </div>
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

        {/* Spicy Level Filter - Hidden as requested
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
        */}

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

                    {/* Edit & Delete Action */}
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditCard(card); setModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                            title="Edit Card"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete Card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
          onSaved={handleCardSaved}
        />
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <BulkImportModal
          categories={categories}
          onClose={() => setBulkModalOpen(false)}
          onImportSuccess={handleBulkImportSuccess}
        />
      )}

      {/* AI Prompt Modal */}
      {promptModalOpen && (
        <AIPromptModal onClose={() => setPromptModalOpen(false)} />
      )}
    </div>
  );
}
