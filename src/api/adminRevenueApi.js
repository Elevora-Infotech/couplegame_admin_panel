import axiosInstance from './axiosInstance';

export const adminRevenueApi = {
  // 1. Subscriptions & Couples Ledger
  getSubscriptions: (params) => axiosInstance.get('/admin/revenue/subscriptions', { params }),

  // 2. Revenue KPIs & Executive Analytics
  getMetrics: (params) => axiosInstance.get('/admin/revenue/metrics', { params }),

  // 3. Paywall Impressions & 6-Stage Conversion Funnel
  getPaywallFunnel: () => axiosInstance.get('/admin/revenue/paywall-funnel'),

  // 4. Marketing ROI & Ad Spend CAC Engine
  getMarketingROI: () => axiosInstance.get('/admin/revenue/marketing-roi'),
  recordAdSpend: (payload) => axiosInstance.post('/admin/revenue/ad-spend', payload),

  // 5. Financial Operations (Refunds & Complimentary Grants)
  processRefund: (purchaseId, reason) => axiosInstance.post(`/admin/revenue/refund/${purchaseId}`, { reason }),
  grantComplimentary: (payload) => axiosInstance.post('/admin/revenue/complimentary-grant', payload),
};
