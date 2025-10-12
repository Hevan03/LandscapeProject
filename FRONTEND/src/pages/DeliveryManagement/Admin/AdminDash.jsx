import React, { useEffect, useState } from "react";
import { BiDollarCircle, BiCar } from "react-icons/bi";
import { BsTruck, BsGraphUp, BsCarFrontFill, BsFileText, BsClipboardCheck } from "react-icons/bs";
import { FaCreditCard, FaUserFriends, FaChartPie, FaRegChartBar } from "react-icons/fa";
import { MdOutlineLocalShipping, MdDashboard } from "react-icons/md";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { getAllDrivers, getAllVehicles } from "../../../api/adminDashApi";
import { getAssignedDeliveries, getOrdersForAssignment } from "../../../api/deliveryAssignApi";
import { getCompletedOrders } from "../../../api/deliveryReportApi";
// Removed notifications imports as per request

const AdminDash = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  // Removed notification state

  useEffect(() => {
    const fetchDashData = async () => {
      try {
        setLoading(true);
        const [driversRes, vehiclesRes, assignedRes, readyRes, completedRes] = await Promise.all([
          getAllDrivers(),
          getAllVehicles(),
          getAssignedDeliveries(),
          getOrdersForAssignment(),
          getCompletedOrders(),
        ]);

        setDrivers(driversRes.data || []);
        setVehicles(vehiclesRes.data || []);

        // Active deliveries are those that are "Assigned" or "In Transit"
        const activeDeliveries = assignedRes.data.filter((d) => d.status === "Assigned" || d.status === "In Transit").length;
        setActiveDeliveriesCount(activeDeliveries);

        // Pending Orders card = orders that are paid and not yet assigned
        setPendingOrdersCount((readyRes.data || []).length);
        setCompletedOrdersCount(completedRes.data.length);

        // Removed notifications usage
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();

    // Removed notifications polling
    return () => {};
  }, []);

  // Calculate available drivers and vehicles
  const availableDrivers = drivers.filter((d) => d.driveravailability === "Available").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;

  // Removed notification handlers

  // Create dynamic data for the Delivery Summary Pie Chart
  const deliveryData = [
    { name: "Pending", value: pendingOrdersCount, color: "#FFB300" },
    { name: "In Transit", value: activeDeliveriesCount, color: "#8BC34A" },
    { name: "Delivered", value: completedOrdersCount, color: "#4CAF50" },
  ];

  // Dummy data for the Payments Summary chart
  const paymentsData = [
    { name: "Completed", value: 75, color: "#4CAF50" },
    { name: "Pending", value: 25, color: "#8BC34A" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Delivery Admin Dashboard</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Manage deliveries, orders, vehicles and driver assignments all in one place</p>
        </div>

        {loading ? (
          <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
                <div
                  className="h-16 w-16 absolute top-4 left-4 rounded-full border-t-4 border-green-300 animate-spin"
                  style={{ animationDirection: "reverse" }}
                ></div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-700">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Delivery Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* Active Deliveries Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-green-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg mr-3">
                            <BsTruck className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Active Deliveries</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{activeDeliveriesCount}</p>
                        <p className="text-xs text-gray-500 mt-2">Currently In Transit</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <Link
                      to="/DeliveryManagement/delivery-assign"
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center"
                    >
                      View Deliveries{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Pending Orders Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-yellow-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg mr-3">
                            <BsClipboardCheck className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Pending Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{pendingOrdersCount}</p>
                        <p className="text-xs text-gray-500 mt-2">Waiting for assignment</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-5 py-2 border-t border-yellow-100">
                    <Link
                      to="/DeliveryManagement/delivery-assign"
                      className="text-xs font-medium text-yellow-700 hover:text-yellow-800 flex items-center"
                    >
                      Assign Orders{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Completed Orders Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg mr-3">
                            <BsClipboardCheck className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Completed Orders</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{completedOrdersCount}</p>
                        <p className="text-xs text-gray-500 mt-2">Successfully delivered</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-2 border-t border-blue-100">
                    <Link
                      to="/DeliveryManagement/delivery-reports"
                      className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center"
                    >
                      View Reports{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Available Drivers Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-lg mr-3">
                            <FaUserFriends className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Available Drivers</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{availableDrivers}</p>
                        <p className="text-xs text-gray-500 mt-2">Ready for assignment</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-2 border-t border-purple-100">
                    <Link to="/DeliveryManagement/driver" className="text-xs font-medium text-purple-700 hover:text-purple-800 flex items-center">
                      Manage Drivers{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Available Vehicles Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-indigo-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 p-2 rounded-lg mr-3">
                            <BsCarFrontFill className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Available Vehicles</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{availableVehicles}</p>
                        <p className="text-xs text-gray-500 mt-2">Ready for use</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-5 py-2 border-t border-indigo-100">
                    <Link to="/admin/vehicles" className="text-xs font-medium text-indigo-700 hover:text-indigo-800 flex items-center">
                      Manage Vehicles{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Quick Navigation</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Link
                  to="/DeliveryManagement/delivery-assign"
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-green-200 group"
                >
                  <div className="p-8 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-full p-4 mb-4 shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      <MdOutlineLocalShipping className="text-white text-3xl" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Assign Deliveries</h3>
                    <p className="text-sm text-gray-500 text-center">Assign orders to available drivers</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-t border-green-100">
                    <span className="text-xs font-medium text-green-700 flex items-center justify-center">
                      Manage Assignments
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>

                <Link
                  to="/DeliveryManagement/delivery-reports"
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-200 group"
                >
                  <div className="p-8 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-full p-4 mb-4 shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      <FaRegChartBar className="text-white text-3xl" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Delivery Reports</h3>
                    <p className="text-sm text-gray-500 text-center">View delivery performance metrics</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-t border-blue-100">
                    <span className="text-xs font-medium text-blue-700 flex items-center justify-center">
                      View Analytics
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>

                <Link
                  to="/DeliveryManagement/driver"
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-purple-200 group"
                >
                  <div className="p-8 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-full p-4 mb-4 shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      <FaUserFriends className="text-white text-3xl" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Driver Management</h3>
                    <p className="text-sm text-gray-500 text-center">Manage driver details and status</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-t border-purple-100">
                    <span className="text-xs font-medium text-purple-700 flex items-center justify-center">
                      Manage Drivers
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>

                <Link
                  to="/admin/vehicles"
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 group"
                >
                  <div className="p-8 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full p-4 mb-4 shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      <BsCarFrontFill className="text-white text-3xl" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Vehicle Management</h3>
                    <p className="text-sm text-gray-500 text-center">Track and maintain fleet vehicles</p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-3 border-t border-indigo-100">
                    <span className="text-xs font-medium text-indigo-700 flex items-center justify-center">
                      Manage Fleet
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>

                <Link
                  to="/admin/accident-reports"
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-red-200 group"
                >
                  <div className="p-8 flex flex-col items-center">
                    <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-full p-4 mb-4 shadow-md group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      <BsFileText className="text-white text-3xl" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Accident Reports</h3>
                    <p className="text-sm text-gray-500 text-center">View and respond to accident reports</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 border-t border-red-100">
                    <span className="text-xs font-medium text-red-700 flex items-center justify-center">
                      View Reports
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Analytics Overview</h2>
              <div className="grid grid-cols-1 gap-8">
                {/* Delivery Summary Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaChartPie className="text-blue-600 mr-2" /> Delivery Summary
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 font-medium">
                      Current Status
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-center">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={deliveryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          >
                            {deliveryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} Orders`, name]} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-6 md:mt-0 md:ml-8">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2 shadow-sm"></span>
                            <span className="text-sm text-gray-600 font-medium">Pending Orders ({pendingOrdersCount})</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-green-500 mr-2 shadow-sm"></span>
                            <span className="text-sm text-gray-600 font-medium">In Transit ({activeDeliveriesCount})</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-4 h-4 rounded-full bg-green-700 mr-2 shadow-sm"></span>
                            <span className="text-sm text-gray-600 font-medium">Delivered ({completedOrdersCount})</span>
                          </div>
                        </div>
                        <Link
                          to="/DeliveryManagement/delivery-reports"
                          className="inline-flex items-center text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 mt-6"
                        >
                          View Detailed Reports
                          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDash;
