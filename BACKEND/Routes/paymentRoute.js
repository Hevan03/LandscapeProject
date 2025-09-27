const express = require("express");
const { 
  createPayment, 
  getAllPayments, 
  getPaymentById, 
  updatePayment, 
  deletePayment,
  createInventoryPayment,
  getOrderForPayment,
  getAllNotifications,
  markNotificationAsRead
} = require("../Controllers/paymentController");

const router = express.Router();

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

// New inventory payment routes
router.post("/inventory-payment", createInventoryPayment);
router.get("/order/:orderId", getOrderForPayment);
router.get("/notifications", getAllNotifications);
router.put("/notifications/:notificationId/read", markNotificationAsRead);

module.exports = router;