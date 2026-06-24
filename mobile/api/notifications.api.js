import { apiGet, apiPut } from './client';

export const getNotifications = (page = 1) => apiGet('/api/notifications', { page, limit: 20 });
export const getUnreadCount   = ()          => apiGet('/api/notifications/unread-count');
export const markAsRead       = (id)        => apiPut(`/api/notifications/${id}/read`);
export const markAllAsRead    = ()          => apiPut('/api/notifications/read-all');
