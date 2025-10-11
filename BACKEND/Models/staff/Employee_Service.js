import mongoose from "mongoose";

const Employee_ServiceSchema = new mongoose.Schema(
  {
    Employee_Name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String },
    designation: { type: String },
    phone: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    accountStatus: { type: String, enum: ["pending", "approved", "rejected", "inactive"], default: "pending" },
    role: {
      type: String,
      required: true,
      enum: ["ManagementEmployee", "staff"],
      default: "staff",
    },

    passwordHash: { type: String },
    Employee_Image: { type: String },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    availability: [
      {
        date: { type: Date },
        timeSlots: [{ type: String }],
      },
    ],
  },
  {
    collection: "Employee_Service",
    timestamps: true,
  }
);

export default mongoose.models.Employee_Service || mongoose.model("Employee_Service", Employee_ServiceSchema);
