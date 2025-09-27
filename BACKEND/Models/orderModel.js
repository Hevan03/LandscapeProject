// Replace your current orderModel.js with this:
const mongoose = require("mongoose");

// Sub-schema for items within an order (matching their structure)
const orderItemSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item'
    },
    itemName: {
        type: String,
        required: true,
    },
    pricePerItem: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
    },
});

// Main Order Schema (enhanced with payment fields)
const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Customer'
    },
    items: {
        type: [orderItemSchema],
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Paid", "Assigned", "In Transit", "Delivered"],
        default: "Pending"
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "pending_verification"],
        default: "unpaid"
    },
    paymentId: {
        type: String,
        ref: "Payment"
    },
    // Delivery assignment fields
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    deliveryAssignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryAssignment',
        default: null
    },
    deliveryAssignedDate: {
        type: Date,
        default: null
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);