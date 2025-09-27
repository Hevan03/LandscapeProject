const express = require("express");
const { 
  createAccidentReport, 
  getAllAccidentReports, 
  getAccidentReportById, 
  updateAccidentReport, 
  updateAccidentReportStatus,
  deleteAccidentReport 
} = require("../Controllers/accidentReportController");

const router = express.Router();

router.post("/", createAccidentReport);
router.get("/", getAllAccidentReports);
router.get("/:id", getAccidentReportById);
router.put("/:id", updateAccidentReport);
router.patch("/:id/status", updateAccidentReportStatus);
router.delete("/:id", deleteAccidentReport);

module.exports = router;