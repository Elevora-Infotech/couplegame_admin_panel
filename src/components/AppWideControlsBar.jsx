import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PauseCircle, PlayCircle, AlertTriangle, ShieldCheck, Wrench, RefreshCw, Smartphone } from 'lucide-react';
import { adminOperationsApi } from '../api/adminOperationsApi';
import { useAuth } from '../context/AuthContext';

export default function AppWideControlsBar() {
  const { isAdmin } = useAuth();
  const [controls, setControls] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'pause' | 'resume' | 'maintenance'
  const [reason, setReason] = useState('');
  const [maintenanceMsg, setMaintenanceMsg] = useState("We're fixing a minor problem — back soon!");

  const fetchControls = async () => {
    try {
      const res = await adminOperationsApi.getControls();
      if (res.data?.status === 'success') {
        setControls(res.data.data);
      }
    } catch (err) {
      console.warn('Controls fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchControls();
    // Refresh control status every 30 seconds
    const interval = setInterval(fetchControls, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePauseResumeSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('A detailed reason (min 5 characters) is mandatory.');
      return;
    }

    setIsLoading(true);
    try {
      if (modalMode === 'pause') {
        const res = await adminOperationsApi.pauseTimers(reason.trim());
        toast.success(res.data.message);
      } else if (modalMode === 'resume') {
        const res = await adminOperationsApi.resumeTimers(reason.trim());
        toast.success(res.data.message);
      } else if (modalMode === 'maintenance') {
        const currentActive = controls?.maintenance_banner?.is_active || false;
        await adminOperationsApi.updateControlSetting('maintenance_banner', {
          is_active: !currentActive,
          message: maintenanceMsg,
        }, reason.trim());
        toast.success(`Maintenance banner ${!currentActive ? 'enabled' : 'disabled'}.`);
      }
      setShowModal(false);
      setReason('');
      fetchControls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Control operation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPaused = controls?.timers_paused?.is_paused === true;
  const isMaintenance = controls?.maintenance_banner?.is_active === true;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Outage Timer Pause / Resume Button */}
        {isPaused ? (
          <button
            onClick={() => {
              if (!isAdmin) {
                toast.error('Restricted: Only Admin role can resume system timers.');
                return;
              }
              setModalMode('resume');
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold animate-pulse hover:bg-amber-500/30 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            title="Timers are paused for an outage. Click to resume."
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Resume Timers (Outage Active)
          </button>
        ) : (
          <button
            onClick={() => {
              if (!isAdmin) {
                toast.error('Restricted: Only Admin role can pause system timers.');
                return;
              }
              setModalMode('pause');
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            title="Freeze all card timers during outages so couples aren't penalized."
          >
            <PauseCircle className="w-3.5 h-3.5 text-violet-400" />
            Pause All Timers
          </button>
        )}

        {/* Maintenance Banner Indicator / Trigger */}
        <button
          onClick={() => {
            if (!isAdmin) {
              toast.error('Restricted: Only Admin role can toggle maintenance banner.');
              return;
            }
            setModalMode('maintenance');
            setShowModal(true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
            isMaintenance
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/10'
          }`}
          title="Toggle in-app maintenance announcement banner"
        >
          <Wrench className="w-3.5 h-3.5" />
          {isMaintenance ? 'Maintenance ON' : 'Banner'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-[2rem] max-w-md w-full p-6 md:p-8 border border-white/10 bg-[#0B0F19] shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                {modalMode === 'pause' && 'Emergency: Pause All Card Timers'}
                {modalMode === 'resume' && 'Resume All System Timers'}
                {modalMode === 'maintenance' && 'Toggle In-App Maintenance Banner'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {modalMode === 'pause' && 'Freezes all active card timers across all rooms. No partner will incur penalties during this pause.'}
                {modalMode === 'resume' && 'Calculates the outage duration and extends all active card deadlines by the exact minutes elapsed.'}
                {modalMode === 'maintenance' && 'Displays a notification banner to all active players inside the mobile app.'}
              </p>
            </div>

            <form onSubmit={handlePauseResumeSubmit} className="space-y-4">
              {modalMode === 'maintenance' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Banner Message</label>
                  <input
                    type="text"
                    required
                    value={maintenanceMsg}
                    onChange={(e) => setMaintenanceMsg(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Mandatory Business Reason</label>
                  <span className="text-[10px] text-amber-400">Min 5 chars</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., AWS database upgrade scheduled from 2:00 PM to 2:30 PM..."
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
