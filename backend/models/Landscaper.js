import mongoose from "mongoose";

const LandscaperSchema = new mongoose.Schema(
  {
    serviceNum: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    passwordHash: { type: String, required: true },
    Employee_Image: { type: String, required: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    availability: [
      {
        date: { type: Date, required: true },
        timeSlots: [{ type: String, required: true }],
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Landscaper", LandscaperSchema);





















// import mongoose from "mongoose";

// const LandscaperSchema = new mongoose.Schema(
//   {
//     serviceNum: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     email: { type: String },
//     phone: { type: String, required: true },
//     address: { type: String },
//     availability: { type: String, enum: ["Full-time", "Part-time"], default: "Full-time" },
//     passwordHash: { type: String, required: true },
//     status: { type: String, enum: ["active", "inactive"], default: "active" },

//     // ⭐ Optional landscaper-specific fields
//     specialization: { type: String }, // e.g., "Lawn Care", "Tree Trimming"
//     experienceYears: { type: Number, default: 0 },

//     rating: { type: Number, default: 0 },
//     ratingCount: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Landscaper", LandscaperSchema);
