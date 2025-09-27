// routes/rentalOrderRoute.js
import express from "express";
import { createRentalOrder, getAllRentalOrders, deleteRentalOrder, updateRentalOrderStatus  } from "../Controllers/rentalOrderController.js";

const router = express.Router();

router.post("/rental-orders", createRentalOrder);
router.get("/rental-orders", getAllRentalOrders);
router.delete("/rental-orders/:orderId", deleteRentalOrder);
router.put("/rental-orders/:orderId/status", updateRentalOrderStatus);

export default router;
