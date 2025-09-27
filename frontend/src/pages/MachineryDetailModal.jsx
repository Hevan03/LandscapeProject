import React, { useState, useEffect } from 'react';

const MachineryDetailModal = ({ machine, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(machine.defaultDurationDays);
  const [totalPrice, setTotalPrice] = useState(0);

  const customerId = "68cd012dfe7ed10e950e0f6b";

  useEffect(() => {
    // Calculate total price based on quantity and duration
    const price = machine.rentalPricePerDay * quantity * duration;
    setTotalPrice(price);
  }, [quantity, duration, machine]);

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
    const response = await fetch("http://localhost:5001/api/rental-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machineId: machine._id,
        customerId,
        quantity,
        duration,
        totalPrice
      })
    });

    if (!response.ok) throw new Error("Failed to create rental order");

    const data = await response.json();
    alert("Rental order created successfully!");
    onClose();
  } catch (error) {
    alert(error.message);
  }
};

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold mb-4">{machine.name}</h2>
        
        {/* Image Slider */}
        <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
          {machine.imageUrl.map((url, index) => (
            <img
              key={index}
              src={`http://localhost:5001${url}`}
              alt={machine.name}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
                index === 0 ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
        
        {/* Details Section */}
        <div className="space-y-4">
          <p className="text-gray-700"><strong>Category:</strong> {machine.category}</p>
          <p className="text-gray-700"><strong>Description:</strong> {machine.description}</p>
          <p className="text-xl font-semibold text-blue-600">
            Rental Price: Rs.{machine.rentalPricePerDay} / Day
          </p>
          <p className="text-sm text-red-500">
            Penalty for late return: Rs.{machine.penaltyPerDay} / Day
          </p>
          
          {/* Rental Options */}
          <div className="flex flex-col md:flex-row gap-4"></div>
          
          {/* Rental Options */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="quantity" className="block text-gray-700 font-medium">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={machine.quantity}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Available stock: {machine.quantity}
              </p>
            </div>
            <div className="flex-1">
              <label htmlFor="duration" className="block text-gray-700 font-medium">Duration (Days):</label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={handleDurationChange}
                min={machine.defaultDurationDays}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Default duration: {machine.defaultDurationDays} days
              </p>
            </div>
          </div>

          {/* Total Price & Payment Button */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-2xl font-bold text-green-600">
              Total Price: Rs.{totalPrice.toFixed(2)}
            </h3>
            <button
              onClick={handleProceedToPayment}
              className="mt-4 w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineryDetailModal;