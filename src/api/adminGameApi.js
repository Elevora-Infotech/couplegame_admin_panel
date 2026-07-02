import axiosInstance from './axiosInstance';

export const adminGameApi = {
  getStats:   ()           => axiosInstance.get('/admin/games/stats'),
  getAll:     (params)     => axiosInstance.get('/admin/games', { params }),
  getById:    (id)         => axiosInstance.get(`/admin/games/${id}`),
  forceEnd:   (id)         => axiosInstance.post(`/admin/games/${id}/force-end`),
};
