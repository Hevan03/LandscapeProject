import { get, post, del } from './apiClient';

// Rating API functions
export const ratingAPI = {
  // Get all ratings
  getAll: () => get('/api/ratings'),

  // Get ratings for specific employee
  getByEmployeeId: (employeeId) => get(`/api/ratings/employee/${employeeId}`),

  // Create new rating
  create: (ratingData) => post('/api/ratings', ratingData),

  // Delete rating
  delete: (id) => del(`/api/ratings/${id}`),

  // Get average rating for employee
  getAverageRating: (employeeId) => get(`/api/ratings/employee/${employeeId}/average`),
};