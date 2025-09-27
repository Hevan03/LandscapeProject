import express from "express";
import { getUserNotifications, markNotificationAsRead } from "../controllers/notificationController.js";

const router = express.Router();

// GET: Fetch notifications for employee dashboard
router.get("/:serviceNum", getUserNotifications);

// PUT: Mark a notification as read
router.put("/read/:id", markNotificationAsRead);

export default router;
