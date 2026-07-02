import axios from '../api/axiosInstance';

export const adminUserApi = {
  // Get paginated users with optional search/filter
  getAll: (params = {}) => axios.get('/admin/users', { params }),

  // Get user growth stats for overview
  getStats: () => axios.get('/admin/users/stats'),

  // Get single user detail
  getById: (id) => axios.get(`/admin/users/${id}`),

  // Block user
  block: (id) => axios.patch(`/admin/users/${id}/block`),

  // Unblock user
  unblock: (id) => axios.patch(`/admin/users/${id}/unblock`),

  // Reset active room for user
  resetRoom: (id) => axios.post(`/admin/users/${id}/reset-room`),
};
