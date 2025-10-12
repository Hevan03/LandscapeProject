import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5001" });
import { get, post, put, del } from "../api/apiClient";

// Notification API functions
export const notificationAPI = {
  // Get all notifications
  getAll: () => get("/api/notifications"),

  // Create new notification
  create: (message) => post("/api/notifications", { message }),

  // Delete notification
  delete: (id) => del(`/api/notifications/${id}`),

  // Mark notification as read
  markAsRead: (id) => put(`/api/notifications/read/${id}`),

  // Get unread notifications count
  getUnreadCount: () => get("/api/notifications/unread/count"),
};

// Get notifications for admin dashboard
export const getNotifications = () => API.get("/api/notifications", { params: { audience: "admin" } });

// Mark notification as read
export const markNotificationAsRead = (notificationId) => API.put(`/api/notifications/read/${notificationId}`);
