import api from './axiosInstance';

export const adminNotificationApi = {
  // Stats
  getStats: async () => {
    const res = await api.get('/admin/notifications/stats');
    return res.data;
  },

  // Templates
  getTemplates: async () => {
    const res = await api.get('/admin/notifications/templates');
    return res.data;
  },
  updateTemplate: async (id, data) => {
    const res = await api.put(`/admin/notifications/templates/${id}`, data);
    return res.data;
  },
  toggleTemplate: async (id, isEnabled) => {
    const res = await api.patch(`/admin/notifications/templates/${id}/toggle`, { is_enabled: isEnabled });
    return res.data;
  },

  // Manual Send
  sendManual: async (data) => {
    const res = await api.post('/admin/notifications/send', data);
    return res.data;
  },
  triggerAnniversaries: async () => {
    const res = await api.post('/admin/notifications/trigger-anniversaries');
    return res.data;
  },

  // Scheduled
  getScheduled: async () => {
    const res = await api.get('/admin/notifications/scheduled');
    return res.data;
  },
  scheduleNotification: async (data) => {
    const res = await api.post('/admin/notifications/schedule', data);
    return res.data;
  },
  cancelScheduled: async (id) => {
    const res = await api.delete(`/admin/notifications/scheduled/${id}`);
    return res.data;
  },

  // Logs
  getLogs: async () => {
    const res = await api.get('/admin/notifications/logs');
    return res.data;
  }
};
