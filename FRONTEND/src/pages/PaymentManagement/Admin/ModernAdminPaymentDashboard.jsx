import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import toast from "react-hot-toast";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaShoppingCart,
  FaTools,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaChartPie,
  FaFileDownload,
  FaPercent,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import the API functions
import { getAllInventoryPayments, getAllServicePayments, updatePaymentStatus, updateItemPaymentStatus } from "../../../api/adminPaymentApi";

const ModernAdminPaymentDashboard = () => {
  const [inventoryPayments, setInventoryPayments] = useState([]);
  const [servicePayments, setServicePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inventoryRes, serviceRes] = await Promise.all([getAllInventoryPayments(), getAllServicePayments()]);
        setInventoryPayments(inventoryRes.data);
        setServicePayments(serviceRes.data);
      } catch (err) {
        console.error("Failed to fetch payment data:", err);
        setError("Failed to load payment data. Please try again later.");
        toast.error("Failed to load payment data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine and enhance payment data
  const allPayments = [
    // Item (inventory) payments collection
    ...inventoryPayments.map((p) => ({
      ...p,
      source: "item",
      type: "Inventory",
      // normalize fields
      date: p.paymentDate || p.createdAt || p.date,
      amount: p.amount,
      status: (p.status || "").toLowerCase() === "failed" ? "rejected" : (p.status || "").toLowerCase(),
      orderId: p.orderId ? String(p.orderId) : p.orderId,
      paymentMethod: p.method,
      paymentProof: p.bankSlipUrl,
    })),
    // General payments collection
    ...servicePayments.map((p) => ({
      ...p,
      source: "service",
      // Treat shop product orders (orderType === 'order') as Inventory tab
      type: p.orderType === "order" ? "Inventory" : "Service",
      date: p.paymentDate || p.createdAt || p.date,
      amount: p.totalAmount || p.amount,
      status: (p.status || "").toLowerCase() === "failed" ? "rejected" : (p.status || "").toLowerCase(),
      orderId: p.orderId ? String(p.orderId) : p.orderId,
      paymentMethod: p.method,
      paymentProof: p.bankSlipUrl,
    })),
  ];

  // Filter payments based on active tab, search term, and status filter
  const getFilteredPayments = () => {
    return allPayments
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
          (payment.orderId && String(payment.orderId).toLowerCase().includes(searchLower)) ||
          (payment.customer && payment.customer.toLowerCase().includes(searchLower)) ||
          (payment._id && payment._id.toLowerCase().includes(searchLower))
        );
      })
      .sort((a, b) => {
        const aValue = a[sortBy] || 0;
        const bValue = b[sortBy] || 0;
        const direction = sortOrder === "asc" ? 1 : -1;

        if (sortBy === "date") {
          return direction * (new Date(aValue) - new Date(bValue));
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction * aValue.localeCompare(bValue);
        }

        return direction * (aValue - bValue);
      });
  };

  const filteredPayments = getFilteredPayments();

  // Calculate statistics
  const totalPayments = allPayments.length;
  const pendingPayments = allPayments.filter((p) => p.status === "pending").length;
  const completedPayments = allPayments.filter((p) => p.status === "completed").length;
  const rejectedPayments = allPayments.filter((p) => p.status === "rejected").length;

  const totalRevenue = allPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0);

  // Prepare chart data
  const paymentsByTypeData = [
    { name: "Inventory", value: inventoryPayments.length, color: "#3B82F6" },
    { name: "Service", value: servicePayments.length, color: "#10B981" },
  ];

  const paymentsByStatusData = [
    { name: "Pending", value: pendingPayments, color: "#F59E0B" },
    { name: "Completed", value: completedPayments, color: "#10B981" },
    { name: "Rejected", value: rejectedPayments, color: "#EF4444" },
  ];

  // Calculate payment completion percentages for the summary chart
  // Percentages available if needed for future summary visuals
  // const rejectedPercentage = totalPayments > 0 ? 100 - completedPercentage - pendingPercentage : 0;

  // Derived summary percentages available if needed for future charts

  // Monthly payment data for line chart
  const monthlyPaymentData = allPayments.reduce((acc, payment) => {
    const date = new Date(payment.date);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!acc[month]) {
      acc[month] = {
        month,
        totalAmount: 0,
        count: 0,
      };
    }

    acc[month].totalAmount += payment.amount || 0;
    acc[month].count += 1;

    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyPaymentData).sort((a, b) => new Date(a.month) - new Date(b.month));

  // Handle viewing payment details
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  // Handle payment status update
  const handleApproveReject = async (status) => {
    if (!selectedPayment?._id) return;
    const confirmMsg = status === "completed" ? "Approve this payment?" : "Reject this payment?";
    if (!window.confirm(confirmMsg)) return;
    try {
      // Map status to backend expected values
      let backendStatus = status;
      if (selectedPayment.source === "item") {
        // ItemPayment expects: Pending, Completed, Failed
        backendStatus = status === "completed" ? "Completed" : status === "rejected" ? "Failed" : "Pending";
        await updateItemPaymentStatus(selectedPayment._id, backendStatus);
      } else {
        // Payment model expects: pending, completed, failed, refunded
        backendStatus = status === "rejected" ? "failed" : status; // pending/completed stay as-is
        await updatePaymentStatus(selectedPayment._id, backendStatus);
      }
      toast.success(status === "completed" ? "Payment approved" : "Payment rejected");
      setShowModal(false);
      setSelectedPayment(null);
      // Refresh lists
      const [inventoryRes, serviceRes] = await Promise.all([getAllInventoryPayments(), getAllServicePayments()]);
      setInventoryPayments(inventoryRes.data);
      setServicePayments(serviceRes.data);
    } catch (e) {
      console.error("Failed to update payment:", e);
      toast.error("Failed to update payment status");
    }
  };

  // Get status badge styling
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get payment type badge styling
  const getTypeBadgeClasses = (type) => {
    switch (type) {
      case "Inventory":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Service":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Generate PDF report
  const generatePdfReport = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text("Payment Summary Report", 14, 22);

    const tableColumn = ["Order ID", "Type", "Customer", "Amount", "Status", "Date"];
    const tableRows = filteredPayments.map((payment) => [
      payment.orderId || "-",
      payment.type,
      payment.customer || "-",
      `Rs. ${payment.amount?.toLocaleString() || 0}`,
      payment.status,
      new Date(payment.date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.lastAutoTable.finalY + 20);

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`payment_report_${date}.pdf`);
    toast.success("PDF report generated successfully!");
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Payment Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Payments Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg mr-3">
                            <FaMoneyBillWave className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Payments</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalPayments}</p>
                        <p className="text-xs text-gray-500 mt-2">All payment transactions</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-2 border-t border-blue-100">
                    <span
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center cursor-pointer"
                      onClick={() => {
                        setActiveTab("all");
                        setFilterStatus("All");
                      }}
                    >
                      View all payments
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Completed Payments Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-green-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg mr-3">
                            <FaCreditCard className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Completed Payments</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{completedPayments}</p>
                        <p className="text-xs text-gray-500 mt-2">Successfully processed</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <span
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center cursor-pointer"
                      onClick={() => setFilterStatus("completed")}
                    >
                      View completed payments
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Pending Payments Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-yellow-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg mr-3">
                            <FaCalendarAlt className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Pending Payments</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{pendingPayments}</p>
                        <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-5 py-2 border-t border-yellow-100">
                    <span
                      className="text-xs font-medium text-yellow-700 hover:text-yellow-800 flex items-center cursor-pointer"
                      onClick={() => setFilterStatus("pending")}
                    >
                      Review pending payments
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-lg mr-3">
                            <FaChartLine className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Revenue</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">Rs. {totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">From completed payments</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-2 border-t border-purple-100">
                    <span
                      className="text-xs font-medium text-purple-700 hover:text-purple-800 flex items-center cursor-pointer"
                      onClick={generatePdfReport}
                    >
                      Generate Revenue Report
                      <FaFileDownload className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Type Tab Navigation */}
            <div className="bg-white rounded-xl shadow-md mb-8">
              <div className="border-b border-gray-200 hidden">
                <nav className="flex -mb-px">
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === "all"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("all")}
                  >
                    <FaMoneyBillWave />
                    <span>All Payments</span>
                  </button>
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === "inventory"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("inventory")}
                  >
                    <FaShoppingCart />
                    <span>Inventory Payments</span>
                  </button>
                  <button
                    className={`px-6 py-3 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === "service"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("service")}
                  >
                    <FaTools />
                    <span>Service Payments</span>
                  </button>
                </nav>
              </div>

              {/* Search and Filter Controls */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by order ID or customer..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="All">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={generatePdfReport}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaFileDownload className="mr-2 -ml-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortBy("orderId");
                          setSortOrder(sortBy === "orderId" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Order ID {sortBy === "orderId" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortBy("customer");
                          setSortOrder(sortBy === "customer" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Customer {sortBy === "customer" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortBy("amount");
                          setSortOrder(sortBy === "amount" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Amount {sortBy === "amount" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortBy("status");
                          setSortOrder(sortBy === "status" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Status {sortBy === "status" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          setSortBy("date");
                          setSortOrder(sortBy === "date" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Date {sortBy === "date" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.orderId || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClasses(payment.type)}`}
                            >
                              {payment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customer || "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">Rs. {payment.amount?.toLocaleString() || 0}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(
                                payment.status
                              )}`}
                            >
                              {payment.status === "completed"
                                ? "Completed"
                                : payment.status === "pending"
                                ? "Pending"
                                : payment.status === "rejected"
                                ? "Rejected"
                                : payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewPayment(payment)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md px-2 py-1 transition-colors duration-150"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                          {allPayments.length === 0 ? "No payment records found" : "No payments match your current filters"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination and Summary */}
              {filteredPayments.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredPayments.length}</span> of{" "}
                    <span className="font-medium">{allPayments.length}</span> payments
                  </span>
                </div>
              )}
            </div>

            {/* Analytics Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Payment Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Type Distribution Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaCreditCard className="text-blue-600 mr-2" /> Payment Type Distribution
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 font-medium">By Count</span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={paymentsByTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentsByTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} payments`, ""]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Payment Status Distribution Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaChartPie className="text-green-600 mr-2" /> Payment Status
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200 font-medium">
                      Distribution
                    </span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={paymentsByStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {paymentsByStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} payments`, ""]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Payment Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaChartLine className="text-purple-600 mr-2" /> Monthly Payment Trends
                    </h3>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full border border-purple-200 font-medium">
                      Amount & Count
                    </span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip
                          formatter={(value, name) => [
                            name === "totalAmount" ? `Rs. ${value.toLocaleString()}` : value,
                            name === "totalAmount" ? "Amount" : "Count",
                          ]}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="totalAmount"
                          name="Total Amount"
                          stroke="#8884d8"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line yAxisId="right" type="monotone" dataKey="count" name="Payment Count" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="payment-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Details</h3>
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedPayment(null);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payment ID:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPayment._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeClasses(selectedPayment.type)}`}>{selectedPayment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Order ID:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPayment.orderId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Customer:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPayment.customer || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="text-sm font-medium text-green-700">Rs. {selectedPayment.amount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payment Method:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPayment.paymentMethod || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClasses(selectedPayment.status)}`}>
                        {selectedPayment.status === "completed"
                          ? "Completed"
                          : selectedPayment.status === "pending"
                          ? "Pending"
                          : selectedPayment.status === "rejected"
                          ? "Rejected"
                          : selectedPayment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPayment.date ? new Date(selectedPayment.date).toLocaleString() : "-"}
                      </span>
                    </div>

                    {selectedPayment.paymentProof && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-700 block mb-2">Payment Proof:</span>
                        <div className="border border-gray-300 rounded-md overflow-hidden">
                          <img
                            src={`http://localhost:5001${selectedPayment.paymentProof}`}
                            alt="Payment Proof"
                            className="w-full h-auto max-h-40 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedPayment.status === "pending" && (
                    <>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleApproveReject("completed")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => handleApproveReject("rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayment(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernAdminPaymentDashboard;
