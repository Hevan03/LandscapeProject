import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., "monday"
  from: { type: String, required: true }, // "09:00"
  to: { type: String, required: true }, // "17:00"
  available: { type: Boolean, default: true },
});

const maintenanceWorkerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    specialization: { type: String, default: "Lawn Maintenance" },
    skills: { type: [String], default: [] },
    passwordHash: { type: String, required: false },
    availableTimes: { type: [availabilitySchema], default: [] },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    landscaperRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Landscaper",
      required: false,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    accountStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    Employee_Image: { type: String },
  },
  { timestamps: true }
);

const MaintenanceWorker = mongoose.model("MaintenanceWorker", maintenanceWorkerSchema);

export default MaintenanceWorker;
