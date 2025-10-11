import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getOrdersByCustomer, cancelOrder, getRentalOrdersByCustomer, cancelRentalOrder } from "../../api/orderApi";
import toast, { Toaster } from "react-hot-toast";

const Orders = () => {
  const { customerId } = useParams();
  const [orders, setOrders] = useState([]);
  const [rentalOrders, setRentalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shop");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) {
        toast.error("Customer ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // Fetch shop orders
        const response = await getOrdersByCustomer(customerId);
        setOrders(response.data);

        // Fetch rental orders
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Completed":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "Cancelled":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
            <div
              className="h-16 w-16 absolute top-4 left-4 rounded-full border-t-4 border-green-300 animate-spin"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading your order history...</p>
        </div>
      </div>
    );
  }

  const hasShopOrders = orders.length > 0;
  const hasRentalOrders = rentalOrders.length > 0;
  const hasNoOrders = !hasShopOrders && !hasRentalOrders;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Your Orders</span>
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">View and manage all your purchase and rental history in one place</p>
        </div>

        {/* Tabs */}
        {!hasNoOrders && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm bg-white p-1">
              <button
                onClick={() => setActiveTab("shop")}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "shop" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                Shop Orders{" "}
                {hasShopOrders && <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{orders.length}</span>}
              </button>
              <button
                onClick={() => setActiveTab("rental")}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === "rental" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                Rental Orders{" "}
                {hasRentalOrders && <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{rentalOrders.length}</span>}
              </button>
            </div>
          </div>
        )}

        {/* No Orders */}
        {hasNoOrders && (
          <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet. Browse our products and start shopping!</p>
            <a
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </a>
          </div>
        )}

        {/* Shop Orders */}
        {activeTab === "shop" && !hasNoOrders && (
          <div className="space-y-6">
            {!hasShopOrders ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Shop Orders Yet</h3>
                <p className="text-gray-500 mb-4">Looks like you haven't purchased any products yet.</p>
                <a href="/shop" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center">
                  Browse Shop
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg">
                  {/* Order Header */}
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Order Placed</div>
                        <div className="font-medium">
                          {new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Order ID</div>
                        <div className="font-mono text-sm">{order._id.substring(order._id.length - 10)}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                        <div className="text-lg font-bold text-green-600">Rs. {order.totalAmount.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Order Items
                    </h3>

                    <ul className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <li key={item.itemId} className="py-4 flex items-center space-x-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, "/")}`}
                              alt={item.itemName}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{item.itemName}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × Rs. {(item.totalPrice / item.quantity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="font-medium text-gray-900">Rs. {item.totalPrice.toLocaleString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    {order.status === "Pending" && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleCancel(order._id)}
                          className="inline-flex items-center px-4 py-2 bg-white border border-red-300 rounded-md font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel & Request Refund
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rental Orders */}
        {activeTab === "rental" && !hasNoOrders && (
          <div className="space-y-6">
            {!hasRentalOrders ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Rental Orders Yet</h3>
                <p className="text-gray-500 mb-4">You haven't rented any equipment or machinery yet.</p>
                <a href="/rentals" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center">
                  Browse Equipment Rentals
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ) : (
              rentalOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg">
                  {/* Order Header */}
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rental Date</div>
                        <div className="font-medium">
                          {new Date(order.rentedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rental ID</div>
                        <div className="font-mono text-sm">{order._id.substring(order._id.length - 10)}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                        <div className="text-lg font-bold text-green-600">Rs. {order.totalPrice.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rental Details */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                        />
                      </svg>
                      Rental Information
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4 mb-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Machine Name</p>
                          <p className="font-medium text-gray-900">{order.machine?.name || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-medium text-gray-900">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rental Duration</p>
                          <p className="font-medium text-gray-900">{order.duration} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Daily Rate</p>
                          <p className="font-medium text-gray-900">Rs. {(order.totalPrice / order.duration).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {order.status === "Pending" && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleCancelRental(order._id)}
                          className="inline-flex items-center px-4 py-2 bg-white border border-red-300 rounded-md font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel & Request Refund
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
