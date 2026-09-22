import { apiRequest } from './apiClient';
import { ApiNotification } from './types';

export function getNotifications(page = 1) {
  return apiRequest<{ notifications: ApiNotification[]; unreadCount: number; hasMore: boolean }>(
    `/notifications?page=${page}`
  );
}

export function markAsRead(id: string) {
  return apiRequest<{ notification: ApiNotification }>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllAsRead() {
  return apiRequest<{ message: string }>('/notifications/read-all', { method: 'PATCH' });
}
