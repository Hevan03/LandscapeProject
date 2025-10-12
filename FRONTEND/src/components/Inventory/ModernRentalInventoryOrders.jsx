import React, { useEffect, useState } from "react";
import { updateRentalOrderStatusAPI } from "../../api/orderApi";
import toast from "react-hot-toast";
import { FaTruck, FaCalendarAlt, FaTools, FaClock, FaUser, FaMoneyBillWave, FaSort, FaSearch, FaFileDownload } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Status badge styling function
const getStatusBadgeClasses = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Active":
      return "bg-green-100 text-green-800 border border-green-200";
    case "Returned":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const ModernRentalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("rentedAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/rental-orders");
      const data = await res.json();
      setOrders(data);
      toast.success("Rental orders loaded successfully");
    } catch (err) {
      console.error("Failed to load rental orders:", err);
      toast.error("Failed to load rental orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateRentalOrderStatusAPI(orderId, newStatus);
      toast.success("Order status updated to " + newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  // Filter and sort orders
  const getFilteredAndSortedOrders = () => {
    return orders
      .filter((order) => {
        // Status filter
        if (statusFilter !== "All" && order.status !== statusFilter) {
          return false;
        }

        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const customerName = order.customerId?.name?.toLowerCase() || "";
          const machineName = order.machine?.name?.toLowerCase() || "";

          return customerName.includes(searchLower) || machineName.includes(searchLower);
        }

        return true;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;

        switch (sortField) {
          case "rentedAt":
            return direction * (new Date(a.rentedAt) - new Date(b.rentedAt));
          case "duration":
            return direction * ((a.duration || 0) - (b.duration || 0));
          case "totalPrice":
            return direction * ((a.totalPrice || 0) - (b.totalPrice || 0));
          default:
            return 0;
        }
      });
  };

  const filteredOrders = getFilteredAndSortedOrders();

  // Generate PDF report
  const generatePdfReport = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text("Rental Orders Report", 14, 22);

    const tableColumn = ["Customer", "Machine", "Duration", "Status", "Price", "Rented At"];
    const tableRows = filteredOrders.map((order) => [
      order.customerId?.name || "N/A",
      order.machine?.name || "N/A",
      `${order.duration} days`,
      order.status,
      `Rs. ${order.totalPrice?.toLocaleString() || 0}`,
      new Date(order.rentedAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`rental_orders_report_${date}.pdf`);
    toast.success("PDF report generated successfully!");
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) => order.status === "Active").length;
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const returnedOrders = orders.filter((order) => order.status === "Returned").length;

  const totalRevenue = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Prepare chart data
  const statusData = [
    { name: "Pending", value: pendingOrders, color: "#FBBF24" },
    { name: "Active", value: activeOrders, color: "#34D399" },
    { name: "Returned", value: returnedOrders, color: "#60A5FA" },
    { name: "Cancelled", value: orders.filter((order) => order.status === "Cancelled").length, color: "#F87171" },
  ].filter((item) => item.value > 0);

  // Create monthly revenue data
  const monthlyData = orders.reduce((acc, order) => {
    if (order.status !== "Cancelled") {
      const date = new Date(order.rentedAt);
      const month = date.toLocaleString("default", { month: "short" });

      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += order.totalPrice || 0;
    }
    return acc;
  }, {});

  const revenueData = Object.entries(monthlyData).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Rental Orders Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg mr-3">
                            <FaTools className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalOrders}</p>
                        <p className="text-xs text-gray-500 mt-2">All rental orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-2 border-t border-blue-100">
                    <span className="text-xs font-medium text-blue-700">View all orders</span>
                  </div>
                </div>

                {/* Active Orders Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-green-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg mr-3">
                            <FaCalendarAlt className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Active Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{activeOrders}</p>
                        <p className="text-xs text-gray-500 mt-2">Currently rented out</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <span
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center cursor-pointer"
                      onClick={() => setStatusFilter("Active")}
                    >
                      View active rentals
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Pending Orders Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-yellow-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg mr-3">
                            <FaClock className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Pending Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{pendingOrders}</p>
                        <p className="text-xs text-gray-500 mt-2">Awaiting processing</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-5 py-2 border-t border-yellow-100">
                    <span
                      className="text-xs font-medium text-yellow-700 hover:text-yellow-800 flex items-center cursor-pointer"
                      onClick={() => setStatusFilter("Pending")}
                    >
                      View pending orders
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
                            <FaMoneyBillWave className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Revenue</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">Rs. {totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">From all orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-2 border-t border-purple-100">
                    <span
                      className="text-xs font-medium text-purple-700 hover:text-purple-800 flex items-center cursor-pointer"
                      onClick={generatePdfReport}
                    >
                      Generate Report
                      <FaFileDownload className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-md mb-8 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by customer or machine..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
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

            {/* Analytics Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Analytics Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaTools className="text-blue-600 mr-2" /> Order Status Distribution
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 font-medium">
                      Current Status
                    </span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, _name) => [`${value} orders`, _name]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaMoneyBillWave className="text-green-600 mr-2" /> Monthly Revenue
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200 font-medium">
                      Value in Rs.
                    </span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Revenue"]} />
                        <Bar dataKey="revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Rental Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          if (sortField === "duration") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("duration");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center">Duration {sortField === "duration" && <FaSort className="ml-1 text-gray-400" />}</div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          if (sortField === "totalPrice") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("totalPrice");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center">Total Price {sortField === "totalPrice" && <FaSort className="ml-1 text-gray-400" />}</div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          if (sortField === "rentedAt") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("rentedAt");
                            setSortDirection("desc");
                          }
                        }}
                      >
                        <div className="flex items-center">Rented At {sortField === "rentedAt" && <FaSort className="ml-1 text-gray-400" />}</div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <FaUser className="text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{order.customerId?.name || "N/A"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.machine?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.duration} days</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            Rs. {order.totalPrice?.toLocaleString() || order.totalPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.rentedAt).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleStatusChange(order._id, "Pending")}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 ${
                                  order.status === "Pending" ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={order.status === "Pending"}
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, "Active")}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs border border-green-300 text-green-800 bg-green-50 hover:bg-green-100 ${
                                  order.status === "Active" ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={order.status === "Active"}
                              >
                                Active
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, "Returned")}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100 ${
                                  order.status === "Returned" ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={order.status === "Returned"}
                              >
                                Returned
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                          {orders.length === 0 ? "No rental orders found" : "No rental orders match your search criteria"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span>{" "}
                    orders
                  </span>
                  <button
                    onClick={generatePdfReport}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <FaFileDownload className="mr-1" />
                    Export Current View
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModernRentalOrders;
