import MaintenanceWorker from "../../Models/customer/MaintenanceModel.js";
import HireRequest from "../../Models/customer/HireRequestModel.js";
import Customer from "../../Models/customer/customerModel.js";
import Notification from "../../Models/landscape/notificationModel.js";

// Create a new maintenance worker
export const createWorker = async (req, res) => {
  try {
    const worker = new MaintenanceWorker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all maintenance workers
export const getAllWorkers = async (req, res) => {
  try {
    const workers = await MaintenanceWorker.find();
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single worker by ID
export const getWorkerById = async (req, res) => {
  try {
    const worker = await MaintenanceWorker.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a worker
export const updateWorker = async (req, res) => {
  try {
    const worker = await MaintenanceWorker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a worker
export const deleteWorker = async (req, res) => {
  try {
    const worker = await MaintenanceWorker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json({ message: "Worker deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get logged-in maintenance worker profile
export const getMyProfile = async (req, res) => {
  try {
    const { id, serviceNum, role, raw } = extractUserInfo(req);
    console.log("[getMyProfile] token payload:", raw);
    console.log(id, role);
    console.log("[getMyProfile] req.user:", req.user);
    console.log("[getMyProfile] findById result:", !!(await MaintenanceWorker.findById(id)));
    if (role !== "maintenance") return res.status(403).json({ message: "Access denied" });
    let worker = null;
    if (id) {
      worker = await MaintenanceWorker.findById(id).select("-passwordHash");
      console.log("[getMyProfile] findById result:", !!worker);
    }

    // Fallback: try to find by serviceNum if present in token and id lookup failed
    if (!worker && req.user.serviceNum) {
      worker = await MaintenanceWorker.findOne({ serviceNum: req.user.serviceNum }).select("-passwordHash");
    }

    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const extractUserInfo = (req) => {
  const raw = req.user || {};
  const id = raw.id ?? raw._id ?? raw.userId ?? raw.sub ?? undefined;
  const serviceNum = raw.serviceNum ?? raw.service_number ?? undefined;
  const role = raw.role ?? undefined;
  return { id, serviceNum, role, raw };
};
// Update logged-in maintenance worker profile
export const updateMyProfile = async (req, res) => {
  try {
    const { id, role } = extractUserInfo(req);
    if (role !== "maintenance") return res.status(403).json({ message: "Access denied" });
    const update = req.body;
    // prevent changing protected fields
    delete update._id;
    delete update.passwordHash;

    const worker = await MaintenanceWorker.findByIdAndUpdate(id, update, { new: true });
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update availability (replace availableTimes)
export const updateAvailability = async (req, res) => {
  try {
    const { id, role } = extractUserInfo(req);
    if (role !== "maintenance") return res.status(403).json({ message: "Access denied" });
    const { availableTimes } = req.body;
    if (!availableTimes) return res.status(400).json({ message: "availableTimes required" });
    const worker = await MaintenanceWorker.findByIdAndUpdate(id, { availableTimes }, { new: true });
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Customer creates a hire request for a maintenance worker
export const createHireRequest = async (req, res) => {
  try {
    const { id: customerId, role } = extractUserInfo(req);
    // only customers may create hire requests
    if (role !== "customer") return res.status(403).json({ message: "Only customers can create hire requests" });

    const { maintenanceWorkerId, scheduledDate, scheduledTime, address, description, priority } = req.body;
    if (!maintenanceWorkerId) return res.status(400).json({ message: "maintenanceWorkerId is required" });

    const worker = await MaintenanceWorker.findById(maintenanceWorkerId);
    if (!worker) return res.status(404).json({ message: "Maintenance worker not found" });

    const hire = new HireRequest({
      customer: customerId,
      maintenanceWorker: maintenanceWorkerId,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledTime || "",
      address: address || "",
      description: description || "",
      priority: priority || "medium",
    });

    await hire.save();
    res.status(201).json(hire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get hire requests for logged-in maintenance worker
export const getMyHires = async (req, res) => {
  try {
    const { id, role } = extractUserInfo(req);
    if (role !== "maintenance") return res.status(403).json({ message: "Access denied" });
    const hires = await HireRequest.find({ maintenanceWorker: id })
      .populate("customer", "name email phone registrationNumber")
      .sort({ createdAt: -1 });
    res.json(hires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Maintenance worker accepts or rejects a hire request
export const respondToHireRequest = async (req, res) => {
  try {
    const { id: workerId, role } = extractUserInfo(req);
    if (role !== "maintenance") return res.status(403).json({ message: "Access denied" });
    const { hireId } = req.params;
    const { action } = req.body; // 'accept' or 'reject' or 'cancel'
    if (!["accept", "reject", "cancel"].includes(action)) return res.status(400).json({ message: "Invalid action" });

    const hire = await HireRequest.findById(hireId);
    if (!hire) return res.status(404).json({ message: "Hire request not found" });
    if (hire.maintenanceWorker.toString() !== workerId) return res.status(403).json({ message: "Not your hire request" });

    hire.status = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "cancelled";
    await hire.save();
    res.json(hire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ADMIN: Get all hire requests
export const getAllHires = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") return res.status(403).json({ message: "Access denied" });

    const hires = await HireRequest.find()
      .populate("customer", "name email phone")
      .populate("maintenanceWorker", "name email phone specialization")
      .sort({ createdAt: -1 });
    res.json(hires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADMIN: Approve or reject a hire request and notify customer
export const respondToHireAdmin = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") return res.status(403).json({ message: "Access denied" });
    const { hireId } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    if (!["approve", "reject"].includes(action)) return res.status(400).json({ message: "Invalid action" });

    const hire = await HireRequest.findById(hireId);
    if (!hire) return res.status(404).json({ message: "Hire request not found" });

    hire.status = action === "approve" ? "accepted" : "rejected";
    await hire.save();

    // Notify customer about decision
    try {
      await Notification.create({
        type: "order_created", // reuse existing enum
        audience: "customer",
        orderId: hireId?.toString(),
        customerId: hire.customer?.toString?.() || String(hire.customer),
        message:
          action === "approve"
            ? "Your maintenance hire request has been approved. Please proceed to payment."
            : "Your maintenance hire request was rejected. Please contact support or try another worker.",
      });
    } catch (e) {
      console.warn("Failed to create maintenance hire notification:", e.message);
    }

    res.json(hire);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// CUSTOMER: Get my hire requests
export const getMyCustomerHires = async (req, res) => {
  try {
    const { id, role } = req.user || {};
    if (role !== "customer") return res.status(403).json({ message: "Access denied" });
    const hires = await HireRequest.find({ customer: id }).populate("maintenanceWorker", "name email phone specialization").sort({ createdAt: -1 });
    res.json(hires);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
