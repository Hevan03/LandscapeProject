const Payment = require("../Models/paymentModel");
const Order = require("../Models/orderModel");
const Notification = require("../Models/notificationModel");

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get a payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Update a payment
const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete a payment
const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.status(200).json({ message: "Payment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};


// Create inventory payment (integration point)
const createInventoryPayment = async (req, res) => {
  try {
    const { orderId, customerId, amount, method, bankSlipUrl, notes } = req.body;
    
    // Create payment record
    const newPayment = new Payment({
      orderId,
      customerId,
      amount,
      method,
      bankSlipUrl,
      notes
    });
    
    await newPayment.save();
    
    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      status: 'Paid',
      paymentId: newPayment._id
    });
    
    // Create notification for admin
    await Notification.create({
      type: 'payment_received',
      orderId,
      customerId,
      message: `New payment received for Order #${orderId.toString().slice(-6)} - Amount: LKR ${amount.toLocaleString()}`
    });
    
    res.status(201).json({ 
      message: "Payment created successfully", 
      payment: newPayment 
    });
  } catch (error) {
    res.status(400).json({ message: "Error creating payment", error: error.message });
  }
};

// Get order details for payment
const getOrderForPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('customerId', 'name');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId, 
      { isRead: true }, 
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createInventoryPayment,
  getOrderForPayment,
  getAllNotifications,
  markNotificationAsRead
};