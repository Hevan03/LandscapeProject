import express from "express";
import { getCart, addToCart, updateCartItemQuantity, deleteCartItem } from "../Controllers/cartController.js";

const router = express.Router();

// Get the cart for a specific session ID
router.get("/:sessionId", getCart);

// Add an item to the cart or update its quantity
router.post("/:sessionId/add", addToCart);

// Update the quantity of an item already in the cart
router.put("/:sessionId/:itemId", updateCartItemQuantity);

// Remove an item from the cart
router.delete("/:sessionId/:itemId", deleteCartItem);

export default router;