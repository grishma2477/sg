import { apiGet, apiPost } from './client';

export const getWallet          = ()              => apiGet('/api/wallet');
export const getTransactions    = (page = 1)      => apiGet('/api/wallet/transactions', { page, limit: 20 });
export const topUpWallet        = (body)          => apiPost('/api/wallet/topup', body);
export const getEarningsSummary = (period)        => apiGet('/api/drivers/earnings/summary', { period });
export const getEarningsHistory = (page = 1)      => apiGet('/api/drivers/earnings/history', { page, limit: 10 });
export const requestPayout      = (body)          => apiPost('/api/payouts', body);
