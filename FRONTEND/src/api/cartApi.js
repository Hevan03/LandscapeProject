import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

export const getSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = "anon-" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

const sessionId = getSessionId();

export const getCart = (customerId) => API.get(`/cart/${customerId}`);

export const addItemToCart = (itemId, quantity = 1, customerId) => API.post(`/cart/${customerId}/add`, { itemId, quantity });

export const updateCartItemQuantity = (itemId, quantity, customerId) => API.put(`/cart/${customerId}/${itemId}`, { quantity });

export const removeCartItem = (itemId, customerId) => API.delete(`/cart/${customerId}/${itemId}`);
