import mongoose from "mongoose";

const driverSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Assuming email is unique
  phone: {
    type: String,
    required: true,
    match: [/^\+?\d{9,15}$/, "Phone number must be 9 to 15 digits and may start with +"],
  },
  licenseNo: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  driveravailability: {
    type: String,
    enum: ["Available", "Assigned", "On Leave"],
    default: "Available",
  },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  history: [
    {
      deliveryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryAssignment",
      },
      status: { type: String }, // e.g., Completed, Cancelled
      date: { type: Date },
    },
  ],
  availability: [
    {
      date: { type: Date, required: true },
      timeSlots: [{ type: String, required: true }], // e.g., ["09:00-12:00", "13:00-17:00"]
    },
  ],
  createdAt: { type: Date, default: Date.now },
  accountStatus: { type: String, enum: ["pending", "approved", "rejected", "inactive"], default: "pending" },
});

export default mongoose.model("Driver", driverSchema);
