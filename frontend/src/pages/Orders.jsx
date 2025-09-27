import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../component/Navbar";
import { getOrdersByCustomer, cancelOrder, getRentalOrdersByCustomer, cancelRentalOrder   } from '../api/orderApi'; 
import toast, { Toaster } from 'react-hot-toast';

const Orders = () => {
    const { customerId } = useParams(); 
    const [orders, setOrders] = useState([]);
    const [rentalOrders, setRentalOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const getStatusBadgeClasses = (status) => {
        switch(status) {
            case "Pending": return "bg-yellow-100 text-yellow-800";
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!customerId) {
                toast.error("Customer ID is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);

                //Fetch shop orders
                const response = await getOrdersByCustomer(customerId);
                setOrders(response.data);

                //Fetch rental orders
                const rentalResponse = await getRentalOrdersByCustomer(customerId);
                setRentalOrders(rentalResponse.data);

            } catch (err) {
                console.error("Error fetching orders:", err);
                toast.error("Failed to load your orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [customerId]);

    const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel and refund this order?")) return;

    try {
        await cancelOrder(orderId);
        toast.success("Order cancelled & refunded.");
        setOrders((prev) => prev.filter((o) => o._id !== orderId)); // remove from UI
    } catch (err) {
        console.error("Error cancelling order:", err);
        toast.error("Failed to cancel order.");
    }
};

    const handleCancelRental = async (orderId) => {
  if (!window.confirm("Are you sure you want to cancel and refund this rental order?")) return;

  try {
    await cancelRentalOrder(orderId);
    toast.success("Rental order cancelled & refunded.");
    setRentalOrders((prev) => prev.filter((o) => o._id !== orderId));
  } catch (err) {
    console.error("Error cancelling rental order:", err);
    toast.error("Failed to cancel rental order.");
  }
};

    if (loading) {
        return <div className="text-center p-6 text-xl">Loading your orders...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-6">
                <Toaster position="top-right" reverseOrder={false} />

                {/* Shop Orders Section */}
                <h1 className="text-4xl font-bold text-center my-8 text-gray-800">My Shop Orders</h1>
                {orders.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">You have no past orders.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-semibold">Order ID: {order._id}</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2">Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                                <p className="text-lg font-bold mb-4">Total Amount: Rs. {order.totalAmount}</p>

                                <h3 className="text-xl font-bold mb-2">Items:</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {order.items.map((item) => (
                                        <li key={item.itemId} className="flex items-center space-x-4">
                                            <img src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, '/')}`} alt={item.itemName} className="h-16 w-16 object-cover rounded-md" />
                                            <div>
                                                <p className="font-semibold">{item.itemName}</p>
                                                <p className="text-gray-600">Quantity: {item.quantity} | Price: Rs. {item.totalPrice}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                               {order.status === "Pending" && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel & Refund
                  </button>
                )}             

                            </div>
                        ))}
                    </div>
                )}

                {/* Rental Orders Section */}
    <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-700">Rental Orders</h2>
    {rentalOrders.length === 0 ? (
        <p className="text-gray-500">No rental orders found.</p>
    ) : (
        <div className="space-y-6">
            {rentalOrders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold">Order ID: {order._id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-gray-600 mb-2">Rented At: {new Date(order.rentedAt).toLocaleDateString()}</p>
                    <p className="text-lg font-bold mb-2">Total Amount: Rs. {order.totalPrice}</p>

                    <h4 className="text-xl font-bold mb-2">Machine:</h4>
                    <p className="text-gray-700">{order.machine?.name}</p>
                    <p className="text-gray-600">Quantity: {order.quantity} | Duration: {order.duration} days
                    </p>

                    {/* Cancel Button */}
        {order.status === "Pending" && (
          <button
            onClick={() => handleCancelRental(order._id)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel & Refund
          </button>
        )}
                </div>
            ))}
            </div>
            )}
            </div>
                

            </div>
                

        

        
    );
};

export default Orders;