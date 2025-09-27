import React, { useState, useEffect } from 'react';

const MachineryCard = ({ machine, onSeeMore }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // useEffect to handle the automatic image sliding
  useEffect(() => {
    // Only start the slider if there's more than one image
    if (machine.imageUrl.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === machine.imageUrl.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change image every 3 seconds

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [machine.imageUrl]); // Re-run effect if the image URLs change

  // Manual navigation handlers remain the same
  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? machine.imageUrl.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === machine.imageUrl.length - 1 ? 0 : prevIndex + 1
    );
  };

  const isOutOfStock = machine.quantity === 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 
      ${isOutOfStock ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {/* The main slider container */}
      <div className="relative h-48 overflow-hidden">
        {machine.imageUrl && machine.imageUrl.length > 0 && (
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
              />
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        {machine.imageUrl.length > 1 && !isOutOfStock &&(
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
            >
              &#10094;
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors z-10"
            >
              &#10095;
            </button>
          </>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{machine.name}</h3>
        <p className="text-gray-600 text-sm">{machine.category}</p>
        <p className="text-gray-800 font-semibold text-lg mt-2">Rs.{machine.rentalPricePerDay} / Day</p>
        <p className="text-gray-500 text-sm mt-1">Available: {machine.quantity}</p>
        <button
          onClick={!isOutOfStock ? onSeeMore : undefined}
          disabled={isOutOfStock}
          className={`mt-4 w-full font-bold py-2 rounded-lg transition-colors ${
            isOutOfStock
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'See More'}
        </button>
      </div>
    </div>
  );
};

export default MachineryCard;