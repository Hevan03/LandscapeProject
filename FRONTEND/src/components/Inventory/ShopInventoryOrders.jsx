import React, { useEffect, useState } from "react";
import { updateOrderStatusAPI } from "../../api/orderApi";
import toast from "react-hot-toast";

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

const ShopInventoryOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/orders/all");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatusAPI(orderId, newStatus);
      toast.success("Order status updated");
      const updated = res.data?.order || res.data;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Shop Orders Management</h2>
          <p className="mt-2 text-gray-600">Review and update shop order statuses.</p>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerId?.name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rs. {order.totalAmount?.toLocaleString?.() || order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.orderDate).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleStatusChange(order._id, "Pending")}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100"
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusChange(order._id, "Paid")}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-green-300 text-green-800 bg-green-50 hover:bg-green-100"
                        >
                          Paid
                        </button>
                        <button
                          onClick={() => handleStatusChange(order._id, "Assigned")}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100"
                        >
                          Assigned
                        </button>
                        <button
                          onClick={() => handleStatusChange(order._id, "In Transit")}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-indigo-300 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                        >
                          In Transit
                        </button>
                        <button
                          onClick={() => handleStatusChange(order._id, "Delivered")}
                          className="inline-flex items-center px-3 py-1.5 rounded-md border border-purple-300 text-purple-800 bg-purple-50 hover:bg-purple-100"
                        >
                          Delivered
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopInventoryOrders;
