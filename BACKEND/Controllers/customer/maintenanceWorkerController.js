import MaintenanceWorker from "../../Models/customer/MaintenanceModel.js";

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
