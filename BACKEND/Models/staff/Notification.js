import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    Service_Num: { type: Number, required: true }, // link to employee
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  {
    collection: "Notifications",
  }
);

// Prevent OverwriteModelError
const Notification =
  mongoose.models.Notification || model("Notification", NotificationSchema);
export default Notification;
