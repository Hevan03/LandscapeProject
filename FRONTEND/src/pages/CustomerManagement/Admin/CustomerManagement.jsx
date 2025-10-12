import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import CustomerModal from "./CustomerModal";
import CustomerDetails from "./CustomerDetails";
import { toast } from "react-hot-toast";

// Modern Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, customerName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white/50 to-pink-50/50 rounded-3xl"></div>

          <div className="relative">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Customer</h3>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-900">{customerName}</strong>? This will permanently remove all customer
                data, history, and associated records.
              </p>
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 border border-gray-200 disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLoyalty, setFilterLoyalty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    loyaltyMembers: 0,
    totalRevenue: 0,
    newThisMonth: 0,
  });

  const itemsPerPage = 10;

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data.customers);
        setTotalCustomers(data.data.customers.length);
        setTotalPages(1); // Simple version, no pagination
      } else {
        toast.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/customers/stats/overview", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [currentPage, searchTerm, filterStatus, filterLoyalty]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchCustomers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleExportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Modern Header (increase height to 40mm)
    doc.setFillColor(34, 197, 94); // Tailwind green-500
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Customer Report", pageWidth / 2, 14, { align: "center" });

    // Subtitle & Date
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 22, { align: "center" });

    // Summary Stats (move below header)
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Customers: ${stats.totalCustomers}   |   Active: ${stats.activeCustomers}   |   Loyalty Members: ${
        stats.loyaltyMembers
      }   |   Revenue: ${formatCurrency(stats.totalRevenue)}`,
      pageWidth / 2,
      32,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);

    // Table Data
    const exportData = customers.map((customer) => [
      customer.name,
      customer.registrationNumber,
      customer.email,
      customer.phone,
      customer.status,
      customer.loyaltyLevel,
      customer.address,
      customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : "",
    ]);

    autoTable(doc, {
      head: [["Name", "Reg. No", "Email", "Phone", "Status", "Loyalty Level", "Address", "DOB"]],
      body: exportData,
      startY: 45, // Start table below header and summary
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [40, 40, 40],
        halign: "center",
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244], // Tailwind green-50
      },
      styles: {
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },
      margin: { left: 8, right: 8 },
      didDrawPage: () => {
        // Footer
        doc.setFontSize(9);
        doc.setTextColor(180, 180, 180);
        doc.text(`LeafSphere Customer Management • Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, {
          align: "center",
        });
      },
    });

    doc.save("Customer_Report.pdf");
  };

  // New customer creation is handled via the modal open button directly; no separate handler needed

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:5001/api/customers/${customerToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Customer deleted successfully");
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        fetchCustomers();
        fetchStats();
      } else {
        toast.error(data.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Error deleting customer");
    } finally {
      setDeleting(false);
    }
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchCustomers();
    fetchStats();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getLoyaltyBadgeColor = (status) => {
    switch (status) {
      case "bronze":
        return "bg-amber-100 text-amber-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "platinum":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // if (user?.role !== "admin") {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900 mb-4">
  //           Access Denied
  //         </h1>
  //         <p className="text-gray-600">
  //           You don't have permission to access this page.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br px-[20px] from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="relative mx-2.5 py-8">
        {/* Header */}

        {/* Statistics Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 pt-16 lg:grid-cols-5 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group backdrop-blur-sm bg-white/70 rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <UserIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalCustomers}</p>
                <p className="text-sm font-medium text-gray-600">Customers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group backdrop-blur-sm bg-white/70 rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 via-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <ChartBarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</p>
                <p className="text-3xl font-black text-gray-900">{stats.activeCustomers}</p>
                <p className="text-sm font-medium text-gray-600">Members</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group backdrop-blur-sm bg-white/70 rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <UserIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loyalty</p>
                <p className="text-3xl font-black text-gray-900">{stats.loyaltyMembers}</p>
                <p className="text-sm font-medium text-gray-600">Members</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group backdrop-blur-sm bg-white/70 rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</p>
                <p className="text-3xl font-black text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm font-medium text-gray-600">Total</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group backdrop-blur-sm bg-white/70 rounded-3xl shadow-sm border border-white/30 p-6 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-between">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <CalendarIcon className="h-7 w-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New</p>
                <p className="text-3xl font-black text-gray-900">{stats.newThisMonth}</p>
                <p className="text-sm font-medium text-gray-600">This Month</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-sm border border-white/20 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-3xl"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col md:flex-row gap-6 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-[10px] rounded-xl border border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-4 pr-4 h-[40px] rounded-xl border border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>

                  <select
                    value={filterLoyalty}
                    onChange={(e) => setFilterLoyalty(e.target.value)}
                    className="w-full pl-4 pr-4 min-w-[160px] h-[40px] rounded-xl border border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                  >
                    <option value="all">All Loyalty Levels</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>

              {/* Excel Export Button aligned right */}
              <div className="flex justify-end w-full lg:w-auto">
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-700 text-white font-semibold rounded-xl shadow hover:from-green-600 hover:to-teal-800 transition-all duration-200"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100/50">
              <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Loyalty</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Services</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100/70">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                          <div
                            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-green-400 rounded-full animate-spin animate-reverse"
                            style={{ animationDuration: "1.5s" }}
                          ></div>
                        </div>
                        <span className="text-gray-600 font-medium text-lg">Loading customers...</span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">#{customer.registrationNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            customer.status
                          )}`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="  px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-16 text-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoyaltyBadgeColor(
                            customer.loyaltyStatus
                          )}`}
                        >
                          {customer.loyaltyPoints} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalServicesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.createdAt)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1, y: -1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewCustomer(customer)}
                            className="group relative p-3 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditCustomer(customer)}
                            className="group relative p-3 text-green-600 hover:text-white bg-green-50 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteCustomer(customer)}
                            className="group relative p-3 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCustomers)}</span> of{" "}
                    <span className="font-medium">{totalCustomers}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Customer Modal */}
      {showModal && <CustomerModal customer={selectedCustomer} onClose={() => setShowModal(false)} onSuccess={handleModalSuccess} />}

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <CustomerDetails
          customer={selectedCustomer}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            handleEditCustomer(selectedCustomer);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDeleteCustomer}
        customerName={customerToDelete?.name}
        isDeleting={deleting}
      />
    </motion.div>
  );
};

export default CustomerManagement;
