// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// GET request
export const get = (endpoint) => apiRequest(endpoint);

// POST request
export const post = (endpoint, data) => 
  apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// PUT request
export const put = (endpoint, data) => 
  apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// DELETE request
export const del = (endpoint) => 
  apiRequest(endpoint, {
    method: 'DELETE',
  });

// POST request with FormData (for file uploads)
export const postFormData = (endpoint, formData) => 
  apiRequest(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });