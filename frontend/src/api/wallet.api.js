import { apiRequest } from './apiClient';

export const getWallet = () =>
  apiRequest('/api/wallet');

export const getTransactions = (page = 1, limit = 20, type = '') =>
  apiRequest(`/api/wallet/transactions?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`);

export const topUpWallet = (body) =>
  apiRequest('/api/wallet/topup', { method: 'POST', body: JSON.stringify(body) });

export const getEarningsSummary = (period = 'today') =>
  apiRequest(`/api/drivers/earnings/summary?period=${period}`);

export const getEarningsHistory = (page = 1, limit = 10) =>
  apiRequest(`/api/drivers/earnings/history?page=${page}&limit=${limit}`);

export const requestPayout = (body) =>
  apiRequest('/api/payouts', { method: 'POST', body: JSON.stringify(body) });
