import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    serviceNum: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    Employee_Image: { type: String, required: false },
    role: { type: String, enum: ["employee", "driver", "landscaper", "management"], default: "employee" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Ratings
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Availability (multiple dates + slots)
    availability: [
      {
        date: { type: Date, required: true },
        timeSlots: [{ type: String, required: true }], // e.g., ["09:00-12:00", "13:00-17:00"]
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);





























// // models/User.js
// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema(
//   {
//     serviceNum: { type: String, required: true, unique: true },
//     username: { type: String, required: true, unique: true },
//     phone: { type: String, required: true },
//     passwordHash: { type: String, required: true },
//     role: { type: String, enum: ["employee", "driver", "landscaper", "admin"], default: "employee" },
//     status: { type: String, enum: ["active", "inactive"], default: "active" },

//     // ⭐ New fields
//     rating: { type: Number, default: 0 },       // average rating
//     ratingCount: { type: Number, default: 0 },  // number of ratings
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", UserSchema);
