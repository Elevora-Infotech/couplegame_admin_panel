import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sliders, ShieldAlert, Sparkles, Save, RefreshCw, AlertTriangle, CheckCircle2,
  Bell, Smartphone, Zap, PauseCircle, PlayCircle, Layers, DollarSign, Clock, FileText, ChevronRight, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import RoomPlansPricingManager from '../components/RoomPlansPricingManager';
import {
  getRuntimeSettings, updateRuntimeSettings,
  getFreePoolStatus, seedFreePoolDefaults,
  getAppControls, updateAppControlSetting,
  pauseAllTimers, resumeAllTimers,
  getFreeGamePitch, updateFreeGamePitch
} from '../api/adminSettingsApi';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'runtime';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Data states
  const [runtimeSettings, setRuntimeSettings] = useState(null);
  const [freePoolStatus, setFreePoolStatus] = useState(null);
  const [appControls, setAppControls] = useState(null);
  const [pitchData, setPitchData] = useState(null);

  // Form states
  const [runtimeForm, setRuntimeForm] = useState({});
  const [bannerForm, setBannerForm] = useState({ is_active: false, message: '' });
  const [versionForm, setVersionForm] = useState({ min_android_version: '1.0.0', min_ios_version: '1.0.0', force_update: false });
  const [notifForm, setNotifForm] = useState({ dare_reminder_24h: true, dare_reminder_2h: true, turn_nudge: true, dare_completed: true, penalty_issued: true });
  const [pitchForm, setPitchForm] = useState({});

  // Modal for mandatory reason
  const [reasonModal, setReasonModal] = useState({
    isOpen: false,
    title: '',
    reason: '',
    onConfirm: null,
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rt, fp, ac, pt] = await Promise.all([
        getRuntimeSettings(),
        getFreePoolStatus(),
        getAppControls(),
        getFreeGamePitch(),
      ]);

      setRuntimeSettings(rt);
      setRuntimeForm(rt?.settings || {});

      setFreePoolStatus(fp);

      setAppControls(ac);
      setBannerForm(ac?.maintenance_banner || { is_active: false, message: '' });
      setVersionForm(ac?.version_control || { min_android_version: '1.0.0', min_ios_version: '1.0.0', force_update: false });
      setNotifForm(ac?.notification_switches || {});

      setPitchData(pt);
      setPitchForm(pt?.pitch || {});
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const triggerReasonPrompt = (title, onConfirm) => {
    setReasonModal({
      isOpen: true,
      title,
      reason: '',
      onConfirm,
    });
  };

  const handleReasonSubmit = async () => {
    if (!reasonModal.reason || reasonModal.reason.trim().length < 5) {
      toast.error('A detailed justification (minimum 5 characters) is mandatory.');
      return;
    }
    const reason = reasonModal.reason.trim();
    const action = reasonModal.onConfirm;
    setReasonModal({ isOpen: false, title: '', reason: '', onConfirm: null });

    setActionLoading(true);
    try {
      await action(reason);
      await loadAllData();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Handlers
  const handleSaveRuntimeSettings = () => {
    triggerReasonPrompt('Update Runtime Game Parameters', async (reason) => {
      await updateRuntimeSettings({ settings: runtimeForm, reason });
      toast.success('Runtime game settings updated successfully');
    });
  };

  const handleSeedFreePool = () => {
    triggerReasonPrompt('Initialize & Balance Free Pool (40 Cards)', async (reason) => {
      const res = await seedFreePoolDefaults({ reason });
      toast.success(res?.message || 'Free pool initialized with 40 cards');
    });
  };

  const handleSaveMaintenanceBanner = () => {
    triggerReasonPrompt('Update Maintenance Banner', async (reason) => {
      await updateAppControlSetting({ key: 'maintenance_banner', value: bannerForm, reason });
      toast.success('Maintenance banner updated');
    });
  };

  const handleSaveVersionControl = () => {
    triggerReasonPrompt('Update Version Control Requirements', async (reason) => {
      await updateAppControlSetting({ key: 'app_version_control', value: versionForm, reason });
      toast.success('Version control policies saved');
    });
  };

  const handleSaveNotifSwitches = () => {
    triggerReasonPrompt('Update Push Notification Toggles', async (reason) => {
      await updateAppControlSetting({ key: 'notification_switches', value: notifForm, reason });
      toast.success('Notification toggles updated');
    });
  };

  const handleToggleTimerFreeze = () => {
    const isPaused = appControls?.timers_paused?.is_paused;
    triggerReasonPrompt(
      isPaused ? 'Resume All System Timers' : 'EMERGENCY: Pause All System Timers',
      async (reason) => {
        if (isPaused) {
          const res = await resumeAllTimers({ reason });
          toast.success(res?.message || 'System timers resumed');
        } else {
          const res = await pauseAllTimers({ reason });
          toast.error(res?.message || 'All timers paused');
        }
      }
    );
  };

  const handleSavePitch = () => {
    triggerReasonPrompt('Update End-of-Free-Game Season Pitch', async (reason) => {
      await updateFreeGamePitch({ pitch: pitchForm, reason });
      toast.success('Season conversion pitch updated');
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-violet-400 mx-auto animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Loading system parameters & controls...</p>
        </div>
      </div>
    );
  }

  const isTimersPaused = appControls?.timers_paused?.is_paused;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sliders className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">System Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">System Controls & Dynamic Settings</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Zero-code runtime parameter management, emergency outage controls, and introductory free-pool balancing.
          </p>
        </div>

        {/* Emergency Pause Indicator Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTimerFreeze}
            disabled={actionLoading}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border shadow-lg ${
              isTimersPaused
                ? 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30 shadow-rose-600/20 animate-pulse'
                : 'bg-emerald-600/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/20'
            }`}
          >
            {isTimersPaused ? <PlayCircle className="w-4 h-4 text-rose-400" /> : <PauseCircle className="w-4 h-4 text-emerald-400" />}
            {isTimersPaused ? 'Timers Frozen (Resume)' : 'Emergency Pause Timers'}
          </button>

          <button
            onClick={loadAllData}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-colors"
            title="Refresh Settings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Outage Warning Banner if paused */}
      {isTimersPaused && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-3 shadow-lg shadow-rose-900/20">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-rose-200">
            <p className="font-bold uppercase tracking-wide">Emergency Outage Freeze Active</p>
            <p className="text-rose-300/80 mt-0.5">
              All active card countdown timers are frozen. No couple penalties are being issued. Resuming will automatically extend all active deadlines by the exact outage duration.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar gap-1">
        {[
          { id: 'pricing-plans', label: '💎 Room Plans & Pricing', icon: Crown },
          { id: 'runtime', label: 'Game Parameters', icon: Sliders },
          { id: 'free-pool', label: 'Free-Pool Manager (40 Cards)', icon: Layers },
          { id: 'controls', label: 'App Controls & Outage', icon: ShieldAlert },
          { id: 'notifications', label: 'Notification Switches', icon: Bell },
          { id: 'pitch', label: 'End-of-Free-Game Pitch', icon: FileText },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-4 py-3 font-semibold text-xs md:text-sm border-b-2 whitespace-nowrap transition-all ${
                active
                  ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 0: VIP ROOM PLANS & PRICING */}
      {activeTab === 'pricing-plans' && (
        <RoomPlansPricingManager />
      )}

      {/* TAB 1: RUNTIME GAME PARAMETERS */}
      {activeTab === 'runtime' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between">
            <p className="text-xs text-violet-300 leading-relaxed">
              <span className="font-bold">Snapshot Integrity Policy:</span> Runtime parameter changes apply strictly to new game rooms created after the modification. Ongoing rooms proceed on their immutable settings snapshot.
            </p>
            <button
              onClick={handleSaveRuntimeSettings}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 ml-4 shadow-lg shadow-violet-600/20"
            >
              <Save className="w-4 h-4" /> Save Parameters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Timers & Deadlines */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" /> Card Deadlines & Waiting
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Time to Respond (Hours)</label>
                  <input
                    type="number"
                    value={runtimeForm.time_to_respond_hours || 24}
                    onChange={e => setRuntimeForm({ ...runtimeForm, time_to_respond_hours: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default: 24h to accept or deflect dare</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Time to Complete Accepted (Hours)</label>
                  <input
                    type="number"
                    value={runtimeForm.time_to_complete_hours || 48}
                    onChange={e => setRuntimeForm({ ...runtimeForm, time_to_complete_hours: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default: 48h to perform accepted dare</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Grace Waiting Before Penalty (Hours)</label>
                  <input
                    type="number"
                    value={runtimeForm.ignore_penalty_wait_hours || 24}
                    onChange={e => setRuntimeForm({ ...runtimeForm, ignore_penalty_wait_hours: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default: 24h grace window</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Auto-Confirm Timeout (Hours)</label>
                  <input
                    type="number"
                    value={runtimeForm.auto_confirm_timeout_hours || 36}
                    onChange={e => setRuntimeForm({ ...runtimeForm, auto_confirm_timeout_hours: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default: 36h before auto-accept</p>
                </div>
              </div>
            </div>

            {/* Turn Caps & Allotments */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Turn Caps & Limits
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Cards Per Player / Day Cap</label>
                  <input
                    type="number"
                    value={runtimeForm.cards_per_day_cap || 3}
                    onChange={e => setRuntimeForm({ ...runtimeForm, cards_per_day_cap: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Daily send cap to prevent card flooding</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Concurrent Active Cards Allowed</label>
                  <input
                    type="number"
                    value={runtimeForm.active_cards_allowed || 2}
                    onChange={e => setRuntimeForm({ ...runtimeForm, active_cards_allowed: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Max in-hand cards awaiting resolution</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Cards Per Paid Season (Per Player)</label>
                  <input
                    type="number"
                    value={runtimeForm.season_cards_per_player || 30}
                    onChange={e => setRuntimeForm({ ...runtimeForm, season_cards_per_player: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">30 cards/player = 60 total per season</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Cards Per Free Game (Per Player)</label>
                  <input
                    type="number"
                    value={runtimeForm.free_game_cards_per_player || 7}
                    onChange={e => setRuntimeForm({ ...runtimeForm, free_game_cards_per_player: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">7 cards/player = 14 total in Free Game 1</p>
                </div>
              </div>
            </div>

            {/* Deflects & Pricing (INR) */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> Deflects & Pricing (INR ₹)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Deflects Granted (Paid Season)</label>
                  <input
                    type="number"
                    value={runtimeForm.season_deflects || 5}
                    onChange={e => setRuntimeForm({ ...runtimeForm, season_deflects: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">5 free deflects per couple in paid season</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Deflects Granted (Free Game)</label>
                  <input
                    type="number"
                    value={runtimeForm.free_game_deflects || 1}
                    onChange={e => setRuntimeForm({ ...runtimeForm, free_game_deflects: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">1 introductory deflect in Free Game 1</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Season Price (INR ₹)</label>
                  <input
                    type="number"
                    value={runtimeForm.season_price_inr || 299}
                    onChange={e => setRuntimeForm({ ...runtimeForm, season_price_inr: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Standard 30-day season pass (₹299)</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Card Boost Pack Price (INR ₹)</label>
                  <input
                    type="number"
                    value={runtimeForm.card_pack_price_inr || 20}
                    onChange={e => setRuntimeForm({ ...runtimeForm, card_pack_price_inr: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">3-card standalone booster pack (₹20)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FREE-POOL MANAGER (Spec 5.2) */}
      {activeTab === 'free-pool' && (
        <div className="space-y-6">
          {/* Health Status Banner */}
          <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
            freePoolStatus?.is_balanced
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {freePoolStatus?.is_balanced ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
              )}
              <div>
                <h3 className={`text-base font-extrabold uppercase tracking-wide ${
                  freePoolStatus?.is_balanced ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {freePoolStatus?.is_balanced ? 'Free Pool Perfectly Balanced' : 'Free Pool Unbalanced Warning'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {freePoolStatus?.status_summary}
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedFreePool}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 shadow-lg shadow-violet-600/20"
            >
              <Sparkles className="w-4 h-4" /> Auto-Seed 40 Free Cards (5/Category)
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {freePoolStatus?.category_breakdown?.map((cat) => {
              const isMatch = cat.free_count === 5;
              return (
                <div key={cat.category_id} className={`glass-panel p-4 rounded-2xl border transition-all ${
                  isMatch ? 'border-white/5 hover:border-emerald-500/30' : 'border-amber-500/30 bg-amber-500/5'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{cat.category_name}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isMatch ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {cat.free_count} / 5
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-3">
                    Status: <span className={isMatch ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{cat.status}</span>
                  </p>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {cat.cards?.map((card, idx) => (
                      <div key={card.id || idx} className="text-[11px] text-slate-300 bg-white/5 px-2 py-1 rounded truncate flex items-center justify-between">
                        <span className="truncate">{card.name}</span>
                        <span className="text-[9px] text-violet-300 ml-1">v{card.version}</span>
                      </div>
                    ))}
                    {(!cat.cards || cat.cards.length === 0) && (
                      <div className="text-[10px] text-slate-500 italic py-1">No free cards assigned</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: APP-WIDE CONTROLS & OUTAGE SAFETY (Part B5) */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance Banner Control */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Maintenance Mode Banner
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerForm.is_active}
                  onChange={e => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Banner Message Shown in Mobile App</label>
              <textarea
                rows={3}
                value={bannerForm.message}
                onChange={e => setBannerForm({ ...bannerForm, message: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                placeholder="We're fixing a minor problem — back soon!"
              />
            </div>

            <button
              onClick={handleSaveMaintenanceBanner}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Banner Setting
            </button>
          </div>

          {/* Version Control & Force Update */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" /> App Version Control
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Min Android Version</label>
                <input
                  type="text"
                  value={versionForm.min_android_version}
                  onChange={e => setVersionForm({ ...versionForm, min_android_version: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Min iOS Version</label>
                <input
                  type="text"
                  value={versionForm.min_ios_version}
                  onChange={e => setVersionForm({ ...versionForm, min_ios_version: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs text-white font-bold">Enforce Immediate Force-Update</p>
                <p className="text-[10px] text-slate-400">Blocks app interaction until updated in store</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={versionForm.force_update}
                  onChange={e => setVersionForm({ ...versionForm, force_update: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <button
              onClick={handleSaveVersionControl}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Version Policies
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATION SWITCHES */}
      {activeTab === 'notifications' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5 max-w-3xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-400" /> Push Notification Triggers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Toggle automated system push alerts sent to couples</p>
            </div>
            <button
              onClick={handleSaveNotifSwitches}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-600/20"
            >
              <Save className="w-4 h-4" /> Save Switches
            </button>
          </div>

          <div className="space-y-4">
            {[
              { id: 'dare_reminder_24h', title: '24-Hour Dare Reminder', desc: 'Alerts receiver 24h prior to expiration deadline' },
              { id: 'dare_reminder_2h', title: '2-Hour Urgency Alert', desc: 'Final warning notification before penalty dare is issued' },
              { id: 'turn_nudge', title: 'Partner Turn Nudge', desc: 'Gentle notification when it is partner\'s turn to send a dare' },
              { id: 'dare_completed', title: 'Dare Completion Alert', desc: 'Notifies sender immediately when partner marks dare done' },
              { id: 'penalty_issued', title: 'Penalty Dare Notice', desc: 'Notifies couple when a timer expires and penalty dare triggers' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(notifForm[item.id])}
                    onChange={e => setNotifForm({ ...notifForm, [item.id]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: END-OF-FREE-GAME PITCH (Spec 5.4) */}
      {activeTab === 'pitch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pitch Editor Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" /> Season 1 Conversion Pitch Editor
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Modal Headline</label>
                <input
                  type="text"
                  value={pitchForm.headline || ''}
                  onChange={e => setPitchForm({ ...pitchForm, headline: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Subheadline</label>
                <input
                  type="text"
                  value={pitchForm.subheadline || ''}
                  onChange={e => setPitchForm({ ...pitchForm, subheadline: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Recap Value Proposition Body</label>
                <textarea
                  rows={3}
                  value={pitchForm.body_text || ''}
                  onChange={e => setPitchForm({ ...pitchForm, body_text: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Strike-through Price (₹)</label>
                  <input
                    type="number"
                    value={pitchForm.season_price_strike || 499}
                    onChange={e => setPitchForm({ ...pitchForm, season_price_strike: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={pitchForm.season_price_final || 299}
                    onChange={e => setPitchForm({ ...pitchForm, season_price_final: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">CTA Button Label</label>
                <input
                  type="text"
                  value={pitchForm.cta_label || ''}
                  onChange={e => setPitchForm({ ...pitchForm, cta_label: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleSavePitch}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-600/20"
            >
              <Save className="w-4 h-4" /> Save Pitch Offer
            </button>
          </div>

          {/* Live Mobile Paywall Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Mobile App Screen Preview</p>
            <div className="w-72 bg-[#0a0f1d] border border-violet-500/30 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
              <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-rose-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-base font-extrabold text-white leading-tight">{pitchForm.headline || 'Ready to deepen your connection?'}</h4>
              <p className="text-[11px] text-slate-400 mt-2">{pitchForm.subheadline || 'Unlock Season 1'}</p>

              <div className="my-5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 line-through">₹{pitchForm.season_price_strike || 499}</span>
                  <span className="text-2xl font-black text-white">₹{pitchForm.season_price_final || 299}</span>
                </div>
                <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Special Couple Introductory Offer</p>
              </div>

              <button className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30">
                {pitchForm.cta_label || 'Start Season 1 (₹299 for Both)'}
              </button>
              <p className="text-[9px] text-slate-500 mt-2">One purchase covers both partners. Cancel anytime.</p>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Reason Modal */}
      {reasonModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/10 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-violet-400" /> {reasonModal.title}
            </h3>
            <p className="text-xs text-slate-300">
              In accordance with administrative compliance, a specific business reason is required and will be permanently recorded in the immutable audit log.
            </p>
            <textarea
              rows={3}
              value={reasonModal.reason}
              onChange={e => setReasonModal({ ...reasonModal, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:border-violet-500 focus:outline-none"
              placeholder="e.g. Adjusting card timer grace periods for weekend marketing push..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReasonModal({ isOpen: false, title: '', reason: '', onConfirm: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReasonSubmit}
                disabled={actionLoading || !reasonModal.reason || reasonModal.reason.trim().length < 5}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-600/20"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
