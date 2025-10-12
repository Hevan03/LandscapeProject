import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "payment_received",
      "payment_pending_verification",
      "payment_approved",
      "payment_rejected",
      "delivery_assigned",
      "order_created",
      "accident_reported",
    ],
    required: true,
  },
  // Audience determines who should see this notification
  audience: {
    type: String,
    enum: ["admin", "customer"],
    default: "admin",
  },
  orderId: { type: String, required: false },
  customerId: { type: String, required: false },
  accidentReportId: { type: String, required: false },
  driverId: { type: String, required: false },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
