import axios from "axios";

// The base URL for your backend API (env-based with fallback)
const API = axios.create({ baseURL: "http://localhost:5001" });

// All delivery-assignment endpoints are mounted at /api/delivery/assignments on the backend

// Function to fetch pending orders (no assignment yet)
export const getPendingOrders = () => API.get("/api/delivery/assignments/pending-orders");

// Function to fetch orders that are ready for assignment (i.e., paid)
export const getOrdersForAssignment = () => API.get("/api/delivery/assignments/paid-orders");

// Function to fetch available drivers
export const getAvailableDrivers = () => API.get("/api/delivery/assignments/available-drivers");

// Function to fetch available vehicles
export const getAvailableVehicles = () => API.get("/api/delivery/assignments/available-vehicles");

// Create a new delivery assignment
export const createNewAssignment = (assignmentData) => API.post("/api/delivery/assignments", assignmentData);

// Get all assigned deliveries
export const getAssignedDeliveries = () => API.get("/api/delivery/assignments");

// Update assignment status
export const updateAssignmentStatus = (assignmentId, status) => API.put(`/api/delivery/assignments/${assignmentId}`, { status });

// Download delivery report CSV
export const downloadDeliveryReportCsv = async () => {
  const url = `http://localhost:5001/api/delivery/assignments/report.csv`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("Download failed");
  return await res.blob();
};
