import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/appointments";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Creates a new appointment with file uploads.
 * @param {FormData} appointmentData - The FormData object from the form.
 */
export const createAppointment = async (appointmentData) => {
  try {
    // When sending FormData, let the browser set the Content-Type header automatically.
    // This is the correct way to handle file uploads with Axios.
    const response = await apiClient.post("/", appointmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

/**
 * Updates an existing appointment with file uploads.
 * @param {string} id - The ID of the appointment to update.
 * @param {FormData} appointmentData - The FormData object from the form.
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await apiClient.put(`/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
};
