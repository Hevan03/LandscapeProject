import React, { useEffect, useState } from "react";
import { BiDollarCircle, BiCar } from "react-icons/bi";
import { BsTruck, BsGraphUp, BsCarFrontFill, BsFileText, BsClipboardCheck, BsBell } from "react-icons/bs";
import { FaCreditCard, FaUserFriends } from "react-icons/fa";
import { MdOutlineLocalShipping } from "react-icons/md";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getAllDrivers, getAllVehicles } from "../../../api/adminDashApi";
import { getAssignedDeliveries, getOrdersForAssignment } from "../../../api/deliveryAssignApi";
import { getCompletedOrders } from "../../../api/deliveryReportApi";
import { getNotifications, markNotificationAsRead } from "../../../api/inventoryPaymentApi";

const AdminDash = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchDashData = async () => {
      try {
        setLoading(true);
        const [driversRes, vehiclesRes, assignedRes, readyRes, completedRes, notificationsRes] = await Promise.all([
          getAllDrivers(),
          getAllVehicles(),
          getAssignedDeliveries(),
          getOrdersForAssignment(),
          getCompletedOrders(),
          getNotifications().catch((error) => {
            console.error("Failed to fetch notifications:", error);
            return { data: [] };
          }), // Handle notifications gracefully
        ]);

        setDrivers(driversRes.data || []);
        setVehicles(vehiclesRes.data || []);

        // Active deliveries are those that are "Assigned" or "In Transit"
        const activeDeliveries = assignedRes.data.filter((d) => d.status === "Assigned" || d.status === "In Transit").length;
        setActiveDeliveriesCount(activeDeliveries);

        // Pending Orders card = orders that are paid and not yet assigned
        setPendingOrdersCount((readyRes.data || []).length);
        setCompletedOrdersCount(completedRes.data.length);

        // Handle notifications - show payment and accident notifications on dashboard
        const allNotifications = notificationsRes.data || [];
        const dashboardNotifications = allNotifications.filter((n) => n.type === "payment_received" || n.type === "accident_reported");
        setNotifications(dashboardNotifications);
        const unreadCount = dashboardNotifications.filter((n) => !n.isRead).length;
        setUnreadNotifications(unreadCount);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();

    // Set up polling for notifications every 30 seconds
    const interval = setInterval(fetchDashData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate available drivers and vehicles
  const availableDrivers = drivers.filter((d) => d.availability === "Available").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;

  // Handle notification actions
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(unreadNotifications.map((n) => markNotificationAsRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

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
    <div className="min-h-screen">
      <div className="bg-gray-100 min-h-screen p-8 font-sans">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-3">
            {unreadNotifications > 0 && (
              <div className="flex items-center space-x-2">
                <div className="badge badge-error badge-lg">{unreadNotifications} New</div>
                <button onClick={handleMarkAllAsRead} className="btn btn-sm btn-outline">
                  Mark All Read
                </button>
              </div>
            )}
            <Link to="/admin/notifications" className="btn btn-success btn-sm flex items-center">
              <BsBell className="mr-2" />
              {unreadNotifications > 0 && <span className="badge badge-error badge-sm ml-2">{unreadNotifications}</span>}
            </Link>
          </div>
        </div>

        {/* Recent Notifications Section (Limited) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <BsBell className="mr-2 text-blue-600" />
            Recent Notifications
            {unreadNotifications > 0 && <span className="badge badge-error badge-sm ml-2">{unreadNotifications}</span>}
          </h2>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification._id}
                  className={`alert ${notification.isRead ? "alert-info" : "bg-green-100 border-green-300 text-green-800"} shadow-lg`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{notification.message}</h3>
                        <p className="text-sm opacity-70">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                      {!notification.isRead && (
                        <button onClick={() => handleMarkAsRead(notification._id)} className="btn btn-sm btn-ghost">
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              <BsBell className="mr-2" />
              No notifications yet. You'll see payment notifications here when customers make payments.
            </div>
          )}

          {notifications.length > 3 && (
            <div className="text-center mt-4">
              <Link to="/admin/notifications" className="btn btn-outline btn-sm">
                View All Notifications ({notifications.length})
              </Link>
            </div>
          )}
        </div>

        {/* Main Grid for Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Deliveries Card */}
          <div className="card bg-white shadow-lg rounded-xl transition-transform transform hover:scale-105">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-700 text-white rounded-full p-3 shadow-lg">
                    <BsTruck size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-500">Active Deliveries</h2>
                    <p className="text-3xl font-bold text-green-700 mt-1">{loading ? "..." : activeDeliveriesCount}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">Currently In Transit</div>
            </div>
          </div>

          {/* Pending Orders Card (New) */}
          <div className="card bg-white shadow-lg rounded-xl transition-transform transform hover:scale-105">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 text-white rounded-full p-3 shadow-lg">
                    <BsClipboardCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-500">Pending Orders</h2>
                    <p className="text-3xl font-bold text-yellow-500 mt-1">{loading ? "..." : pendingOrdersCount}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">Waiting for assignment</div>
            </div>
          </div>

          {/* Completed Orders Card (New) */}
          <div className="card bg-white shadow-lg rounded-xl transition-transform transform hover:scale-105">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
                    <BsClipboardCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-500">Completed Orders</h2>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{loading ? "..." : completedOrdersCount}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">Successfully delivered</div>
            </div>
          </div>

          {/* Available Drivers Card */}
          <div className="card bg-white shadow-lg rounded-xl transition-transform transform hover:scale-105">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-700 text-white rounded-full p-3 shadow-lg">
                    <BiCar size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-500">Available Drivers</h2>
                    <p className="text-3xl font-bold text-green-700 mt-1">{loading ? "..." : availableDrivers}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">Ready for assignment</div>
            </div>
          </div>

          {/* Available Vehicles Card */}
          <div className="card bg-white shadow-lg rounded-xl transition-transform transform hover:scale-105">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-700 text-white rounded-full p-3 shadow-lg">
                    <BsGraphUp size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-500">Available Vehicles</h2>
                    <p className="text-3xl font-bold text-green-700 mt-1">{loading ? "..." : availableVehicles}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">Ready for use</div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="divider text-gray-500 font-bold text-lg mb-6">Quick Navigation</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/Orders/create" className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl">
            <div className="card-body flex items-center justify-center p-6">
              <BsFileText size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Create Order</p>
            </div>
          </Link>
          <Link
            to="/DeliveryManagement/delivery-assign"
            className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="card-body flex items-center justify-center p-6">
              <MdOutlineLocalShipping size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Assign Deliveries</p>
            </div>
          </Link>
          <Link
            to="/DeliveryManagement/delivery-reports"
            className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="card-body flex items-center justify-center p-6">
              <BsClipboardCheck size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Delivery Reports</p>
            </div>
          </Link>
          <Link
            to="/DeliveryManagement/driver"
            className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="card-body flex items-center justify-center p-6">
              <FaUserFriends size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Driver Management</p>
            </div>
          </Link>
          <Link to="/admin/vehicles" className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl">
            <div className="card-body flex items-center justify-center p-6">
              <BsCarFrontFill size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Vehicle Management</p>
            </div>
          </Link>
          {/* <Link
            to="/admin/AdminPaymentDashboard"
            className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="card-body flex items-center justify-center p-6">
              <FaCreditCard size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Payments Manage</p>
            </div>
          </Link> */}
          <Link
            to="/admin/accident-reports"
            className="card bg-white shadow-xl rounded-xl transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="card-body flex items-center justify-center p-6">
              <BsFileText size={48} className="text-green-700 mb-2" />
              <p className="text-center font-semibold text-gray-700">Accident Reports</p>
            </div>
          </Link>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payments Summary Chart */}
          <div className="card bg-white shadow-lg rounded-xl">
            <div className="card-body p-6">
              <h2 className="card-title text-xl text-gray-700 mb-4">Payments Summary</h2>
              <div className="flex flex-col md:flex-row items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={paymentsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-col mt-4 md:mt-0 md:ml-8">
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 rounded-full bg-green-700 mr-2"></span>
                    <span className="text-gray-600">Completed Payments</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-gray-600">Pending Payments</span>
                  </div>
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <a
                  href="/AdminPaymentDashboard"
                  className="btn btn-sm text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-300 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                >
                  View History
                </a>
              </div>
            </div>
          </div>

          {/* Delivery Summary Chart */}
          <div className="card bg-white shadow-lg rounded-xl">
            <div className="card-body p-6">
              <h2 className="card-title text-xl text-gray-700 mb-4">Delivery Summary</h2>
              <div className="flex flex-col md:flex-row items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deliveryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deliveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-col mt-4 md:mt-0 md:ml-8">
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-gray-600">In Transit</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-700 mr-2"></span>
                    <span className="text-gray-600">Delivered</span>
                  </div>
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <a
                  href="/DeliveryManagement/delivery-assign"
                  className="btn btn-sm text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-300 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                >
                  Assign Deliveries
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
