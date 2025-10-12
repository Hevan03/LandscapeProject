// src/api/adminPaymentApi.js

import axios from "axios";

const API_INVENTORY = axios.create({ baseURL: "http://localhost:5001/api/item-payments" });
const API_SERVICE = axios.create({ baseURL: "http://localhost:5001/api/payment" }); // Assuming this is your service payments route
const API_CART = axios.create({ baseURL: "http://localhost:5001/api/cart" });

// Function to fetch all inventory payments
export const getAllInventoryPayments = () => API_INVENTORY.get("/");

// Function to fetch all service payments
export const getAllServicePayments = () => API_SERVICE.get("/");

// Approve or reject a payment (bank slip)
export const updatePaymentStatus = (paymentId, status) => API_SERVICE.put(`/${paymentId}`, { status });

// Update inventory (item) payment status
export const updateItemPaymentStatus = (paymentId, status) => API_INVENTORY.put(`/${paymentId}`, { status });

// Clear customer cart
export const clearCustomerCart = (customerId) => API_CART.delete(`/${customerId}`);
