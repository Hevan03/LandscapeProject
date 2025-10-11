import express from "express";
import {
  uploadCV,
  Create_Employee_Service,
  // registerEmployee,
  getAllOpenUsersGrouped,
  getAllApprovedUsersGrouped,
  approveEmployee,
  getEmployeeById,
  rejectEmployee,
  deleteEmployee,
  getAllUsersGrouped,
  getUsersGroupedByRole,
} from "../../Controllers/staff/employeeServiceController.js";
const router = express.Router();

router.post("/employee", uploadCV.single("cv"), Create_Employee_Service);
router.get("/all", getAllUsersGrouped);
router.get("/employeeList", getAllOpenUsersGrouped);
router.get("/approved", getAllApprovedUsersGrouped);
router.put("/approve/:id", approveEmployee);
router.post("/reject/:id", rejectEmployee);
router.get("/:id", getEmployeeById);

export default router;
