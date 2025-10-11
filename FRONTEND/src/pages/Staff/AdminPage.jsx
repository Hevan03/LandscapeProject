import React, { useState, useEffect } from "react";
import { employeeAPI } from "../../api/employeeAPI";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function AdminPage() {
  const [groupedData, setGroupedData] = useState({
    employees: [],
    drivers: [],
    landscapers: [],
    maintenance: [],
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeView, setActiveView] = useState("employees");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
  const [approvedBy, setApprovedBy] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch grouped data
  const fetchGroupedData = async () => {
    setLoading(true);
    try {
      const data = await employeeAPI.getAll();
      setGroupedData(data);
    } catch (error) {
      console.error("Error fetching grouped data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupedData();
  }, []);

  // Approve employee
  const confirmApprove = async () => {
    if (!approvedBy.trim()) {
      toast.error("Please enter who approved this application");
      return;
    }
    setProcessing(true);
    try {
      await employeeAPI.approveEmployee(selectedApplication._id, approvedBy);
      await fetchGroupedData();
      setShowApprovalModal(false);
      setSelectedApplication(null);
      setApprovedBy("");
      toast.success("Application approved successfully!");
    } catch (error) {
      toast.error("Failed to approve application. " + (error.message || ""));
    } finally {
      setProcessing(false);
    }
  };

  // Reject employee
  const confirmReject = async () => {
    setProcessing(true);
    try {
      await employeeAPI.rejectEmployee(selectedApplication._id, rejectionNote);
      await fetchGroupedData();
      setShowRejectionModal(false);
      setSelectedApplication(null);
      setRejectionNote("");
      toast.success("Application rejected successfully!");
    } catch (error) {
      toast.error("Failed to reject application. " + (error.message || ""));
    } finally {
      setProcessing(false);
    }
  };

  // Sidebar items for each group
  const sidebarItems = [
    {
      id: "employees",
      label: "Employees",
      icon: "👥",
      count: groupedData.employees.length,
    },
    { id: "drivers", label: "Drivers", icon: "🚚", count: groupedData.drivers.length },
    { id: "landscapers", label: "Landscapers", icon: "🌳", count: groupedData.landscapers.length },
    { id: "maintenance", label: "Maintenance Workers", icon: "🛠️", count: groupedData.maintenance.length },
  ];

  // Apply status filter to the data
  const getFilteredData = () => {
    const data = groupedData[activeView] || [];
    if (statusFilter === "all") return data;
    return data.filter((item) => item.accountStatus === statusFilter);
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-xl z-10 relative">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-8 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Admin Panel
            </h2>
            <div className="space-y-3">
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setStatusFilter("all"); // Reset filter when changing view
                  }}
                  className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${
                    activeView === item.id
                      ? "bg-green-600 text-white shadow-lg shadow-green-200"
                      : "bg-white text-green-700 hover:bg-green-50 border border-green-100"
                  }`}
                  whileHover={{ scale: activeView !== item.id ? 1.03 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      activeView === item.id ? "bg-white text-green-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.count}
                  </span>
                </motion.button>
              ))}
            </div>
            <motion.button
              onClick={fetchGroupedData}
              disabled={loading}
              className={`w-full mt-8 py-3 px-4 bg-gradient-to-r from-green-700 to-green-600 text-white font-medium rounded-xl shadow-lg shadow-green-200 flex items-center justify-center ${
                loading ? "opacity-50" : "hover:shadow-xl"
              }`}
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              Refresh Data
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-green-800">{sidebarItems.find((item) => item.id === activeView)?.label} List</h2>
              <p className="text-green-600 mt-1">Manage your {activeView} and their application status</p>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-md p-2 flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-500 mr-2">Filter:</div>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === "all" ? "bg-green-100 text-green-800" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === "pending" ? "bg-yellow-100 text-yellow-800" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === "approved" ? "bg-green-100 text-green-800" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === "rejected" ? "bg-red-100 text-red-800" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
              <p className="text-green-700 font-semibold">Loading data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">No records found</h3>
              <p className="text-green-600">
                No {statusFilter !== "all" ? statusFilter + " " : ""}
                {sidebarItems.find((item) => item.id === activeView)?.label.toLowerCase()} available.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
                <div className="col-span-1 font-semibold text-gray-600"></div>
                <div className="col-span-3 font-semibold text-gray-600">Name & Contact</div>
                <div className="col-span-2 font-semibold text-gray-600 text-center">Type</div>
                <div className="col-span-2 font-semibold text-gray-600 text-center">Status</div>
                <div className="col-span-2 font-semibold text-gray-600 text-center">Created</div>
                <div className="col-span-2 font-semibold text-gray-600 text-center">Actions</div>
              </div>

              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredData.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`grid grid-cols-12 items-center p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50`}
                    >
                      {/* Avatar */}
                      <div className="col-span-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center text-white font-bold">
                          {(user.Employee_Name || user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Name & Contact */}
                      <div className="col-span-3">
                        <button
                          onClick={() => {
                            setSelectedApplication(user);
                            setShowDetailsModal(true);
                          }}
                          className="font-semibold text-green-800 hover:text-green-600 text-left"
                        >
                          {user.Employee_Name || user.name || user.email}
                        </button>
                        <div className="text-xs text-gray-500 mt-1 flex flex-col">
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {user.email || user.Employee_Email}
                          </span>
                          <span className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {user.contact || user.Employee_Contact_Num || user.phone || "Not provided"}
                          </span>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.Employee_Type || user.role || activeView}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.accountStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : user.accountStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.accountStatus || "pending"}
                        </span>
                      </div>

                      {/* Created Date */}
                      <div className="col-span-2 text-center text-sm text-gray-600">{user.Created_Dtm ? formatDate(user.Created_Dtm) : "-"}</div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(user);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </button>

                        {/* Only show approve/reject for pending status */}
                        {user.accountStatus === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedApplication(user);
                                setShowApprovalModal(true);
                              }}
                              className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApplication(user);
                                setShowRejectionModal(true);
                              }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-green-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white text-green-700 flex items-center justify-center text-xl font-bold">
                  {(selectedApplication.Employee_Name || selectedApplication.name || selectedApplication.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedApplication.Employee_Name || selectedApplication.name || selectedApplication.email}</h2>
                  <p className="text-green-100 text-sm">{selectedApplication.Employee_Type || selectedApplication.role || activeView} Details</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-green-600 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedApplication.email || selectedApplication.Employee_Email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">
                        {selectedApplication.contact || selectedApplication.Employee_Contact_Num || selectedApplication.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">
                        {selectedApplication.address || selectedApplication.Employee_Adress || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Application Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium text-gray-800">{selectedApplication.Employee_Type || selectedApplication.role || activeView}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                          selectedApplication.accountStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : selectedApplication.accountStatus === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedApplication.accountStatus || "pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created On</p>
                      <p className="font-medium text-gray-800">
                        {selectedApplication.Created_Dtm ? formatDate(selectedApplication.Created_Dtm) : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional details if available */}
              {selectedApplication.License_Num && (
                <div className="mt-6 bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    License Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">License Number</p>
                      <p className="font-medium text-gray-800">{selectedApplication.License_Num}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>

              {/* Only show approve/reject for pending status */}
              {selectedApplication.accountStatus === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowApprovalModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectionModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Approve Application</h3>
                <p className="text-gray-500">{selectedApplication.Employee_Name || selectedApplication.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approved By *</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {!approvedBy.trim() && <p className="text-sm text-red-500 mt-1">This field is required</p>}
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={processing || !approvedBy.trim()}
                className={`px-4 py-2 bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center ${
                  processing || !approvedBy.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Approve"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reject Application</h3>
                <p className="text-gray-500">{selectedApplication.Employee_Name || selectedApplication.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Note (Optional)</label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={processing}
                className={`px-4 py-2 bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center ${
                  processing ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
                }`}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
