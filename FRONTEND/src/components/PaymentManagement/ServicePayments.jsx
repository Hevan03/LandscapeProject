import React, { useState, useEffect } from "react";
import { BsCashStack, BsDownload, BsInfoCircle, BsCalculator } from "react-icons/bs";
import { FaFileUpload, FaCheckCircle, FaExclamationCircle, FaBell } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

// Import the new API function
import { createServicePayment } from "../../api/paymentApi";
import { useAuth } from "../../context/AuthContext";

const ServicePayments = () => {
  const [searchParams] = useSearchParams();
  const { api } = useAuth();
  const serviceId = searchParams.get("serviceId");
  const customerId = searchParams.get("customerId");
  const totalAmountParam = searchParams.get("totalAmount");
  const maintenanceWorkerId = searchParams.get("maintenanceWorkerId");
  const hireId = searchParams.get("hireId");

  const [paymentStage, setPaymentStage] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("Pending");
  const [isReceiptAvailable, setIsReceiptAvailable] = useState(false);
  const [bankSlip, setBankSlip] = useState(null);
  const [notes, setNotes] = useState("");
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Service details - can be fetched from URL params or API
  const [serviceDetails, setServiceDetails] = useState({
    serviceId: serviceId || hireId || "SVC001",
    customerName: "Alice Johnson",
    totalProjectCost: totalAmountParam ? parseFloat(totalAmountParam) : 20000,
  });

  // Calculate balance and payment history on component mount
  useEffect(() => {
    if (serviceDetails.totalProjectCost > 0) {
      calculateBalance();
    }
  }, [serviceDetails.totalProjectCost, paymentHistory]);

  // Calculate balance based on payment history
  const calculateBalance = () => {
    const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = serviceDetails.totalProjectCost - totalPaid;
    setBalanceAmount(balance);
  };

  // Calculate payment amount based on stage and balance
  const calculatePaymentAmount = (stage) => {
    switch (stage) {
      case "Appointment Fee":
        return 200;
      case "Blueprint Fee":
        return serviceDetails.totalProjectCost * 0.03; // 3% of total
      case "Half Payment":
        return serviceDetails.totalProjectCost * 0.5; // 50% of total
      case "Full Payment":
        return serviceDetails.totalProjectCost; // 100% of total
      case "Balance Payment":
        return balanceAmount; // Remaining balance
      default:
        return 0;
    }
  };

  const handlePaymentStageChange = (e) => {
    const stage = e.target.value;
    setPaymentStage(stage);
    const calculatedAmount = calculatePaymentAmount(stage);
    setAmount(calculatedAmount);
  };

  const handleFileChange = (e) => {
    setBankSlip(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If this is a maintenance hire payment, route to maintenance payment endpoint
      if (maintenanceWorkerId) {
        const payload = {
          maintenanceWorkerId,
          orderId: hireId || serviceDetails.serviceId,
          amount,
          method: "BankSlip",
          notes: paymentStage ? `${paymentStage}${notes ? ` - ${notes}` : ""}` : notes,
        };
        await api.post("/maintenance/me/payments", payload);
      } else {
        // Map UI fields to generic service payment backend contract
        const paymentData = {
          orderId: serviceDetails.serviceId && serviceDetails.serviceId.startsWith("test") ? "507f1f77bcf86cd799439011" : serviceDetails.serviceId,
          customerId: customerId ? (customerId.startsWith("test") ? "507f1f77bcf86cd799439012" : customerId) : "507f1f77bcf86cd799439012",
          amount: amount,
          method: "BankSlip",
          bankSlipUrl: bankSlip ? bankSlip.name : undefined,
          notes: paymentStage ? `${paymentStage}${notes ? ` - ${notes}` : ""}` : notes,
          paymentDate: new Date(),
        };
        await createServicePayment(paymentData);
      }

      // Add to payment history
      const paymentRecord = {
        id: Date.now(),
        stage: paymentStage,
        amount: amount,
        date: new Date(),
        status: "Pending",
      };
      setPaymentHistory((prev) => [...prev, paymentRecord]);

      setStatus("Pending"); // Set status to pending on successful submission
      toast.success("Payment details submitted successfully! Awaiting admin confirmation.");

      // Show balance notification if applicable
      if (paymentStage === "Half Payment" && balanceAmount > amount) {
        const remainingBalance = balanceAmount - amount;
        toast.success(`Payment submitted! Remaining balance: LKR ${remainingBalance.toLocaleString()}`, {
          duration: 6000,
          icon: "💰",
        });
      }
    } catch (error) {
      console.error("Payment submission failed:", error);
      toast.error("Payment submission failed. Please try again.");
      setStatus("Failed");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <BsCashStack className="mr-3 text-green-700" />
          Service Payments
        </h1>

        {/* Service Info Box */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-3">
            <BsInfoCircle className="text-blue-500 mr-3" size={24} />
            <h3 className="text-lg font-semibold">Service Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">
                Service ID: <span className="text-green-700">{serviceDetails.serviceId}</span>
              </p>
              <p className="text-sm">
                Customer: <span className="font-medium">{serviceDetails.customerName}</span>
              </p>
            </div>
            <div>
              <p className="text-sm">
                Total Project Cost: <span className="font-medium text-lg">LKR {serviceDetails.totalProjectCost.toLocaleString()}</span>
              </p>
              <p className="text-sm">
                Remaining Balance: <span className="font-medium text-lg text-red-600">LKR {balanceAmount.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-3">
              <BsCalculator className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Payment History</h3>
            </div>
            <div className="space-y-2">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center bg-white p-2 rounded">
                  <span className="text-sm">{payment.stage}</span>
                  <span className="text-sm font-medium">LKR {payment.amount.toLocaleString()}</span>
                  <span className={`badge badge-sm ${payment.status === "Pending" ? "badge-warning" : "badge-success"}`}>{payment.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Stage */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Payment Stage</span>
              </label>
              <select className="select select-bordered w-full rounded-lg" value={paymentStage} onChange={handlePaymentStageChange} required>
                <option disabled value="">
                  Choose Stage
                </option>
                <option>Appointment Fee</option>
                <option>Blueprint Fee (3%)</option>
                <option>Half Payment (50%)</option>
                <option>Full Payment (100%)</option>
                {balanceAmount > 0 && <option>Balance Payment</option>}
              </select>
            </div>

            {/* Amount */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount to Pay</span>
              </label>
              <input type="text" className="input input-bordered w-full rounded-lg bg-gray-50" value={`LKR ${amount.toLocaleString()}`} readOnly />
            </div>
          </div>

          {/* Bank Slip Upload */}
          <div className="form-control mt-6">
            <label className="label">
              <span className="label-text">Upload Bank Slip</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                className="file-input file-input-bordered file-input-success w-full rounded-lg"
                onChange={handleFileChange}
                required
              />
              {bankSlip && <span className="text-sm text-gray-500">{bankSlip.name}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="form-control mt-6">
            <label className="label">
              <span className="label-text">Notes (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 rounded-lg"
              placeholder="Add any notes regarding your payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Balance Notification */}
          {balanceAmount > 0 && paymentStage !== "Balance Payment" && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
              <div className="flex items-center">
                <FaBell className="text-yellow-600 mr-2" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Balance Reminder</h4>
                  <p className="text-sm text-yellow-700">
                    You have a remaining balance of <strong>LKR {balanceAmount.toLocaleString()}</strong> to complete your payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button & Status Badge */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="submit"
              className="btn bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
              Confirm Payment
            </button>

            <div
              className={`badge badge-lg p-4 ${
                status === "Pending" ? "badge-warning" : status === "Completed" ? "badge-success" : "badge-error"
              } text-white`}
            >
              {status === "Pending" ? <FaExclamationCircle className="mr-2" /> : <FaCheckCircle className="mr-2" />}
              Status: {status}
            </div>
          </div>
        </form>

        {/* Receipt Download Section (kept for future use) */}
        {isReceiptAvailable && (
          <div className="mt-8 text-center border-t pt-6 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Payment Confirmed!</h3>
            <p className="text-gray-500 mb-4">Your payment has been successfully processed. You can download your receipt below.</p>
            <button className="btn btn-outline btn-success text-green-700 font-bold py-3 px-8 rounded-full shadow-md">
              <BsDownload className="mr-2" />
              Download Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePayments;
