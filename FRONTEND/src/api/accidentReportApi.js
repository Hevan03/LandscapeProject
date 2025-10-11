import axios from "axios";

// Base URL from env; fallback to localhost
const API_URL = "http://localhost:5001/api/delivery/accident-reports";

// Get all accident reports (admin)
export const getAllAccidentReports = () => axios.get(API_URL);

// Get a single accident report by ID
export const getAccidentReportById = (id) => axios.get(`${API_URL}/${id}`);

// Create a new accident report (driver submission)
export const createAccidentReport = (data) => axios.post(API_URL, data);

// Update an accident report (admin)
export const updateAccidentReport = (id, data) => axios.put(`${API_URL}/${id}`, data);

// Update only status (admin) via PATCH /:id/status
export const updateAccidentReportStatus = (id, status) => axios.patch(`${API_URL}/${id}/status`, { status });

// Delete an accident report (admin)
export const deleteAccidentReport = (id) => axios.delete(`${API_URL}/${id}`);
