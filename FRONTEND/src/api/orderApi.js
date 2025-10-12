import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Create an order with explicit payload
export const createOrder = (payload) => {
  return API.post(`/orders/create`, payload);
};

// This function will fetch all orders for a specific customer
export const getOrdersByCustomer = (customerId) => {
  return API.get(`/orders/${customerId}`);
};

// Cancel & refund an Shop order
export const cancelOrder = (orderId) => {
  return API.delete(`/orders/${orderId}`);
};

// Update shop order status
export const updateOrderStatusAPI = (orderId, status) => {
  return API.patch(`/orders/${orderId}/status`, { status });
};

export const getRentalOrdersByCustomer = (customerId) => {
  return API.get(`/rental-orders?customerId=${customerId}`);
};

// Cancel & refund an rental order
export const cancelRentalOrder = (orderId) => {
  return API.delete(`/rental-orders/${orderId}`);
};

// Update rental order status
export const updateRentalOrderStatusAPI = (orderId, status) => {
  return API.put(`/rental-orders/${orderId}/status`, { status });
};
