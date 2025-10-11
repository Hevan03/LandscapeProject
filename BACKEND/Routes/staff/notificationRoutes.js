import express from "express";
import { getUserNotifications, markNotificationAsRead, getNotifications } from "../../Controllers/staff/notificationController.js";

const router = express.Router();

// GET: Fetch notifications for employee dashboard
router.get("/:serviceNum", getUserNotifications);
router.get("/", getNotifications);

// PUT: Mark a notification as read
router.put("/read/:id", markNotificationAsRead);

export default router;
