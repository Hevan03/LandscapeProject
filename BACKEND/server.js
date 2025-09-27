import express from "express";
import itemRoute from "./Routes/itemRoute.js";
import cartRoute from "./Routes/cartRoute.js";
import machineryRoute from "./Routes/machineryRoute.js";
import orderRoute from "./Routes/orderRoute.js";
import customerRoute from "./Routes/customerRoute.js";
import rentalOrderRoutes from "./Routes/rentalOrderRoute.js";
import landscaperRequestRoutes from "./Routes/landscaperRequestRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import cors from 'cors'; // Import the cors package

dotenv.config();

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Use CORS middleware before defining routes
app.use(cors());

// middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(_dirname, "uploads")));


app.use("/api/items", itemRoute);
app.use("/api/cart", cartRoute);
app.use("/api/machinery", machineryRoute);
app.use("/api/orders", orderRoute);
app.use("/api/customers", customerRoute);
app.use("/api", rentalOrderRoutes);
app.use("/api/landscaper-requests", landscaperRequestRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
  });
});