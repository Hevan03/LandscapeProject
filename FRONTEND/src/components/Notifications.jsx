import React, { useEffect, useState } from "react";
import { BsBell, BsCheckCircle, BsExclamationTriangle, BsTruck } from "react-icons/bs";
import { FaCreditCard } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getNotifications, markNotificationAsRead } from "../api_endpoint/notificationAPI";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, payment, accident

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      console.log("Notification marked as read:", notificationId);
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(unreadNotifications.map((n) => markNotificationAsRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment_received":
        return <FaCreditCard className="text-green-600" />;
      case "delivery_assigned":
        return <BsTruck className="text-blue-600" />;
      case "accident_reported":
        return <BsExclamationTriangle className="text-red-600" />;
      default:
        return <BsBell className="text-green-600" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return "bg-white border border-gray-200 text-gray-700";
    switch (type) {
      case "payment_received":
        return "bg-green-50 border-green-200 text-green-800";
      case "delivery_assigned":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "accident_reported":
        return "bg-red-50 border-red-200 text-gray-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "payment") return notification.type === "payment_received";
    if (filter === "accident") return notification.type === "accident_reported";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white min-h-screen p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-green-500"></span>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
              <BsBell className="mr-3 text-green-600" />
              Notifications
            </h1>
            <p className="text-gray-500 mt-2">
              {unreadCount > 0 ? <span className="font-medium text-green-600">{unreadCount} unread notifications</span> : "All caught up!"}
            </p>
          </div>
          <div className="flex space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                <BsCheckCircle className="mr-1" />
                Mark All Read
              </button>
            )}
            <Link
              to="/admin/driver-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-700 to-green-500 text-white rounded-lg shadow hover:from-green-800 hover:to-green-600 transition-all duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              filter === "all" ? "bg-green-600 text-white shadow" : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              filter === "unread" ? "bg-green-600 text-white shadow" : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              filter === "payment" ? "bg-green-600 text-white shadow" : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setFilter("payment")}
          >
            Payments
          </button>
          <button
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              filter === "accident" ? "bg-green-600 text-white shadow" : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
            }`}
            onClick={() => setFilter("accident")}
          >
            Accidents
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-4 p-5 rounded-xl shadow border ${getNotificationColor(
                  notification.type,
                  notification.isRead
                )} transition-all duration-200`}
              >
                <div className="flex-shrink-0 mt-1 text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-md">{notification.message}</h3>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="ml-4 px-5 mt-[5px] py-[10px] bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium text-xs shadow hover:from-green-600 hover:to-green-700 transition-all duration-200"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BsBell className="mx-auto text-6xl text-green-200 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">{filter === "all" ? "No notifications yet" : `No ${filter} notifications`}</h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "You'll see notifications here when customers make payments or report accidents."
                : `No ${filter} notifications found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
