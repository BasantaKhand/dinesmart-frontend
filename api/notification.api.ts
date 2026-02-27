import api from '@/lib/axios';

export interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'UNREAD' | 'READ' | 'ARCHIVED';
    actionUrl?: string;
    createdAt: string;
}

export const getNotificationsApi = (params?: { limit?: number }) =>
    api.get('/notifications', { params });

export const markNotificationReadApi = (id: string) =>
    api.put(`/notifications/${id}/read`);

export const markAllNotificationsReadApi = () =>
    api.put('/notifications/read-all');

export const archiveNotificationApi = (id: string) =>
    api.put(`/notifications/${id}/archive`);

export const deleteNotificationApi = (id: string) =>
    api.delete(`/notifications/${id}`);
