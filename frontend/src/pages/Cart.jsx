import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import { getCart, updateCartItemQuantity, removeCartItem } from '../api/cartApi';
import { createOrder } from '../api/orderApi';

const TEST_CUSTOMER_ID = "68cd012dfe7ed10e950e0f6b";

const Cart = () => {
    const customerId = TEST_CUSTOMER_ID
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await getCart();
            setCartItems(response.data.items || []);
        } catch (err) {
            console.error("Error fetching cart:", err);
            
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            toast.error("Quantity cannot be less than 1.");
            return;
        }
        try {
            await updateCartItemQuantity(itemId, newQuantity);
            await fetchCartItems();
        } catch (err) {
            console.error("Error updating quantity:", err);
            toast.error("Failed to update item quantity.");
        }
    };

    const handleRemoveItem = async (itemId) => {
        const isConfirmed = window.confirm("Are you sure you want to remove this item from the cart?");
        if(isConfirmed){
            try {
            await removeCartItem(itemId);
            toast.success("Item removed from cart!");
            await fetchCartItems();
        } catch (err) {
            console.error("Error removing item:", err);
            toast.error("Failed to remove item from cart.");
        }
        }
    };

    //handleCheckout function
    const handleCheckout = async () => {
        if (!customerId) {
            toast.error("Please log in to place an order.");
            return;
        }

        try {
            // Call API to create the order
            await createOrder(customerId);

            toast.success("Order placed successfully! Redirecting to your orders.");
            // Navigate to the new orders page, passing the customer ID
            navigate(`/orders/${customerId}`);

        } catch (err) {
            console.error("Error creating order:", err);
            toast.error("Failed to place your order. Please try again.");
        }
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.totalPrice, 0);
    };

    if (loading) {
        return <div className="text-center p-6 text-xl">Loading your cart...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-6">
                <Toaster position="top-right" reverseOrder={false} />
                <h1 className="text-4xl font-bold text-center my-8 text-gray-800">Your Cart</h1>
                
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10">
                        <p className="text-center text-gray-500 text-lg mb-4">Your cart is empty.</p>
                        <button
                            onClick={handleContinueShopping}
                            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-md"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cartItems.map((item) => (
                                <div key={item.itemId} className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-md p-4">
                                    <div className="flex w-full items-start mb-4">
                                        <img src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, '/')}`} alt={item.itemName} className="h-24 w-24 object-cover rounded-md mr-4" />
                                        <div className="flex-grow">
                                            <h2 className="text-xl font-semibold">{item.itemName}</h2>
                                            <p className="text-gray-600">Price: Rs. {item.pricePerItem}</p>
                                            <p className="text-gray-600">Total: Rs. {item.totalPrice}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between w-full items-center">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)}
                                                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl hover:bg-gray-300"
                                            >
                                                -
                                            </button>
                                            <span className="text-xl font-semibold">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
                                                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveItem(item.itemId)}
                                            className="bg-red-500 text-white w-10 h-10 rounded-md flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col items-end border-t pt-4 space-y-4">
                            <h2 className="text-2xl font-bold">Cart Total: Rs. {calculateTotal()}</h2>
                            <div className="flex justify-between w-full">
                                <button
                                    onClick={handleContinueShopping}
                                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-md"
                                >
                                    Continue Shopping
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;