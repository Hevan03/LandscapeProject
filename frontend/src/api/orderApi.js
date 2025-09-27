import axios from "axios";
import { getSessionId } from "./cartApi"; 

const API = axios.create({
    baseURL: "http://localhost:5001/api",
});

// This function will send cart data to the new order backend
export const createOrder = (customerId) => {
    // We get the sessionId from the localStorage here
    const currentSessionId = getSessionId();
    return API.post(`/orders/create`, { sessionId: currentSessionId, customerId });
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
  return API.put(`/orders/${orderId}/status`, { status });
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

