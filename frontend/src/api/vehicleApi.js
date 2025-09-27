// src/api/vehiclesApi.js

import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/vehicles' });

// Function to fetch all vehicles
export const getAllVehicles = () => API.get('/');

// Function to create a new vehicle
export const createVehicle = (vehicleData) => API.post('/', vehicleData);

// Function to get a vehicle by ID
export const getVehicleById = (id) => API.get(`/${id}`);

// Function to update a vehicle
export const updateVehicle = (id, updatedData) => API.put(`/${id}`, updatedData);

// Function to delete a vehicle
export const deleteVehicle = (id) => API.delete(`/${id}`);