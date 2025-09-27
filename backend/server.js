import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js"; 
import employeeRoutes from "./route/employeeServiceRoutes.js";
import notificationRoutes from "./route/notificationRoutes.js";
import authRoutes from "./route/auth.js";
import ratingRoutes from "./route/rating.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- DATABASE ----------------
connectDB();

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ES Modules way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (for CV uploads or profile images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- HEALTH CHECK ----------------
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
    endpoints: {
      employees: "/api/employees",
      notifications: "/api/notifications",
      auth: "/api/auth",
      rating: "/api/rating",
    },
  });
});

// ---------------- ROUTES ----------------
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rating", ratingRoutes);

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
