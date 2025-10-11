import express from "express";
import {
  getAllCustomers,
  createCustomer,
  registerCustomer,
  getCustomerById,
  deleteCustomer,
  getCustomerStats,
  updateCustomer,
} from "../../Controllers/customer/customerController.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.post("/", createCustomer);
router.get("/:id", getCustomerById);
router.delete("/:id", deleteCustomer);
router.post("/register", registerCustomer);
router.get("/stats/overview", getCustomerStats);
router.put("/:id", updateCustomer);

export default router;
