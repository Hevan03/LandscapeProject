// src/api/adminPaymentApi.js

import axios from "axios";

const API_INVENTORY = axios.create({ baseURL: "http://localhost:5001/api/item-payments" });
const API_SERVICE = axios.create({ baseURL: "http://localhost:5001/api/payment" }); // Assuming this is your service payments route

// Function to fetch all inventory payments
export const getAllInventoryPayments = () => API_INVENTORY.get("/");

// Function to fetch all service payments
export const getAllServicePayments = () => API_SERVICE.get("/");
