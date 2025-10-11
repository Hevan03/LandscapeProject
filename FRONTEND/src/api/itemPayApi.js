// src/api/itemPayApi.js

import axios from 'axios';

// Prefer environment variable, fallback to localhost for dev
const BASE_URL = import.meta.env.VITE_ITEM_PAYMENTS_BASE_URL || 'http://localhost:5000/item-payments';
const API = axios.create({ baseURL: BASE_URL });

// Function to fetch all item payments
export const getAllItemPayments = () => API.get('/');

// Function to create a new item payment
export const createItemPayment = (paymentData) => API.post('/', paymentData);

// Function to update an item payment
export const updateItemPayment = (id, updatedData) => API.put(`/${id}`, updatedData);

// Function to delete an item payment
export const deleteItemPayment = (id) => API.delete(`/${id}`);

// Function to get an item payment by ID
// Fetch order details for payment under the item-payments route group
export const getOrderForPayment = (orderId) => API.get(`/order/${orderId}`);

// Function to create an inventory payment (bank slip/cash)
export const createInventoryPayment = (paymentData) => API.post('/inventory-payment', paymentData);