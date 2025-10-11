// src/api/deliveryReportApi.js

import axios from "axios";

// The base URL for your delivery reports API
const API = axios.create({ baseURL: "http://localhost:5001/api/delivery-reports" });

// Function to get all delivery reports
export const getAllDeliveryReports = () => API.get("/");

// Function to get monthly delivery reports (requires year and month)
export const getMonthlyDeliveryReports = (year, month) => API.get(`/monthly?year=${year}&month=${month}`);

// Function to get deliveries by a specific driver ID
export const getDeliveriesByDriver = (driverId) => API.get(`/driver/${driverId}`);

// Function to get deliveries by a specific vehicle ID
export const getDeliveriesByVehicle = (vehicleId) => API.get(`/vehicle/${vehicleId}`);

// Function to export reports (placeholder)
export const exportReports = () => API.get("/export");

// Function to fetch all pending orders
export const getPendingOrders = () => API.get("/pending");

// Function to fetch all completed orders
export const getCompletedOrders = () => API.get("/completed");
