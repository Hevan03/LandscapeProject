// src/api/orderApi.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/orders' });

export const createOrder = (orderData) => API.post('/', orderData);
export const getAllOrders = () => API.get('/');
export const getOrdersByStatus = (status) => API.get(`/status/${status}`);
export const updateOrderStatus = (id, status) => API.patch(`/${id}/status`, { status });
