import axios from '../api/axiosInstance';

export const adminUserApi = {
  // Get paginated users with optional search/filter (phone and email sanitized)
  getAll: (params = {}) => axios.get('/admin/users', { params }),

  // Get user growth stats for overview
  getStats: () => axios.get('/admin/users/stats'),

  // Get single user detail (masked phone, email visible for support)
  getById: (id) => axios.get(`/admin/users/${id}`),

  // Block user (requires mandatory reason)
  block: (id, reason) => axios.patch(`/admin/users/${id}/block`, { reason }),

  // Unblock user (requires mandatory reason)
  unblock: (id, reason) => axios.patch(`/admin/users/${id}/unblock`, { reason }),

  // Reset active room for user (close stuck room, requires mandatory reason)
  resetRoom: (id, reason) => axios.post(`/admin/users/${id}/reset-room`, { reason }),
};
