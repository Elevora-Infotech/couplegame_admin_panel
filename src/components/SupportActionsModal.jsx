import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  X, Send, RefreshCw, ZapOff, RotateCcw, Clock, ShieldAlert,
  CheckCircle2, AlertTriangle, MessageSquare, Copy
} from 'lucide-react';
import { adminOperationsApi } from '../api/adminOperationsApi';
import { adminGameApi } from '../api/adminGameApi';
import { useAuth } from '../context/AuthContext';

export default function SupportActionsModal({ isOpen, onClose, roomId, roomCode, activeCards = [], onSuccess }) {
  const { isAdmin } = useAuth();
  const [selectedAction, setSelectedAction] = useState('resend_invite');
  const [reason, setReason] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(activeCards[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInviteResult(null);

    // Validate reason for destructive/state-changing actions
    if (selectedAction !== 'resend_invite') {
      if (!reason || reason.trim().length < 5) {
        toast.error('A detailed business reason (minimum 5 characters) is mandatory.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (selectedAction === 'resend_invite') {
        const res = await adminOperationsApi.resendInvite(roomId);
        setInviteResult(res.data.data);
        toast.success('Invite link generated successfully!');
      } else if (selectedAction === 'restore_card') {
        if (!selectedCardId) {
          toast.error('Please select a card to restore.');
          setIsLoading(false);
          return;
        }
        await adminOperationsApi.restoreCard(roomId, {
          card_send_id: selectedCardId,
          reason: reason.trim(),
        });
        toast.success('Card restored back to active hand!');
        if (onSuccess) onSuccess();
        onClose();
      } else if (selectedAction === 'extend_timer') {
        if (!selectedCardId) {
          toast.error('Please select an active card timer to extend.');
          setIsLoading(false);
          return;
        }
        await adminOperationsApi.extendTimer(roomId, {
          card_send_id: selectedCardId,
          hours: 24,
          reason: reason.trim(),
        });
        toast.success('Card timer extended by 24 hours!');
        if (onSuccess) onSuccess();
        onClose();
      } else if (selectedAction === 'force_end') {
        if (!isAdmin) {
          toast.error('Restricted: Force-ending games is only allowed for Admin role.');
          setIsLoading(false);
          return;
        }
        await adminGameApi.forceEnd(roomId, reason.trim());
        toast.success(`Room ${roomCode} has been force-ended.`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card rounded-[2rem] max-w-lg w-full p-6 md:p-8 border border-white/10 bg-[#0B0F19] relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-violet-400" />
              Support & Operator Actions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Couple: Room <span className="font-mono text-violet-300 font-bold">{roomCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Action Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Action</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setSelectedAction('resend_invite'); setInviteResult(null); }}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  selectedAction === 'resend_invite'
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Send className="w-4 h-4 mb-1 text-violet-400" />
                Resend Invite Link
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('extend_timer')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  selectedAction === 'extend_timer'
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Clock className="w-4 h-4 mb-1 text-blue-400" />
                Extend Timer (+24h)
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('restore_card')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  selectedAction === 'restore_card'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <RotateCcw className="w-4 h-4 mb-1 text-emerald-400" />
                Restore Card (Bug)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAdmin) {
                    toast.error('Restricted: Force-ending games is only allowed for Admin role.');
                    return;
                  }
                  setSelectedAction('force_end');
                }}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  !isAdmin ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500 border-white/5' :
                  selectedAction === 'force_end'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <ZapOff className="w-4 h-4 mb-1 text-rose-400" />
                Force-End Game {!isAdmin && '(Admin Only)'}
              </button>
            </div>
          </div>

          {/* Card Selector (if extending or restoring card) */}
          {(selectedAction === 'extend_timer' || selectedAction === 'restore_card') && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Target Card</label>
              {activeCards.length === 0 ? (
                <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  No active cards currently in transit for this couple.
                </p>
              ) : (
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  {activeCards.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.card_name} — Status: {c.status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Mandatory Reason Input */}
          {selectedAction !== 'resend_invite' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Mandatory Reason (Audited)
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">Min 5 chars</span>
              </div>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="E.g., Outage on 12 Nov caused push notifications to fail for 6 hours..."
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          )}

          {/* Invite Result Display */}
          {inviteResult && (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Invite Link Ready
              </div>
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10 text-xs font-mono text-slate-200">
                <span className="truncate flex-1">{inviteResult.invite_url}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inviteResult.invite_url)}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                  title="Copy Link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <a
                href={inviteResult.whatsapp_url}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-bold py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Open in WhatsApp Web
              </a>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {selectedAction === 'resend_invite' ? 'Generate Invite Link' : 'Execute Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
