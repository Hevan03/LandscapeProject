const AccidentReport = require("../Models/accidentReportModel");
let Notification; // Declared with let for conditional import

// Try to import Notification model
try {
  Notification = require("../Models/notificationModel");
  console.log("Notification model imported successfully in accidentReportController");
} catch (error) {
  console.error("Error importing Notification model:", error);
  Notification = null;
}

// Get all accident reports
const getAllAccidentReports = async (req, res) => {
  try {
    // driverId and vehicleNo are strings in the schema; do not populate
    const reports = await AccidentReport.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching accident reports:', error);
    res.status(500).json({ message: "Error fetching accident reports", error: error.message });
  }
};

// Get an accident report by ID
const getAccidentReportById = async (req, res) => {
  try {
    const report = await AccidentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Accident report not found." });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Create a new accident report
const createAccidentReport = async (req, res) => {
  try {
    console.log('Creating accident report:', req.body);
    
    const newReport = new AccidentReport(req.body);
    await newReport.save();
    
    console.log('Accident report saved successfully:', newReport._id);
    
    // Create notification for admin
    if (Notification) {
      try {
        await Notification.create({
          type: 'accident_reported',
          accidentReportId: newReport._id.toString(),
          driverId: newReport.driverId.toString(),
          message: `New accident report submitted by Driver ${newReport.driverId} - Vehicle: ${newReport.vehicleNo || 'N/A'}`
        });
        console.log('Accident notification created successfully');
      } catch (notifError) {
        console.error('Error creating accident notification:', notifError);
        // Don't fail the request if notification creation fails
      }
    } else {
      console.log('Notification model not available, skipping notification creation');
    }
    
    res.status(201).json({
      message: "Accident report created successfully",
      report: newReport
    });
  } catch (error) {
    console.error('Error creating accident report:', error);
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Update an accident report
const updateAccidentReport = async (req, res) => {
  try {
    const updatedReport = await AccidentReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedReport) {
      return res.status(404).json({ message: "Accident report not found." });
    }
    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Update accident report status (for admin to mark as "took action")
const updateAccidentReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Reported", "Under Investigation", "Resolved"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: " + validStatuses.join(", ") });
    }

    const updatedReport = await AccidentReport.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedReport) {
      return res.status(404).json({ message: "Accident report not found." });
    }
    
    res.status(200).json({
      message: "Accident report status updated successfully",
      report: updatedReport
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete an accident report
const deleteAccidentReport = async (req, res) => {
  try {
    const deletedReport = await AccidentReport.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: "Accident report not found." });
    }
    res.status(200).json({ message: "Accident report deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};



module.exports = {
  getAllAccidentReports,
  getAccidentReportById,
  createAccidentReport,
  updateAccidentReport,
  updateAccidentReportStatus,
  deleteAccidentReport
};