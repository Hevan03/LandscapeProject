import axios from 'axios';

//base URL 
const API_BASE_URL = 'http://localhost:5001/api/progress';

 
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

 
export const getAllProgress = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error("Error fetching all progress:", error);
    throw error;
  }
};

/**
 * Fetches a single progress post by its ID.
 @param {string} id - The ID of the progress post.
 */
export const getProgressById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching progress with id ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches all progress posts for a specific customer.
 * Corresponds to: GET /customer/:customerId
 * @param {string} customerId - The ID of the customer.
 */
export const getProgressForCustomer = async (customerId) => {
  try {
    const response = await apiClient.get(`/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching progress for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Fetches all progress posts for a specific landscaper.
 * Corresponds to: GET /landscaper/:landscaperId
 * @param {string} landscaperId - The ID of the landscaper.
 */
export const getProgressForLandscaper = async (landscaperId) => {
  try {
    const response = await apiClient.get(`/landscaper/${landscaperId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching progress for landscaper ${landscaperId}:`, error);
    throw error;
  }
};

/**
 * Creates a new progress post with image uploads.
 * Corresponds to: POST /
 * @param {object} progressData - The data for the new post.
 * Should include landscapeId, name, description, tasks (as an array of objects),
 * and images (as a FileList from an input).
 */
export const createProgress = async (progressData) => {
  const formData = new FormData();

  
  formData.append('landscapeId', progressData.landscapeId);
  formData.append('name', progressData.name);
  formData.append('description', progressData.description);

   
  formData.append('tasks', JSON.stringify(progressData.tasks));


  if (progressData.images && progressData.images.length > 0) {
    for (let i = 0; i < progressData.images.length; i++) {
      formData.append('images', progressData.images[i]);
    }
  }

  try {
    const response = await apiClient.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating progress:", error);
    throw error;
  }
};

/**
 * Updates an existing progress post.
 * Corresponds to: PUT /:id
 * @param {string} id - The ID of the progress post to update.
 * @param {object} updateData - The data to update. Can include name, description, tasks, images.
 */
export const updateProgress = async (id, updateData) => {
  const formData = new FormData();

  if (updateData.name) formData.append('name', updateData.name);
  if (updateData.description) formData.append('description', updateData.description);
  
  
  if (updateData.tasks) {
    formData.append('tasks', JSON.stringify(updateData.tasks));
  }
  
   
  if (updateData.images && updateData.images.length > 0) {
    for (let i = 0; i < updateData.images.length; i++) {
      formData.append('images', updateData.images[i]);
    }
  }

  try {
    const response = await apiClient.put(`/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating progress with id ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a progress post by its ID.
 * Corresponds to: DELETE /:id
 * @param {string} id - The ID of the progress post to delete.
 */
export const deleteProgress = async (id) => {
  try {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting progress with id ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches all progress posts for a specific landscape project.
 * @param {string} landscapeId - The ID of the landscape project.
 */
export const getProgressForLandscape = async (landscapeId) => {
  try {
    const response = await apiClient.get(`/landscape/${landscapeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching progress for landscape ${landscapeId}:`, error);
    throw error;
  }
};