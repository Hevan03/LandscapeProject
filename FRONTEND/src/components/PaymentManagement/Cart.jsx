import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItemQuantity, removeCartItem } from "../../api/cartApi";
import { createOrder } from "../../api/orderApi";
import AuthContext from "../../context/AuthContext";

const Cart = () => {
  const auth = useContext(AuthContext);
  const customerId = auth?.user?._id || auth?.user?.id;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await getCart(customerId);
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItemQuantity(itemId, newQuantity, customerId);
      await fetchCartItems();
    } catch (err) {}
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId, customerId);
      await fetchCartItems();
    } catch (err) {}
  };

  const handleCheckout = async () => {
    if (!customerId) {
      toast.error("Please log in to continue.");
      return;
    }

    try {
      if (!cartItems || cartItems.length === 0) {
        toast.error("Your cart is empty.");
        return;
      }
      // 1) Create a pending order first
      const resp = await createOrder({
        customerId,
        items: cartItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          pricePerItem: item.pricePerItem,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          imageUrl: item.imageUrl,
        })),
        totalAmount: calculateTotal(),
      });

      const createdOrder = resp?.data?.order;
      if (!createdOrder?._id) {
        throw new Error("Order creation failed");
      }

      // 2) Redirect to payment portal; only after successful payment the order becomes 'Paid'
      navigate(`/paymentportal`, {
        state: {
          amount: calculateTotal(),
          orderId: createdOrder._id,
          orderType: "order",
          returnUrl: `/orders/${customerId}`,
        },
      });
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800 mb-0 pb-3">
            Your Shopping Cart
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">Review your items, update quantities, or proceed to checkout</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
              <div
                className="h-16 w-16 absolute top-2 left-2 rounded-full border-t-4 border-green-300 animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <span className="ml-4 text-lg text-gray-600 font-medium">Loading your cart...</span>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet. Discover our amazing products and start shopping!
            </p>
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 py-4 px-6 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">Cart Items ({cartItems.length})</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.itemId} className="p-6 flex flex-col sm:flex-row items-start gap-6 hover:bg-gray-50 transition-colors">
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, "/")}`}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{item.itemName}</h3>
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                          aria-label="Remove item"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="text-gray-600">
                        <p>
                          Price: <span className="font-medium">Rs. {item.pricePerItem.toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-end pt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                            className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-1 font-medium text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                            className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        <div className="font-bold text-lg text-green-600">Rs. {item.totalPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200 py-4 px-6 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-green-600">Rs. {calculateTotal().toLocaleString()}</span>
                </div>

                <div className="pt-6 space-y-3 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row sm:justify-end">
                  <button
                    onClick={handleContinueShopping}
                    className="px-6 py-3 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
