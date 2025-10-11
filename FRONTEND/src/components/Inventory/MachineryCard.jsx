import React, { useState, useEffect } from "react";

const MachineryCard = ({ machine, onSeeMore }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // useEffect to handle the automatic image sliding
  useEffect(() => {
    // Only start the slider if there's more than one image
    if (machine.imageUrl.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex === machine.imageUrl.length - 1 ? 0 : prevIndex + 1));
      }, 3000); // Change image every 3 seconds

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [machine.imageUrl]); // Re-run effect if the image URLs change

  // Manual navigation handlers remain the same
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? machine.imageUrl.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex === machine.imageUrl.length - 1 ? 0 : prevIndex + 1));
  };

  const isOutOfStock = machine.quantity === 0;

  // Function to get availability badge styling
  const getAvailabilityBadge = () => {
    if (isOutOfStock) {
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        label: "Out of Stock",
      };
    } else if (machine.quantity <= 3) {
      return {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        label: "Low Stock",
      };
    } else {
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        label: "In Stock",
      };
    }
  };

  const availabilityBadge = getAvailabilityBadge();

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl 
      ${isOutOfStock ? "opacity-80" : ""}`}
    >
      {/* The main slider container */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {machine.imageUrl && machine.imageUrl.length > 0 ? (
          <div
            className="flex h-full transition-transform ease-in-out duration-500"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {machine.imageUrl.map((url, index) => (
              <img
                key={index}
                src={`http://localhost:5001${url}`}
                alt={machine.name}
                className="w-full h-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Availability badge */}
        <div
          className={`absolute top-3 right-3 ${availabilityBadge.bgColor} ${availabilityBadge.textColor} text-xs font-semibold px-3 py-1 rounded-full`}
        >
          {availabilityBadge.label}
        </div>

        {/* Navigation buttons */}
        {machine.imageUrl && machine.imageUrl.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all focus:outline-none z-10"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all focus:outline-none z-10"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image indicator dots */}
        {machine.imageUrl && machine.imageUrl.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1">
            {machine.imageUrl.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? "bg-white w-4" : "bg-white bg-opacity-50"}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{machine.name}</h3>
            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              {machine.category || "Uncategorized"}
            </span>
          </div>
          <div className="bg-green-50 rounded-lg px-3 py-1">
            <span className="text-green-700 font-bold">Rs.{machine.rentalPricePerDay}</span>
            <span className="text-green-600 text-xs">/day</span>
          </div>
        </div>

        <div className="mt-4 flex items-center text-gray-500 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          Available: <span className="font-medium ml-1">{machine.quantity}</span>
        </div>

        <button
          onClick={!isOutOfStock ? onSeeMore : undefined}
          disabled={isOutOfStock}
          className={`mt-4 w-full py-2.5 rounded-lg transition-all duration-200 font-medium ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transform hover:shadow-md"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "See Details & Rent"}
        </button>
      </div>
    </div>
  );
};

export default MachineryCard;
