import Notification from "../../Models/landscape/notificationModel.js";
import DeliveryAssignment from "../../Models/delivery/deliveryAssignModel.js";
import Order from "../../Models/payment/orderModel.js";

// Get notifications for a specific customer
export const getCustomerNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;
    const notifications = await Notification.find({ customerId, audience: "customer" }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer notifications", error: error.message });
  }
};

// Mark a notification as read
export const markCustomerNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

// Create a customer notification for an accident by deliveryId
export const notifyCustomerAccident = async (req, res) => {
  try {
    const { deliveryId, message } = req.body;
    if (!deliveryId) return res.status(400).json({ message: "deliveryId is required" });

    // Try to resolve order and customer from a delivery assignment first
    let order = null;
    const assignment = await DeliveryAssignment.findById(deliveryId);
    if (assignment?.orderId) {
      order = await Order.findById(assignment.orderId);
    }
    // Fallback: treat deliveryId as orderId directly
    if (!order) {
      order = await Order.findById(deliveryId);
    }

    if (!order?.customerId) {
      return res.status(404).json({ message: "Related order/customer not found for this deliveryId" });
    }

    const note = await Notification.create({
      type: "accident_reported",
      orderId: order._id.toString(),
      customerId: order.customerId.toString(),
      message: message || "There was an incident affecting your delivery. Our team is handling it.",
    });

    res.status(201).json({ message: "Customer notified successfully", notification: note });
  } catch (error) {
    res.status(500).json({ message: "Error notifying customer", error: error.message });
  }
};
