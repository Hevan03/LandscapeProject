import ItemPayment from "../../Models/payment/itemPayModel.js";
import Order from "../../Models/payment/orderModel.js";

let Notification;
try {
  const module = await import("../../Models/landscape/notificationModel.js");
  Notification = module.default;
  console.log("Notification model imported successfully");
} catch (error) {
  console.error("Error importing Notification model:", error);
  Notification = null;
}

// Create a new item payment
export const createItemPayment = async (req, res) => {
  try {
    const newPayment = new ItemPayment(req.body);
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid data provided.", error: error.message });
  }
};

// Get all item payments
export const getAllItemPayments = async (req, res) => {
  try {
    const payments = await ItemPayment.find();
    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

// Get an item payment by ID
export const getItemPaymentById = async (req, res) => {
  try {
    const payment = await ItemPayment.findById(req.params.id);
    if (!payment)
      return res.status(404).json({ message: "Item payment not found." });
    res.status(200).json(payment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

// Update an item payment
export const updateItemPayment = async (req, res) => {
  try {
    const updatedPayment = await ItemPayment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPayment)
      return res.status(404).json({ message: "Item payment not found." });
    res.status(200).json(updatedPayment);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete an item payment
export const deleteItemPayment = async (req, res) => {
  try {
    const deletedPayment = await ItemPayment.findByIdAndDelete(req.params.id);
    if (!deletedPayment)
      return res.status(404).json({ message: "Item payment not found." });
    res.status(200).json({ message: "Item payment deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

// Create inventory payment
export const createInventoryPayment = async (req, res) => {
  try {
    const { orderId, customerId, amount, method, bankSlipUrl, notes } =
      req.body;

    const newPayment = new ItemPayment({
      orderId,
      customerId,
      amount,
      method,
      bankSlipUrl,
      notes,
    });

    await newPayment.save();

    if (!orderId.startsWith("507f1f77bcf86cd799439011")) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        status: "Paid",
        paymentId: newPayment._id,
      });

      if (Notification) {
        try {
          await Notification.create({
            type: "payment_received",
            orderId,
            customerId,
            message: `New inventory payment received for Order #${orderId
              .toString()
              .slice(-6)} - Amount: LKR ${amount.toLocaleString()}`,
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    }

    res.status(201).json({
      message: "Inventory payment created successfully",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Error creating inventory payment:", error);
    res.status(400).json({
      message: "Error creating inventory payment",
      error: error.message,
    });
  }
};

// Get order details for payment
export const getOrderForPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || orderId.length !== 24) {
      return res.status(400).json({ message: "Invalid orderId" });
    }
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    if (!Notification) return res.status(200).json([]);
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(200).json([]);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating notification", error: error.message });
  }
};

// Create test notification
export const createTestNotification = async (req, res) => {
  try {
    if (!Notification)
      return res
        .status(500)
        .json({ message: "Notification model not available" });
    const testNotification = new Notification({
      type: "payment_received",
      orderId: "test123",
      customerId: "test456",
      message:
        "Test notification - Payment received for Order #test123 - Amount: LKR 1,000",
    });
    await testNotification.save();
    res.status(201).json({
      message: "Test notification created",
      notification: testNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating test notification",
      error: error.message,
    });
  }
};

// Test database connection
export const testDatabaseConnection = async (req, res) => {
  try {
    if (!Notification)
      return res
        .status(500)
        .json({ message: "Notification model not available" });
    const count = await Notification.countDocuments();
    res.status(200).json({
      message: "Database connection successful",
      notificationCount: count,
      modelAvailable: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Database connection failed", error: error.message });
  }
};
