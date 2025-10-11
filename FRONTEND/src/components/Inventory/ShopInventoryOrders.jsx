import React, { useEffect, useState } from "react";
import { updateOrderStatusAPI } from "../../api/orderApi";
import toast from "react-hot-toast";

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
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-green-800 text-center">
        Shop Orders Management
      </h2>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Customer</th>
            <th className="px-4 py-2 border">Total Amount</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Order Date</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="px-4 py-2 border">
                {order.customerId?.name || "N/A"}
              </td>
              <td className="px-4 py-2 border">Rs.{order.totalAmount}</td>
              <td className="px-4 py-2 border">{order.status}</td>
              <td className="px-4 py-2 border">
                {new Date(order.orderDate).toLocaleString()}
              </td>
              <td className="px-4 py-2 border space-x-2">
                <button
                  onClick={() => handleStatusChange(order._id, "Pending")}
                  className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange(order._id, "Completed")}
                  className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-white"
                >
                  Completed
                </button>
                <button
                  onClick={() => handleStatusChange(order._id, "Cancelled")}
                  className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                >
                  Cancelled
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShopInventoryOrders;
