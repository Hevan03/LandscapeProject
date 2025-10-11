import express from "express";
import {
  createAccidentReport,
  getAllAccidentReports,
  getAccidentReportById,
  updateAccidentReport,
  updateAccidentReportStatus,
  deleteAccidentReport,
} from "../../Controllers/delivery/accidentReportController.js";

const router = express.Router();

router.post("/", createAccidentReport);
router.get("/", getAllAccidentReports);
router.get("/:id", getAccidentReportById);
router.put("/:id", updateAccidentReport);
router.patch("/:id/status", updateAccidentReportStatus);
router.delete("/:id", deleteAccidentReport);

export default router;
