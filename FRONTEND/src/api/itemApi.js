// src/api/itemApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api", // your backend
});

// get all items
export const getAllItems = () => API.get("/items");

// get item by id
export const getItemById = (id) => API.get(`/items/${id}`);

// create item
export const createItem = (formData) =>
  API.post("/items", formData, {
    headers: { "Content-Type": "multipart/form-data" }, // because you upload images
  });

// update item
export const updateItem = (id, formData) =>
  API.put(`/items/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// delete item
export const deleteItem = (id) => API.delete(`/items/${id}`);
