import mongoose from "mongoose";

const hireRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    maintenanceWorker: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceWorker", required: true },
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    address: { type: String },
    description: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("HireRequest", hireRequestSchema);
