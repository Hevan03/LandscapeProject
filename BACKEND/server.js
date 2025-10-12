import express from "express";
import cookieParser from "cookie-parser";

//Landscape Management System Routes
import landscapeRoute from "./Routes/landscape/landscapeRoute.js";
import progressRoute from "./Routes/landscape/progressRoute.js";
import customerRoute from "./Routes/customer/customerRoute.js";
import maintenanceWorkerRoute from "./Routes/customer/maintenanceWorkerRoute.js";
import landscaperRoute from "./Routes/landscape/landscaperRoute.js";
import appointmentRoute from "./Routes/landscape/appointmentRoute.js";

//Inventory Management System Routes
import itemRoute from "./Routes/inventory/itemRoute.js";
import cartRoute from "./Routes/payment/cartRoute.js";
import machineryRoute from "./Routes/inventory/machineryRoute.js";
import orderRoute from "./Routes/payment/orderRoute.js";
import rentalOrderRoutes from "./Routes/inventory/rentalOrderRoute.js";
import landscaperRequestRoutes from "./Routes/landscape/landscaperRequestRoutes.js";

//Payment and Delivery System Routes
import paymentRoute from "./Routes/payment/paymentRoute.js";
import itemPayRoute from "./Routes/payment/itemPayRoute.js";
import driverRoute from "./Routes/delivery/driverRoute.js";
import vehicleRoute from "./Routes/delivery/vehicleRoute.js";
import deliveryAssignRoute from "./Routes/delivery/deliveryAssignRoute.js";
import accidentReportRoute from "./Routes/delivery/accidentReportRoute.js";
import deliveryReportRoute from "./Routes/delivery/deliveryReportRoute.js";
import customerNotificationRoutes from "./Routes/landscape/customerNotificationRoutes.js";

//Staff System Routes
import employeeRoutes from "./Routes/staff/employeeServiceRoutes.js";
import notificationRoutes from "./Routes/staff/notificationRoutes.js";
import authRoutes from "./Routes/staff/auth.js";
import ratingRoutes from "./Routes/staff/rating.js";

import connectDB from "./Config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);
dotenv.config({ path: path.join(_dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(_dirname, "uploads")));

//Landscape Management System API
app.use("/api/landscape", landscapeRoute);
app.use("/api/progress", progressRoute);

//Inventory Management System API

app.use("/api", rentalOrderRoutes);
app.use("/api/landscaper-requests", landscaperRequestRoutes);
app.use("/orders", orderRoute);

//Payment and Delivery System API

//Fine Tune routers

//Staff Routes
app.use("/api/staff", employeeRoutes); // Staff Registration
app.use("/api/auth", authRoutes); // All Login Function router
app.use("/api/rating", ratingRoutes);

// Debug route (protected) - returns decoded token payload for debugging
import { authMiddleware } from "./middleware/auth.js";
const debugRouter = express.Router();
debugRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
app.use("/api/debug", debugRouter);

//Customer router
app.use("/api/customers", customerRoute);
app.use("/api/maintenance", maintenanceWorkerRoute);

//Delivery Routers
app.use("/api/notifications", notificationRoutes);
app.use("/api/customer/notifications", customerNotificationRoutes);
app.use("/api/vehicles", vehicleRoute);
app.use("/api/delivery/driver", driverRoute);
app.use("/api/delivery/assignments", deliveryAssignRoute);
app.use("/api/delivery-reports", deliveryReportRoute);
app.use("/api/delivery/accident-reports", accidentReportRoute);

//Payment
app.use("/api/payment", paymentRoute);
app.use("/api/item-payments", itemPayRoute);
app.use("/api/cart", cartRoute);

//Inventory
app.use("/api/machinery", machineryRoute);
app.use("/api/orders", orderRoute);
app.use("/api/items", itemRoute);

//Landscaper router
app.use("/api/landscaper", landscaperRoute);
app.use("/api/appointments", appointmentRoute);

app.listen(PORT, () => {
  console.log("Server started on port: ", PORT);
});
