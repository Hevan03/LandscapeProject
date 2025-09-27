const ItemPayment = require("../Models/itemPayModel");
const Order = require("../Models/orderModel");

// Try to import Notification model with error handling
let Notification;
try {
    Notification = require("../Models/notificationModel");
    console.log("Notification model imported successfully");
} catch (error) {
    console.error("Error importing Notification model:", error);
    Notification = null;
}

// Create a new item payment
const createItemPayment = async (req, res) => {
  try {
    const newPayment = new ItemPayment(req.body);
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Get all item payments
const getAllItemPayments = async (req, res) => {
  try {
    const payments = await ItemPayment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get an item payment by ID
const getItemPaymentById = async (req, res) => {
  try {
    const payment = await ItemPayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Item payment not found." });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Update an item payment
const updateItemPayment = async (req, res) => {
  try {
    const updatedPayment = await ItemPayment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPayment) {
      return res.status(404).json({ message: "Item payment not found." });
    }
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete an item payment
const deleteItemPayment = async (req, res) => {
  try {
    const deletedPayment = await ItemPayment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Item payment not found." });
    }
    res.status(200).json({ message: "Item payment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Add these new functions to your existing paymentController.js

// Create inventory payment (integration point)
const createInventoryPayment = async (req, res) => {
    try {
        const { orderId, customerId, amount, method, bankSlipUrl, notes } = req.body;
        
        console.log('Creating inventory payment:', { orderId, customerId, amount, method });
        
        // Create payment record using ItemPayment model
        const newPayment = new ItemPayment({
            orderId,
            customerId,
            amount,
            method,
            bankSlipUrl,
            notes
        });
        
        await newPayment.save();
        console.log('Payment saved successfully');
        
        // For test orders, skip order update and notification
        if (!orderId.startsWith('507f1f77bcf86cd799439011')) {
            // Update order status (only for real orders)
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'paid',
                status: 'Paid',
                paymentId: newPayment._id
            });
            
            // Create notification for admin (only if Notification model is available)
            if (Notification) {
                try {
                    await Notification.create({
                        type: 'payment_received',
                        orderId,
                        customerId,
                        message: `New inventory payment received for Order #${orderId.toString().slice(-6)} - Amount: LKR ${amount.toLocaleString()}`
                    });
                    console.log('Notification created successfully');
                } catch (notifError) {
                    console.error('Error creating notification:', notifError);
                }
            } else {
                console.log('Notification model not available, skipping notification creation');
            }
        } else {
            console.log('Test payment - skipping order update and notification');
        }
        
        res.status(201).json({ 
            message: "Inventory payment created successfully", 
            payment: newPayment 
        });
    } catch (error) {
        console.error('Error creating inventory payment:', error);
        res.status(400).json({ message: "Error creating inventory payment", error: error.message });
    }
};

// Get order details for payment (no populate to avoid missing Customer model in practice)
const getOrderForPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId || orderId.length !== 24) {
            return res.status(400).json({ message: "Invalid orderId" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        // Handle CastError and other errors uniformly
        console.error('Error fetching order for payment:', error);
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
    try {
        console.log("=== NOTIFICATIONS DEBUG ===");
        console.log("Notification model:", typeof Notification);
        console.log("Notification model available:", !!Notification);
        
        if (!Notification) {
            console.log("Notification model not available, returning empty array");
            return res.status(200).json([]);
        }
        
        // Try to connect to the notifications collection
        console.log("Attempting to fetch notifications from database...");
        const notifications = await Notification.find().sort({ createdAt: -1 });
        console.log(`Found ${notifications.length} notifications in database`);
        res.status(200).json(notifications);
        
    } catch (error) {
        console.error("Error fetching notifications:", error);
        console.log("Returning empty array due to error");
        res.status(200).json([]);
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

// Create test notification (for testing purposes)
const createTestNotification = async (req, res) => {
    try {
        if (!Notification) {
            return res.status(500).json({ message: "Notification model not available" });
        }
        
        console.log("Creating test notification...");
        const testNotification = new Notification({
            type: 'payment_received',
            orderId: 'test123',
            customerId: 'test456',
            message: 'Test notification - Payment received for Order #test123 - Amount: LKR 1,000'
        });
        
        await testNotification.save();
        console.log("Test notification saved successfully");
        res.status(201).json({ message: "Test notification created", notification: testNotification });
    } catch (error) {
        console.error("Error creating test notification:", error);
        res.status(500).json({ message: "Error creating test notification", error: error.message });
    }
};

// Test database connection
const testDatabaseConnection = async (req, res) => {
    try {
        console.log("Testing database connection...");
        console.log("Notification model available:", !!Notification);
        
        if (!Notification) {
            return res.status(500).json({ message: "Notification model not available" });
        }
        
        // Try to count documents in notifications collection
        const count = await Notification.countDocuments();
        console.log(`Notifications collection has ${count} documents`);
        
        res.status(200).json({ 
            message: "Database connection successful", 
            notificationCount: count,
            modelAvailable: true 
        });
    } catch (error) {
        console.error("Database connection test failed:", error);
        res.status(500).json({ 
            message: "Database connection failed", 
            error: error.message 
        });
    }
};

module.exports = {
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
  testDatabaseConnection
};