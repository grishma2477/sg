import { apiRequest } from './apiClient';

// ── KYC ───────────────────────────────────────────────────────────────────────
export const getKycList = (status = 'pending', page = 1, limit = 20) =>
  apiRequest(`/api/kyc/list?status=${status}&page=${page}&limit=${limit}`);

export const getKycDetail = (userId) =>
  apiRequest(`/api/kyc/${userId}`);

export const verifyKyc = (userId, body) =>
  apiRequest(`/api/kyc/verify/${userId}`, { method: 'PUT', body: JSON.stringify(body) });

// ── Driver Applications ────────────────────────────────────────────────────────
export const getDriverApplications = (status = '', page = 1) =>
  apiRequest(`/api/driver-applications?status=${status}&page=${page}`);

export const getDriverApplication = (id) =>
  apiRequest(`/api/driver-applications/${id}`);

export const reviewApplication = (id, body) =>
  apiRequest(`/api/driver-applications/${id}/review`, { method: 'PUT', body: JSON.stringify(body) });

// ── Live Rides ────────────────────────────────────────────────────────────────
export const getActiveRides = () =>
  apiRequest('/api/admin/rides/active');

export const forceCompleteRide = (rideId) =>
  apiRequest(`/api/rides/${rideId}/complete`, { method: 'POST' });

// ── Payouts ───────────────────────────────────────────────────────────────────
export const getPayoutRequests = (status = 'pending', page = 1) =>
  apiRequest(`/api/payouts?status=${status}&page=${page}`);

export const approvePayout = (id, body) =>
  apiRequest(`/api/payouts/${id}/approve`, { method: 'PUT', body: JSON.stringify(body) });

export const rejectPayout = (id, body) =>
  apiRequest(`/api/payouts/${id}/reject`, { method: 'PUT', body: JSON.stringify(body) });

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (search = '', page = 1, limit = 20) =>
  apiRequest(`/api/admin/manage/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);

export const getUserDetail = (userId) =>
  apiRequest(`/api/admin/manage/users/${userId}`);

export const lockWallet = (userId) =>
  apiRequest(`/api/admin/manage/users/${userId}/lock-wallet`, { method: 'PUT' });

export const unlockWallet = (userId) =>
  apiRequest(`/api/admin/manage/users/${userId}/unlock-wallet`, { method: 'PUT' });

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  apiRequest('/api/admin/stats');
