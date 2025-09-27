import mongoose from "mongoose";

// Sub-schema for items within an order
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

// Main Order Schema
const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Customer' // Reference the Customer model
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
        default: 'Pending', 
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;