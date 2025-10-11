import axios from "axios";

// The base URL for your backend API (env-based with fallback)
const API = axios.create({ baseURL: "http://localhost:5001" });

// Function to fetch paid orders that need assignment
export const getPendingOrders = () => API.get("/delivery-assignments/pending-orders");

// Function to fetch orders that are ready for assignment (i.e., paid)
export const getOrdersForAssignment = () => API.get("/api/delivery/assignments/paid-orders");

// Function to fetch available drivers
export const getAvailableDrivers = () => API.get("/delivery-assignments/available-drivers");

// Function to fetch available vehicles
export const getAvailableVehicles = () => API.get("/delivery-assignments/available-vehicles");

// ✅ Corrected: Create a new delivery assignment
export const createNewAssignment = (assignmentData) => API.post("/delivery-assignments", assignmentData);

// ✅ Corrected: Get all assigned deliveries
export const getAssignedDeliveries = () => API.get("/api/delivery/assignments");

// ✅ Corrected: Download delivery report CSV
export const downloadDeliveryReportCsv = async () => {
  const baseURL = "http://localhost:5001";
  const url = `${baseURL}/delivery-assignments/report.csv`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("Download failed");
  return await res.blob();
};
