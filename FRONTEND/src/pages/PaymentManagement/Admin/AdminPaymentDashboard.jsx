import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

// Import the API functions
import { getAllInventoryPayments, getAllServicePayments, updatePaymentStatus } from "../../../api/adminPaymentApi";

const AdminPaymentDashboard = () => {
  const [inventoryPayments, setInventoryPayments] = useState([]);
  const [servicePayments, setServicePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inventoryRes, serviceRes] = await Promise.all([getAllInventoryPayments(), getAllServicePayments()]);
        setInventoryPayments(inventoryRes.data);
        setServicePayments(serviceRes.data);
      } catch (err) {
        console.error("Failed to fetch payment data:", err);
        toast.error("Failed to load payment data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allPayments = [...inventoryPayments.map((p) => ({ ...p, type: "Inventory" })), ...servicePayments.map((p) => ({ ...p, type: "Service" }))];

  const monthlyPaymentData = allPayments.reduce((acc, payment) => {
    const date = new Date(payment.createdAt || payment.date);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const existingMonth = acc.find((item) => item.month === month);

    if (existingMonth) {
      existingMonth.totalAmount += payment.totalAmount || payment.amount;
    } else {
      acc.push({ month, totalAmount: payment.totalAmount || payment.amount });
    }
    return acc;
  }, []);

  // Filter payments based on tab, search, and status
  const filteredPayments = allPayments
    .filter((payment) => {
      if (activeTab === "inventory") return payment.type === "Inventory";
      if (activeTab === "service") return payment.type === "Service";
      return true;
    })
    .filter((payment) => {
      if (filterStatus === "All") return true;
      return payment.status === filterStatus;
    })
    .filter((payment) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (payment.orderId && payment.orderId.toLowerCase().includes(searchLower)) ||
        (payment.customer && payment.customer.toLowerCase().includes(searchLower))
      );
    });

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleApproveReject = async (status) => {
    if (!selectedPayment?._id) return;
    const confirmMsg = status === "completed" ? "Approve this payment?" : "Reject this payment?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await updatePaymentStatus(selectedPayment._id, status);
      toast.success(status === "completed" ? "Payment approved" : "Payment rejected");
      setShowModal(false);
      // Refresh lists
      const [inventoryRes, serviceRes] = await Promise.all([getAllInventoryPayments(), getAllServicePayments()]);
      setInventoryPayments(inventoryRes.data);
      setServicePayments(serviceRes.data);
    } catch (e) {
      console.error("Failed to update payment:", e);
      toast.error("Failed to update payment status");
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Delivered":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Completed":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "Cancelled":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
            <div
              className="h-16 w-16 absolute top-4 left-4 rounded-full border-t-4 border-green-300 animate-spin"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Payment Dashboard</span>
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">Monitor and manage all payment transactions in one place</p>
        </div>

        {/* Monthly Overview Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Monthly Payment Overview
            </h2>
          </div>
          <div className="p-6">
            {monthlyPaymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPaymentData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
                  />
                  <Bar dataKey="totalAmount" fill="#4ade80" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">No payment data available for chart visualization</div>
            )}
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          {/* Tabs */}
          <div className="inline-flex rounded-md shadow-sm bg-white p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "all" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-700 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              All Payments
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{allPayments.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "inventory" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-700 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              Inventory
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{inventoryPayments.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("service")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "service" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-700 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              Services
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{servicePayments.length}</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>

        {/* Payment Records */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Payments Found</h2>
            <p className="text-gray-600 mb-8">No payment records match your current filters.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("All");
                setActiveTab("all");
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPayments.map((payment) => (
              <motion.div
                key={payment._id || payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:shadow-lg"
              >
                {/* Payment Header */}
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Payment Date</div>
                      <div className="font-medium">
                        {new Date(payment.createdAt || payment.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Order ID</div>
                      <div className="font-mono text-sm">{payment.orderId || payment.id || "N/A"}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Payment Type</div>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {payment.type}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Amount</div>
                      <div className="text-lg font-bold text-green-600">Rs. {(payment.totalAmount || payment.amount || 0).toLocaleString()}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Actions */}
                <div className="p-6 flex justify-end">
                  <button
                    onClick={() => handleViewPayment(payment)}
                    className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md font-medium text-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full p-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Payment Details</h3>
                  <button onClick={() => setShowModal(false)} className="text-white hover:text-green-100 focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-green-100 mt-1">
                  {selectedPayment.type} Payment #{selectedPayment._id?.substring(selectedPayment._id.length - 6) || "N/A"}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Payment Date</p>
                    <p className="font-medium">
                      {new Date(selectedPayment.createdAt || selectedPayment.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <div
                      className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                        selectedPayment.status
                      )}`}
                    >
                      {getStatusIcon(selectedPayment.status)}
                      {selectedPayment.status}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedPayment.customer || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Type</p>
                    <p className="font-medium">{selectedPayment.paymentMethod || "Credit Card"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-bold text-green-600">Rs. {(selectedPayment.totalAmount || selectedPayment.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium font-mono">{selectedPayment.orderId || "N/A"}</p>
                  </div>
                </div>

                {/* Items if available */}
                {selectedPayment.items && selectedPayment.items.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Items Purchased</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <ul className="divide-y divide-gray-200">
                        {selectedPayment.items.map((item, index) => (
                          <li key={index} className="py-2 flex justify-between">
                            <span>
                              {item.itemName || "Product"} × {item.quantity || 1}
                            </span>
                            <span className="font-medium">Rs. {(item.totalPrice || 0).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Additional information */}
                <div className="bg-green-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Payment Information
                  </h4>
                  <p className="text-sm text-green-700">
                    This {selectedPayment.type.toLowerCase()} payment was processed on our secure payment gateway.
                    {selectedPayment.status === "Completed" ? " The transaction was successful." : " The transaction is still being processed."}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {selectedPayment?.method === "BankSlip" || selectedPayment?.paymentMethod === "BankSlip" || selectedPayment?.type === "Service" ? (
                  <>
                    <button
                      onClick={() => handleApproveReject("completed")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Approve Payment
                    </button>
                    <button
                      onClick={() => handleApproveReject("cancelled")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Reject Payment
                    </button>
                  </>
                ) : null}
                <button
                  onClick={() => {
                    toast.success("Invoice downloaded successfully");
                    // Actual download functionality would be implemented here
                  }}
                  className="ml-3 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium flex items-center transition-all"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentDashboard;
