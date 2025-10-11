import React, { useEffect, useState } from "react";
import { updateRentalOrderStatusAPI } from "../../api/orderApi";
import toast from "react-hot-toast";

const RentalInventoryOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/rental-orders");
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
      const res = await updateRentalOrderStatusAPI(orderId, newStatus);
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
        Rental Orders Management
      </h2>

      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Customer</th>
            <th className="px-4 py-2 border">Machine</th>
            <th className="px-4 py-2 border">Quantity</th>
            <th className="px-4 py-2 border">Duration</th>
            <th className="px-4 py-2 border">Total Price</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Rented At</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="px-4 py-2 border">
                {order.customerId?.name || "N/A"}
              </td>
              <td className="px-4 py-2 border">{order.machine?.name}</td>
              <td className="px-4 py-2 border">{order.quantity}</td>
              <td className="px-4 py-2 border">{order.duration} days</td>
              <td className="px-4 py-2 border">Rs.{order.totalPrice}</td>
              <td className="px-4 py-2 border">{order.status}</td>
              <td className="px-4 py-2 border">
                {new Date(order.rentedAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 border space-x-2">
                <button
                  onClick={() => handleStatusChange(order._id, "Pending")}
                  className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange(order._id, "Active")}
                  className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-white"
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange(order._id, "Returned")}
                  className="px-3 py-1 bg-gray-500 rounded hover:bg-gray-600 text-white"
                >
                  Returned
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentalInventoryOrders;
