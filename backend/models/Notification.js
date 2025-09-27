import { Schema, model } from "mongoose";

const NotificationSchema = new Schema({
  Service_Num: { type: Number, required: true },   // link to employee
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, {
  collection: "Notifications"
});

const Notification = model("Notification", NotificationSchema);
export default Notification;
