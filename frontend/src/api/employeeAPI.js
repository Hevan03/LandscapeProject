import { get, post, put, del, postFormData } from './apiClient';

// Employee API functions
export const employeeAPI = {
  // Get all employees
  getAll: () => get('/api/employees'),

  // Get employee by ID
  getById: (id) => get(`/api/employees/${id}`),

  // Create new employee application
  create: (formData) => postFormData('/api/employees', formData),

  // Update employee
  update: (id, data) => put(`/api/employees/${id}`, data),

  // Delete employee
  delete: (id) => del(`/api/employees/${id}`),

  // Get employees by type
  getByType: (type) => get(`/api/employees?type=${type}`),

  // Get employees by status
  getByStatus: (status) => get(`/api/employees?status=${status}`),

  // Admin functions
  // Get pending applications (employees with status "Open")
  getPendingApplications: () => get('/api/employees/RegisterEmployeeList'),

  // Get approved employees (employees with status "Approve")
  getApprovedEmployees: () => get('/api/employees'),

  // Approve employee application
  approveEmployee: (serviceNum, approveBy, approveReason = '') => 
    put(`/api/employees/approve/${serviceNum}`, { approveBy, approveReason }),

  // Reject employee application
  rejectEmployee: (serviceNum, rejectionReason = '') => 
    post(`/api/employees/reject/${serviceNum}`, { rejectionReason }),
};