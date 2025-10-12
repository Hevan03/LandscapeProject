import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import { getItemById } from "../../api/itemApi";
import { createOrder } from "../../api/orderApi";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const customerId = auth?.user?._id || auth?.user?.id;

  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      console.log("Fetching item with ID:", id);
      try {
        setLoading(true);
        const resp = await getItemById(id);
        // Backend returns { item: {...} } for get-by-id. Fall back to resp.data for safety.
        const data = resp?.data?.item || resp?.data;
        setItem(data);
        // Initialize qty within stock bounds
        const initialQty = Number(data?.quantity) > 0 ? 1 : 0;
        setQty(initialQty);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        toast.error("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const increase = () => {
    if (!item) return;
    setQty((q) => Math.min(q + 1, item.quantity || 1));
  };

  const decrease = () => {
    setQty((q) => Math.max(q - 1, 1));
  };

  const totalAmount = item ? (item.price || 0) * (qty || 0) : 0;

  const handleBuyNow = async () => {
    if (!customerId) {
      toast.error("Please log in to continue.");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    if (!item) return;
    if (qty < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (qty > item.quantity) {
      toast.error("Requested quantity exceeds available stock");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerId,
        items: [
          {
            itemId: item._id,
            itemName: item.itemname,
            pricePerItem: item.price,
            quantity: qty,
            totalPrice: item.price * qty,
            imageUrl: item.imageUrl,
          },
        ],
        totalAmount: totalAmount,
      };

      const resp = await createOrder(payload);
      const createdOrder = resp?.data?.order;
      if (!createdOrder?._id) throw new Error("Order creation failed");

      navigate(`/paymentportal`, {
        state: {
          amount: totalAmount,
          orderId: createdOrder._id,
          orderType: "order",
          returnUrl: `/orders/${customerId}`,
        },
      });
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
              <div
                className="h-16 w-16 absolute top-2 left-2 rounded-full border-t-4 border-green-300 animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <span className="ml-4 text-lg text-gray-600 font-medium">Loading product...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for may have been removed.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inStock = (item.quantity || 0) > 0;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="hover:text-green-700 text-green-600">
            &larr; Back to shop
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 md:p-8 bg-gray-50 flex items-center justify-center">
            <img
              src={item?.imageUrl?.startsWith("http") ? item.imageUrl : `http://localhost:5001/${(item?.imageUrl || "").replace(/\\/g, "/")}`}
              alt={item.itemname}
              className="w-full h-auto max-h-[480px] object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
              }}
            />
          </div>

          <div className="p-6 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{item.itemname}</h1>
            <p className="text-gray-600 mb-4">{item.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-extrabold text-green-600">Rs. {Number(item.price || 0).toLocaleString()}</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${inStock ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                {inStock ? `${item.quantity} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center w-40 border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={decrease} className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200" disabled={!inStock}>
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  max={item.quantity || 1}
                  onChange={(e) => {
                    const val = Number(e.target.value || 1);
                    if (Number.isNaN(val)) return;
                    setQty(Math.min(Math.max(val, 1), item.quantity || 1));
                  }}
                  className="w-full text-center py-2 outline-none"
                  disabled={!inStock}
                />
                <button onClick={increase} className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200" disabled={!inStock}>
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="mb-8">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">Rs. {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                disabled={!inStock || submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md transition-all duration-300 disabled:opacity-60"
              >
                {submitting ? "Processing..." : "Buy Now"}
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 px-6 py-3 border border-green-600 text-green-700 font-medium rounded-lg hover:bg-green-50"
              >
                Go to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
