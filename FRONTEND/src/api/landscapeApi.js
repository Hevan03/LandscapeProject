import axios from 'axios';

// base url.
const API_BASE_URL = 'http://localhost:5001/api/landscape';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Fetches a single landscape project by its ID.
 * @param {string} id - The ID of the landscape project.
 */
export const getLandscapeById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching landscape with id ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new landscape project with file uploads.
 * @param {FormData} landscapeData - The form data object, including text fields and files.
 */
export const createLandscape = async (landscapeData) => {
  try {
    // Make a POST request to the base URL ('/').
    // When you send a FormData object, Axios automatically sets the
    // 'Content-Type' header to 'multipart/form-data'.
    const response = await apiClient.post('/', landscapeData);
  
    return response.data;
  } catch (error) {
    console.error('Error creating landscape project:', error);
    throw error;
  }
};

/**
 * Fetches all landscape projects for a given landscaper ID.
 * @param {string} landscaperId - The ID of the landscaper.
 */
export const getLandscapesForLandscaper = async (landscaperId) => {
  try {
    const response = await apiClient.get(`/landscaper/${landscaperId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching projects for landscaper ${landscaperId}:`, error);
    throw error;
  }
};

/**
 * Fetches all landscape projects for a given customer ID.
 * @param {string} customerId - The ID of the customer.
 */
export const getLandscapesForCustomer = async (customerId) => {
  try {
    const response = await apiClient.get(`/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching projects for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Sends a request from the customer for a blueprint.
 * @param {string} landscapeId - The ID of the landscape project.
 */
export const requestBlueprint = async (landscapeId) => {
    try {
        const response = await apiClient.put(`/${landscapeId}/request-blueprint`);
        return response.data;
    } catch (error) {
        console.error("Error requesting blueprint:", error);
        throw error;
    }
};

/**
 * Uploads a blueprint file from the landscaper.
 * @param {string} landscapeId - The ID of the landscape project.
 * @param {FormData} formData - The FormData object containing the file.
 */
export const uploadBlueprint = async (landscapeId, formData) => {
    try {
        // Axios will set the correct multipart header for FormData
        const response = await apiClient.put(`/${landscapeId}/upload-blueprint`, formData);
        return response.data;
    } catch (error) {
        console.error("Error uploading blueprint:", error);
        throw error;
    }
};