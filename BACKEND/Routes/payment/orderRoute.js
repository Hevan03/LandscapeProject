import express from "express";
const router = express.Router();
import {
  getPendingOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  assignDelivery,
  getOrdersByStatus,
  getOrdersByCustomerId,
  getOrderStats,
  cancelOrderAndRestock,
} from "../../Controllers/payment/orderController.js";

router.get("/all", getAllOrders);
router.get("/:customerId", getOrdersByCustomerId);
router.post("/create", createOrder);
router.get("/stats", getOrderStats);
router.get("/status/:status", getOrdersByStatus);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/assign", assignDelivery);
// Cancel & refund a shop order (restock items)
router.delete("/:orderId", cancelOrderAndRestock);

// Legacy route for compatibility
router.get("/delivery-reports/pending", getPendingOrders);

export default router;
