import express from "express";
import { createOrder, getCustomerOrders, deleteOrder, getAllOrders, updateOrderStatus  } from "../Controllers/orderController.js";

const router = express.Router();

// Create a new order from a cart
router.post("/create", createOrder);

// Get all shop orders (for inventory manager)
router.get("/all", getAllOrders);

// Get all orders for a specific customer
router.get("/:customerId", getCustomerOrders);

// Delete an order by its ID
router.delete("/:orderId", deleteOrder);

// Update order status
router.put("/:orderId/status", updateOrderStatus);

export default router;