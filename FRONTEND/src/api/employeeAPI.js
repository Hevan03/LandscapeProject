import { get, post, put, del, postFormData } from "./apiClient";

// Employee API functions
export const employeeAPI = {
  // Get all employees
  getAll: () => get("/api/staff/all"),

  // Get employee by ID
  getById: (id) => get(`/api/staff/${id}`),

  // Create new employee application
  create: (formData) => postFormData("/api/staff", formData),

  // Update employee
  update: (id, data) => put(`/api/staff/${id}`, data),

  // Delete employee
  delete: (id) => del(`/api/staff/${id}`),

  // Get employees by type
  getByType: (type) => get(`/api/staff?type=${type}`),

  // Get employees by status
  getByStatus: (status) => get(`/api/staff?status=${status}`),

  // Admin functions
  // Get pending applications (employees with status "Open")
  getPendingApplications: () => get("/api/staff/employeeList"),

  // Get approved employees (employees with status "Approve")
  getApprovedEmployees: () => get("/api/staff/approved"),

  // Approve employee application
  approveEmployee: (serviceNum, approveBy, approveReason = "") => put(`/api/staff/approve/${serviceNum}`, { approveBy, approveReason }),

  // Reject employee application
  rejectEmployee: (serviceNum, rejectionReason = "") => post(`/api/staff/reject/${serviceNum}`, { rejectionReason }),
};
