// src/api/servicePaymentApi.js

import axios from 'axios';

// Prefer environment variable, fallback to localhost for dev
const BASE_URL = import.meta.env.VITE_PAYMENTS_BASE_URL || 'http://localhost:5000/main-payments';
const API = axios.create({ baseURL: BASE_URL });

// Function to create a new service payment
export const createServicePayment = (paymentData) => API.post('/', paymentData);

// Function to get a service payment by ID
export const getServicePaymentById = (id) => API.get(`/${id}`);

// Note: You can add more functions here as needed (e.g., update, delete)
// For the customer-facing page, create is the main function.