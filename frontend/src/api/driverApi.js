// src/api/driverApi.js

import axios from 'axios';

// The base URL for the driver API
const API = axios.create({ baseURL: 'http://localhost:5000/drivers' });

// Function to create a new driver
export const createDriver = (driverData) => axios.post('http://localhost:5000/drivers', driverData);

// Function to get all drivers
export const getAllDrivers = () => API.get('/');

// Function to get a single driver by ID
export const getDriverById = (id) => API.get(`/${id}`);

// Function to update a driver
export const updateDriver = (id, updatedData) => API.put(`/${id}`, updatedData);

// Function to delete a driver
export const deleteDriver = (id) => API.delete(`/${id}`);