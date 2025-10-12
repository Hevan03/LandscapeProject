import Payment from "../../Models/payment/paymentModel.js";
import MaintenanceWorker from "../../Models/customer/MaintenanceModel.js";

// Customer creates a payment for maintenance (or record of payment)
export const createMaintenancePayment = async (req, res) => {
  try {
    const { id: payerId, role } = req.user || {};
    // Only customers or maintenance workers themselves can create payments here
    if (!["customer", "maintenance"].includes(role)) return res.status(403).json({ message: "Access denied" });

    const { maintenanceWorkerId, amount, method = "Cash", notes, orderId } = req.body;
    if (!maintenanceWorkerId || !amount) return res.status(400).json({ message: "maintenanceWorkerId and amount are required" });

    const worker = await MaintenanceWorker.findById(maintenanceWorkerId);
    if (!worker) return res.status(404).json({ message: "Maintenance worker not found" });

    const payment = new Payment({
      orderId: orderId || null,
      customerId: payerId,
      maintenanceWorker: maintenanceWorkerId,
      amount,
      method,
      notes,
      // Save as pending for admin verification
      status: "pending",
      transactionId: `MPAY-${Date.now()}`,
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Maintenance worker views payments received
export const getMyMaintenancePayments = async (req, res) => {
  try {
    const { id: workerId, role } = req.user || {};
    if (role !== "maintenance") return res.status(403).json({ message: "Access denied" });

    const payments = await Payment.find({ maintenanceWorker: workerId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
