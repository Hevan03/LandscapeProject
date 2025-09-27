const express = require("express");
const { 
  getPendingOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  assignDelivery,
  getOrdersByStatus,
  getOrderStats
} = require("../Controllers/orderController");
const router = express.Router();

// Order management routes
router.get("/", getAllOrders);
router.post("/", createOrder);
router.get("/stats", getOrderStats);
router.get("/status/:status", getOrdersByStatus);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/assign", assignDelivery);

// Legacy route for compatibility
router.get("/delivery-reports/pending", getPendingOrders);

module.exports = router;