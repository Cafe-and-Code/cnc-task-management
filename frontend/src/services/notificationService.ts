import apiClient from './apiClient';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  // Get notification by ID
  async getNotificationById(id: string): Promise<Notification> {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  // Create a new notification
  async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    const response = await apiClient.post('/notifications', notificationData);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  },
};