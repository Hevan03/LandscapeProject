import { get, post, put, del } from './apiClient';

// Notification API functions
export const notificationAPI = {
  // Get all notifications
  getAll: () => get('/api/notifications'),

  // Create new notification
  create: (message) => post('/api/notifications', { message }),

  // Delete notification
  delete: (id) => del(`/api/notifications/${id}`),

  // Mark notification as read
  markAsRead: (id) => put(`/api/notifications/${id}/read`, {}),

  // Get unread notifications count
  getUnreadCount: () => get('/api/notifications/unread/count'),
};