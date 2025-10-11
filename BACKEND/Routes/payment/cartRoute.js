import express from "express";
import { getCart, addToCart, updateCartItemQuantity, deleteCartItem } from "../../Controllers/payment/cartController.js";

const router = express.Router();

// Get the cart for a specific session ID

// Get the cart for a specific customer ID
router.get("/:customerId", getCart);

// Add an item to the cart or update its quantity
router.post("/:customerId/add", addToCart);

// Update the quantity of an item already in the cart
router.put("/:customerId/:itemId", updateCartItemQuantity);

// Remove an item from the cart
router.delete("/:customerId/:itemId", deleteCartItem);

export default router;
