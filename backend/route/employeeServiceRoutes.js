

import express from "express";
import { uploadCV, Create_Employee_Service, getOpenEmployees, getAllEmployees, approveEmployee, rejectEmployee, deleteEmployee , getUsersGroupedByRole   } from "../controllers/employeeServiceController.js";

const router = express.Router();

// GET: Retrieve all employees (for landscaper page)
router.get("/", getAllEmployees);

// POST: Create employee with CV upload
router.post("/", uploadCV.single("cv"), Create_Employee_Service);

// GET: Retrieve all employees with Employee_Status = "Open"
router.get("/RegisterEmployeeList", getOpenEmployees);

// PUT: Approve employee by Service_Num
router.put("/approve/:serviceNum", approveEmployee);


// POST: Reject employee application with WhatsApp notification
router.post("/reject/:serviceNum", rejectEmployee);

// ⭐ New route for grouped users (fetch all drivers, landscape and employee by grouping by role)
router.get("/users/grouped", getUsersGroupedByRole);

export default router;

