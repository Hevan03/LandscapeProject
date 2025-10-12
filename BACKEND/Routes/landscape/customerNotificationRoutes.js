import express from "express";
import {
  getCustomerNotifications,
  markCustomerNotificationAsRead,
  notifyCustomerAccident,
} from "../../Controllers/landscape/customerNotificationController.js";

const router = express.Router();

// Get notifications for a customer
router.get("/:customerId", getCustomerNotifications);

// Mark specific notification as read
router.put("/read/:id", markCustomerNotificationAsRead);

// Notify a customer about an accident using a deliveryId (assignment or order id)
router.post("/accident", notifyCustomerAccident);

export default router;
