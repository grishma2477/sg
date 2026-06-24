import { apiRequest } from './apiClient';

export const getNotifications = (page = 1, limit = 20) =>
  apiRequest(`/api/notifications?page=${page}&limit=${limit}`);

export const getUnreadCount = () =>
  apiRequest('/api/notifications/unread-count');

export const markAsRead = (id) =>
  apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });

export const markAllAsRead = () =>
  apiRequest('/api/notifications/read-all', { method: 'PUT' });
