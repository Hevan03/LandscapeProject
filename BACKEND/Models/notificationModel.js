const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ["payment_received", "delivery_assigned", "order_created", "accident_reported"], 
        required: true 
    },
    orderId: { type: String, required: false },
    customerId: { type: String, required: false },
    accidentReportId: { type: String, required: false },
    driverId: { type: String, required: false },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);