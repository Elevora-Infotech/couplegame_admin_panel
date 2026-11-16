import api from './axiosInstance';

export const adminOperationsApi = {
  // Unified search across 7 identifiers
  search: (q) => api.get('/admin/operations/search', { params: { q } }),

  // Complete Couple Screen (7 Tiers)
  getCouple: (roomId) => api.get(`/admin/operations/couples/${roomId}`),

  // Support Notes
  addNote: (roomId, data) => api.post(`/admin/operations/couples/${roomId}/notes`, data),

  // Support Actions
  resendInvite: (roomId) => api.post(`/admin/operations/couples/${roomId}/resend-invite`),
  restoreCard: (roomId, data) => api.post(`/admin/operations/couples/${roomId}/restore-card`, data),
  extendTimer: (roomId, data) => api.post(`/admin/operations/couples/${roomId}/extend-timer`, data),

  // App-Wide Controls
  getControls: () => api.get('/admin/operations/controls'),
  pauseTimers: (reason) => api.post('/admin/operations/controls/pause-timers', { reason }),
  resumeTimers: (reason) => api.post('/admin/operations/controls/resume-timers', { reason }),
  updateControlSetting: (key, value, reason) => api.put('/admin/operations/controls/settings', { key, value, reason }),
};
