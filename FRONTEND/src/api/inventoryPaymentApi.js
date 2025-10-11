import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5001" });

// Get order details for payment
export const getOrderForPayment = (orderId) => API.get(`/item-payments/order/${orderId}`);

// Create inventory payment
export const createInventoryPayment = (paymentData) => API.post("/item-payments/inventory-payment", paymentData);

// Get notifications for admin dashboard
export const getNotifications = () => API.get("/api/notifications");

// Mark notification as read
export const markNotificationAsRead = (notificationId) => API.put(`/api/notifications/read/${notificationId}`);
