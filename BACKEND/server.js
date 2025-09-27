const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const paymentRoute = require("./Routes/paymentRoute");
const itemPayRoute = require("./Routes/itemPayRoute");
const driverRoute = require("./Routes/driverRoute");
const vehicleRoute = require("./Routes/vehicleRoute");
const deliveryAssignRoute = require("./Routes/deliveryAssignRoute");
const accidentReportRoute = require("./Routes/accidentReportRoute");
const deliveryReportRoute = require("./Routes/deliveryReportRoute");
const orderRoute = require("./Routes/orderRoute");

// Note: DLogin routes removed per new single-driver flow

// Use routes with clear prefixes
app.use("/main-payments", paymentRoute);
app.use("/item-payments", itemPayRoute);
app.use("/drivers", driverRoute);
app.use("/vehicles", vehicleRoute);
app.use("/delivery-assignments", deliveryAssignRoute);
app.use("/accident-reports", accidentReportRoute);
app.use("/delivery-reports", deliveryReportRoute);
app.use("/orders", orderRoute);

// Health check
app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({ status: 'ok', dbState: state });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:sQg43lbaRtqQBjea@cluster0.vvw6xvv.mongodb.net/mernProject";

// Start the server immediately
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB in the background
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Make sure your MONGODB_URI is correct and accessible.");
  });










  //mongodb+srv://admin:sQg43lbaRtqQBjea@cluster0.vvw6xvv.mongodb.net/