import axiosInstance from './axiosInstance';

export const getRuntimeSettings = async () => {
  const response = await axiosInstance.get('/admin/settings/runtime');
  return response.data?.data;
};

export const updateRuntimeSettings = async ({ settings, reason }) => {
  const response = await axiosInstance.put('/admin/settings/runtime', { settings, reason });
  return response.data?.data;
};

export const getFreePoolStatus = async () => {
  const response = await axiosInstance.get('/admin/settings/free-pool');
  return response.data?.data;
};

export const setCardFreePoolStatus = async ({ cardId, isFreePool, reason }) => {
  const response = await axiosInstance.post('/admin/settings/free-pool/assign', { cardId, isFreePool, reason });
  return response.data?.data;
};

export const seedFreePoolDefaults = async ({ reason }) => {
  const response = await axiosInstance.post('/admin/settings/free-pool/seed', { reason });
  return response.data?.data;
};

export const getAppControls = async () => {
  const response = await axiosInstance.get('/admin/settings/controls');
  return response.data?.data;
};

export const updateAppControlSetting = async ({ key, value, reason }) => {
  const response = await axiosInstance.put('/admin/settings/controls', { key, value, reason });
  return response.data?.data;
};

export const pauseAllTimers = async ({ reason }) => {
  const response = await axiosInstance.post('/admin/settings/controls/pause-timers', { reason });
  return response.data?.data;
};

export const resumeAllTimers = async ({ reason }) => {
  const response = await axiosInstance.post('/admin/settings/controls/resume-timers', { reason });
  return response.data?.data;
};

export const getFreeGamePitch = async () => {
  const response = await axiosInstance.get('/admin/settings/pitch');
  return response.data?.data;
};

export const updateFreeGamePitch = async ({ pitch, reason }) => {
  const response = await axiosInstance.put('/admin/settings/pitch', { pitch, reason });
  return response.data?.data;
};

export const getSoftLaunchMetrics = async () => {
  const response = await axiosInstance.get('/admin/settings/soft-launch');
  return response.data?.data;
};

export const getMembershipPlans = async () => {
  const response = await axiosInstance.get('/admin/settings/plans');
  return response.data?.data;
};

export const updateMembershipPlans = async ({ plans, features, reason }) => {
  const response = await axiosInstance.put('/admin/settings/plans', { plans, features, reason });
  return response.data?.data;
};
