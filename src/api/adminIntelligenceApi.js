import axiosInstance from './axiosInstance';

export const adminIntelligenceApi = {
  getSmartDeckAudit: (roomId) => axiosInstance.get(`/admin/intelligence/smart-deck/${roomId}`),
  getRelationshipDynamics: (params) => axiosInstance.get('/admin/intelligence/relationship-dynamics', { params }),
  getBehavioralScoring: () => axiosInstance.get('/admin/intelligence/behavioral-scoring'),
  getRiskDetection: () => axiosInstance.get('/admin/intelligence/risk-detection'),
  getFeedback: () => axiosInstance.get('/admin/intelligence/feedback'),
  getABTests: () => axiosInstance.get('/admin/intelligence/ab-tests'),
  createABTest: (payload) => axiosInstance.post('/admin/intelligence/ab-tests', payload),
  getDropoffAnalysis: () => axiosInstance.get('/admin/intelligence/dropoff-analysis'),
};
