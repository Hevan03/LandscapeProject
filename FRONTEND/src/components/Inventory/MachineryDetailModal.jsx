import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const MachineryDetailModal = ({ machine, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(machine.defaultDurationDays);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const customerId = auth?.user?.id || auth?.user?._id || auth?.user?.customerId;

  useEffect(() => {
    // Calculate total price based on quantity and duration
    const price = machine.rentalPricePerDay * quantity * duration;
    setTotalPrice(price);
  }, [quantity, duration, machine]);

  useEffect(() => {
    // Disable scrolling on the body when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= machine.quantity) {
      setQuantity(value);
    }
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= machine.defaultDurationDays) {
      setDuration(value);
    }
  };

  const handleProceedToPayment = async () => {
    try {
      // Require login before creating a rental order
      if (!customerId) {
        showErrorMessage("Please log in to continue with payment.");
        navigate("/login", { state: { from: "/landscaper/rentals" } });
        return;
      }

      setIsSubmitting(true);
      const response = await fetch("http://localhost:5001/api/rental-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: machine._id,
          customerId,
          quantity,
          duration,
          totalPrice,
        }),
      });

      if (!response.ok) throw new Error("Failed to create rental order");

      const data = await response.json();
      const created = data?.order || data; // support either { order } or direct object
      const orderId = created?._id || created?.id;
      const total = created?.totalPrice ?? totalPrice;

      if (!orderId) throw new Error("Rental order ID missing in response");

      // Redirect to inventory payment portal with prefilled query immediately
      navigate(
        `/payment-management/inventory?orderId=${encodeURIComponent(orderId)}&customerId=${encodeURIComponent(
          customerId
        )}&totalAmount=${encodeURIComponent(total)}`
      );
    } catch (error) {
      showErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // success toast helper removed (unused)

  const showErrorMessage = (message) => {
    const errorElement = document.createElement("div");
    errorElement.className = "fixed top-5 right-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50 animate-fadeIn";
    errorElement.innerHTML = `
      <div class="flex items-center">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(errorElement);
    setTimeout(() => {
      errorElement.classList.add("animate-fadeOut");
      setTimeout(() => document.body.removeChild(errorElement), 500);
    }, 3000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === machine.imageUrl.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? machine.imageUrl.length - 1 : prev - 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Gallery */}
          <div className="relative h-72 md:h-96 bg-gray-100 dark:bg-gray-700">
            {machine.imageUrl && machine.imageUrl.length > 0 ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={`http://localhost:5001${machine.imageUrl[currentImageIndex]}`}
                    alt={`${machine.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
                    }}
                  />
                </div>
                {machine.imageUrl.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 transition-all"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 transition-all"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {machine.imageUrl.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === currentImageIndex ? "bg-white scale-110" : "bg-white bg-opacity-50 hover:bg-opacity-70"
                          }`}
                          aria-label={`View image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{machine.name}</h2>
                <div className="mt-2 inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  {machine.category || "Uncategorized"}
                </div>
              </div>
              <div className="mt-4 md:mt-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 px-4 py-2 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Daily Rental</p>
                <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">Rs. {machine.rentalPricePerDay.toLocaleString()}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{machine.description}</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Default Duration</h4>
                </div>
                <p className="mt-1 text-lg font-semibold text-blue-800 dark:text-blue-200">{machine.defaultDurationDays} Days</p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-100 dark:border-red-800">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-300">Late Return Penalty</h4>
                </div>
                <p className="mt-1 text-lg font-semibold text-red-800 dark:text-red-200">Rs. {machine.penaltyPerDay.toLocaleString()} / Day</p>
              </div>
            </div>

            {/* Rental Options */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Rental Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max={machine.quantity}
                        className="flex-1 p-2 text-center border-y border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        onClick={() => quantity < machine.quantity && setQuantity(quantity + 1)}
                        className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Available: {machine.quantity} units</p>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (Days)
                  </label>
                  <div className="relative">
                    <div className="flex">
                      <button
                        onClick={() => duration > machine.defaultDurationDays && setDuration(duration - 1)}
                        className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        id="duration"
                        value={duration}
                        onChange={handleDurationChange}
                        min={machine.defaultDurationDays}
                        className="flex-1 p-2 text-center border-y border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        onClick={() => setDuration(duration + 1)}
                        className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Minimum: {machine.defaultDurationDays} days</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Rental Cost</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">Rs. {totalPrice.toLocaleString()}</span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      ({quantity} × {duration} days × Rs. {machine.rentalPricePerDay.toLocaleString()})
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02]"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Rent Now
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MachineryDetailModal;
