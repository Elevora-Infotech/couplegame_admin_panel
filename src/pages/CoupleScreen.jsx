import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HeartHandshake, Clock, ShieldCheck, CreditCard, Sparkles, AlertTriangle,
  ChevronDown, ChevronUp, ChevronRight, User, Smartphone, Send, MessageSquare,
  DoorOpen, Flag, RefreshCw, ArrowLeft, Zap, Wrench, ShieldAlert, Award
} from 'lucide-react';
import { adminOperationsApi } from '../api/adminOperationsApi';
import SupportActionsModal from '../components/SupportActionsModal';

export default function CoupleScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTimelineId, setExpandedTimelineId] = useState(null);
  const [isTechnicalOpen, setIsTechnicalOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  // New Support Note State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTag, setNoteTag] = useState('General Inquiry');
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchCouple = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminOperationsApi.getCouple(roomId);
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load couple detail:', err);
      setError(err.response?.data?.message || 'Couple room not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchCouple();
  }, [roomId]);

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || noteText.trim().length < 3) {
      toast.error('Support note text must be at least 3 characters.');
      return;
    }

    setNoteLoading(true);
    try {
      await adminOperationsApi.addNote(roomId, {
        reason_tag: noteTag,
        note_text: noteText.trim(),
      });
      toast.success('Support note recorded successfully.');
      setNoteText('');
      setIsAddingNote(false);
      fetchCouple();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add support note.');
    } finally {
      setNoteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-400 mb-3" />
        <p className="text-sm font-medium">Loading couple lifecycle workbench...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Couple not found.'}</p>
        <button
          onClick={() => navigate('/games')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
        >
          Back to Games List
        </button>
      </div>
    );
  }

  const {
    tier_1_timeline = [],
    tier_2_key_facts = {},
    tier_3_partners = {},
    tier_4_current_game = {},
    tier_5_per_partner_history = {},
    tier_6_support_notes = [],
    tier_7_technical_details = {},
  } = data;

  const { partner_1, partner_2 } = tier_3_partners;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {partner_1?.name || 'Partner 1'} & {partner_2?.name || 'Partner 2'}
              </h1>
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-[#256df2]/15 text-[#38bdf8] border border-[#256df2]/30 font-bold">
                {tier_7_technical_details.room_code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Couple Lifecycle Workbench • 7-Tier Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActionsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#256df2] hover:bg-[#1d5ecf] text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            Support Actions
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 1: LIFECYCLE TIMELINE (Shown First as Mandated by Spec B2)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Couple Lifecycle Timeline
            </h2>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
              Newest at Top
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click any entry to view the 5 card actions preceding it
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
          {tier_1_timeline.map((event) => {
            const isExpanded = expandedTimelineId === event.id;
            return (
              <div key={event.id} className="relative group">
                {/* Timeline Node Dot */}
                <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-[#0B0F19] transition-transform group-hover:scale-125 ${
                  event.badge_color === 'emerald' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                  event.badge_color === 'purple' ? 'bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]' :
                  event.badge_color === 'amber' ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                  event.badge_color === 'indigo' ? 'bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                  'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                }`} />

                {/* Event Card */}
                <div
                  onClick={() => setExpandedTimelineId(isExpanded ? null : event.id)}
                  className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{event.title}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {event.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-violet-300/80">
                      {event.timestamp_ist}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{event.description}</p>

                  {/* Pre-Event Card Actions (Expandable Drawer) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
                      <div className="text-[11px] font-extrabold text-violet-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Last 5 Card Actions Before This Event:</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </div>
                      {!event.pre_event_actions || event.pre_event_actions.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No preceding card plays recorded.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {event.pre_event_actions.map((act) => (
                            <div key={act.id} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-white">{act.card_name}</span>
                                <span className="text-slate-500 ml-2">by {act.sender_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                                  {act.status}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{act.sent_at_ist}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 2: KEY FACTS BAR                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-[2rem] border border-white/10">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          2. Key Facts Bar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Mode</span>
            <p className="text-base font-bold text-white capitalize mt-0.5">{tier_2_key_facts.mode || 'Free'}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Season / Day</span>
            <p className="text-base font-bold text-violet-300 mt-0.5">
              Day {tier_2_key_facts.current_day || 1}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Subscription</span>
            <p className="text-base font-bold text-emerald-400 capitalize mt-0.5 truncate">
              {tier_2_key_facts.subscription_status || 'None'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Source / Angle</span>
            <p className="text-base font-bold text-white capitalize mt-0.5 truncate">
              {tier_2_key_facts.source || 'Organic'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Platforms</span>
            <p className="text-base font-bold text-slate-200 mt-0.5 text-xs truncate">
              {tier_2_key_facts.platforms?.partner_1} + {tier_2_key_facts.platforms?.partner_2}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Pace</span>
            <p className="text-base font-bold text-amber-300 mt-0.5">
              {tier_2_key_facts.pace_cards_per_day} <span className="text-xs text-slate-400 font-normal">cards/day</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 3: BOTH PARTNERS WITH LINKS & PAYER BADGE                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partner 1 */}
        {partner_1 && (
          <div className="glass-panel p-5 rounded-[2rem] border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Partner 1 (Creator)
              </span>
              {partner_1.is_payer && (
                <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
                  <Award className="w-3.5 h-3.5" /> Payer
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-violet-500/20">
                {partner_1.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{partner_1.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Phone: {partner_1.phone_masked || '—'}</p>
                <p className="text-xs text-slate-400">Platform: <span className="uppercase text-slate-200">{partner_1.platform}</span></p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
              <Link
                to={`/player/${partner_1.id}`}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                View Player Screen <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Partner 2 */}
        {partner_2 ? (
          <div className="glass-panel p-5 rounded-[2rem] border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Partner 2 (Joiner)
              </span>
              {partner_2.is_payer && (
                <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
                  <Award className="w-3.5 h-3.5" /> Payer
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/20">
                {partner_2.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{partner_2.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Phone: {partner_2.phone_masked || '—'}</p>
                <p className="text-xs text-slate-400">Platform: <span className="uppercase text-slate-200">{partner_2.platform}</span></p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
              <Link
                to={`/player/${partner_2.id}`}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View Player Screen <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-slate-400 text-center">
            <p className="text-xs font-medium">Partner has not joined yet.</p>
            <button
              onClick={() => setIsActionsModalOpen(true)}
              className="mt-2 text-xs font-bold text-violet-400 hover:underline cursor-pointer"
            >
              Resend WhatsApp Invite Link
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 4: CURRENT GAME STATE                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-[2rem] border border-white/10 space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          4. Current Game State
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-xs text-slate-400">Cards in Hand</span>
            <p className="text-sm font-bold text-white mt-1">
              {partner_1?.name}: {tier_4_current_game.hand_count?.partner_1 ?? 0}
            </p>
            <p className="text-sm font-bold text-white">
              {partner_2?.name || 'Partner'}: {tier_4_current_game.hand_count?.partner_2 ?? 0}
            </p>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-xs text-slate-400">Deflects Left</span>
            <p className="text-lg font-bold text-white mt-0.5">
              {tier_4_current_game.deflects_left ?? 5} / 5
            </p>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-xs text-slate-400">Penalties Incurred</span>
            <p className="text-lg font-bold text-rose-400 mt-0.5">
              {tier_4_current_game.penalties_given ?? 0}
            </p>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-xs text-slate-400">Send Ban Status</span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">
              {tier_4_current_game.send_ban ? 'Active Ban' : 'None (Healthy)'}
            </p>
          </div>
        </div>

        {/* Active Cards in Transit */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Active Cards in Transit ({tier_4_current_game.active_cards?.length || 0})
          </span>
          {!tier_4_current_game.active_cards || tier_4_current_game.active_cards.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No cards currently active in transit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier_4_current_game.active_cards.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{c.card_name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    {c.sender_name} → {c.receiver_name}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-slate-500">
                    <span>Sent: {c.sent_at_ist}</span>
                    {c.expires_at_ist && (
                      <span className="text-amber-400 font-mono">Expires: {c.expires_at_ist}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 5: PER-PARTNER PERFORMED HISTORY (With Card Versions)         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-[2rem] border border-white/10 space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          5. Per-Partner Completed Dare History (With Card Versions)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner 1 Completed */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
              <span>{partner_1?.name}'s Completed Dares</span>
              <span className="text-xs text-slate-400 font-mono">
                ({tier_5_per_partner_history.partner_1_performed?.length || 0})
              </span>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {(tier_5_per_partner_history.partner_1_performed || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No completed cards yet.</p>
              ) : (
                tier_5_per_partner_history.partner_1_performed.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{c.card_name}</p>
                      <p className="text-[10px] text-slate-400">{c.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-bold">
                        v{c.card_version}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.completed_at_ist}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Partner 2 Completed */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-between">
              <span>{partner_2?.name || 'Partner'}'s Completed Dares</span>
              <span className="text-xs text-slate-400 font-mono">
                ({tier_5_per_partner_history.partner_2_performed?.length || 0})
              </span>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {(tier_5_per_partner_history.partner_2_performed || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No completed cards yet.</p>
              ) : (
                tier_5_per_partner_history.partner_2_performed.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{c.card_name}</p>
                      <p className="text-[10px] text-slate-400">{c.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                        v{c.card_version}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.completed_at_ist}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 6: SUPPORT NOTES (Add / View)                                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              6. Support Notes Thread ({tier_6_support_notes.length})
            </h2>
          </div>
          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-violet-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            {isAddingNote ? 'Cancel' : '+ Add Note'}
          </button>
        </div>

        {/* Add Note Form */}
        {isAddingNote && (
          <form onSubmit={handleAddNoteSubmit} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 animate-in fade-in">
            <div className="flex gap-3">
              <select
                value={noteTag}
                onChange={(e) => setNoteTag(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Payment / Refund">Payment / Refund</option>
                <option value="Pairing Issue">Pairing Issue</option>
                <option value="Confirmed Bug">Confirmed Bug</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record support interaction note (dated and signed automatically)..."
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={noteLoading}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {noteLoading ? 'Saving...' : 'Save Support Note'}
              </button>
            </div>
          </form>
        )}

        {/* Notes Thread */}
        <div className="space-y-2">
          {tier_6_support_notes.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No support notes recorded on this couple record.</p>
          ) : (
            tier_6_support_notes.map((n) => (
              <div key={n.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{n.author_name}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {n.reason_tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{n.created_at_ist}</span>
                </div>
                <p className="text-slate-300">"{n.note_text}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TIER 7: TECHNICAL DETAILS (Collapsed by Default)                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-[2rem] border border-white/10">
        <button
          onClick={() => setIsTechnicalOpen(!isTechnicalOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-400" />
            7. Technical Diagnostic Details (Device, Push, App Versions)
          </div>
          {isTechnicalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isTechnicalOpen && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                <span className="font-bold text-white block">Partner 1 Telemetry</span>
                <p className="text-slate-400 font-mono">User ID: {tier_7_technical_details.host_telemetry?.user_id}</p>
                <p className="text-slate-400">App Version: {tier_7_technical_details.host_telemetry?.app_version}</p>
                <p className="text-slate-400">Platform: {tier_7_technical_details.host_telemetry?.platform}</p>
                <p className="text-slate-400">Push Enabled: {tier_7_technical_details.host_telemetry?.push_enabled ? 'Yes' : 'No'}</p>
                <p className="text-slate-400">Last Seen: {tier_7_technical_details.host_telemetry?.last_seen_ist || '—'}</p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                <span className="font-bold text-white block">Partner 2 Telemetry</span>
                <p className="text-slate-400 font-mono">User ID: {tier_7_technical_details.partner_telemetry?.user_id || '—'}</p>
                <p className="text-slate-400">App Version: {tier_7_technical_details.partner_telemetry?.app_version || '—'}</p>
                <p className="text-slate-400">Platform: {tier_7_technical_details.partner_telemetry?.platform || '—'}</p>
                <p className="text-slate-400">Push Enabled: {tier_7_technical_details.partner_telemetry?.push_enabled ? 'Yes' : 'No'}</p>
                <p className="text-slate-400">Last Seen: {tier_7_technical_details.partner_telemetry?.last_seen_ist || '—'}</p>
              </div>
            </div>
            <p className="text-slate-500 font-mono text-[10px]">Couple UUID: {tier_7_technical_details.couple_id}</p>
          </div>
        )}
      </div>

      {/* Support Actions Modal */}
      <SupportActionsModal
        isOpen={isActionsModalOpen}
        onClose={() => setIsActionsModalOpen(false)}
        roomId={roomId}
        roomCode={tier_7_technical_details.room_code}
        activeCards={tier_4_current_game.active_cards || []}
        onSuccess={fetchCouple}
      />
    </div>
  );
}
