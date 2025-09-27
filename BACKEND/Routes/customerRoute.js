import express from "express";
import { getAllCustomers, createCustomer, getCustomerById } from "../Controllers/customerController.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.post("/", createCustomer);
router.get("/:id", getCustomerById);


export default router;
