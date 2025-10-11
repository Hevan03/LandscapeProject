import Notification from "../../Models/staff/Notification.js";

// Fetch notifications for an employee dashboard
export const getUserNotifications = async (req, res) => {
  try {
    const { serviceNum } = req.params; // Employee's Service_Num

    const notifications = await Notification.find({
      Service_Num: Number(serviceNum),
    }).sort({ createdAt: -1 }); // latest first

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// Mark notification as read (optional)
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error });
  }
};
