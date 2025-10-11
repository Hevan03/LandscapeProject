import express from "express";
import {
  createItemPayment,
  getAllItemPayments,
  getItemPaymentById,
  updateItemPayment,
  deleteItemPayment,
  createInventoryPayment,
  getOrderForPayment,
  getAllNotifications,
  markNotificationAsRead,
  createTestNotification,
  testDatabaseConnection,
} from "../../Controllers/payment/itemPayController.js";

const router = express.Router();

router.post("/", createItemPayment);
router.get("/", getAllItemPayments);

// Specific routes must come before parameterized routes
router.post("/inventory-payment", createInventoryPayment);
router.get("/order/:orderId", getOrderForPayment);
router.get("/notifications", getAllNotifications);
router.put("/notifications/:notificationId/read", markNotificationAsRead);
router.post("/test-notification", createTestNotification);
router.get("/test-db", testDatabaseConnection);

// Parameterized routes must come last
router.get("/:id", getItemPaymentById);
router.put("/:id", updateItemPayment);
router.delete("/:id", deleteItemPayment);

export default router;
