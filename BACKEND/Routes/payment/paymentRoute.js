import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createInventoryPayment,
  getOrderForPayment,
  getAllNotifications,
  markNotificationAsRead,
  createPaymentIntent,
  confirmPayment,
  processBankSlip,
} from "../../Controllers/payment/paymentController.js";
import { authMiddleware } from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";

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

//Stripe payment intent
router.post("/create-payment-intent", authMiddleware, createPaymentIntent);
router.post("/confirm-payment", authMiddleware, confirmPayment);

// Bank slip upload route
router.post("/bank-slip", authMiddleware, upload.single("bankSlip"), processBankSlip);

export default router;
