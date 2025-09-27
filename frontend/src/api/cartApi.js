import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001/api",
});

const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'anon-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
};

const sessionId = getSessionId();

export const getCart = () => API.get(`/cart/${sessionId}`);

export const addItemToCart = (itemId, quantity = 1) => API.post(`/cart/${sessionId}/add`, { itemId, quantity });

export const updateCartItemQuantity = (itemId, quantity) => API.put(`/cart/${sessionId}/${itemId}`, { quantity });

export const removeCartItem = (itemId) => API.delete(`/cart/${sessionId}/${itemId}`);

export { getSessionId };