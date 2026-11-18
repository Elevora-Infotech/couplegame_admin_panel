import axiosInstance from './axiosInstance';

export const adminContentApi = {
  getCards: (params) => axiosInstance.get('/admin/content/cards', { params }),
  getCardById: (id) => axiosInstance.get(`/admin/content/cards/${id}`),
  createCard: (payload) => axiosInstance.post('/admin/content/cards', payload),
  createBulkCards: (payload) => axiosInstance.post('/admin/content/cards/bulk', payload),
  updateCard: (id, payload) => axiosInstance.put(`/admin/content/cards/${id}`, payload),
  deleteCard: (id) => axiosInstance.delete(`/admin/content/cards/${id}`),
  toggleCard: (id, payload) => axiosInstance.patch(`/admin/content/cards/${id}/toggle`, payload),
  getCategories: () => axiosInstance.get('/admin/content/categories'),
  updateCategory: (id, payload) => axiosInstance.put(`/admin/content/categories/${id}`, payload),
  getContentDiffs: (params) => axiosInstance.get('/admin/content/diffs', { params }),
};
