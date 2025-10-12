import React from "react";
import { useNavigate } from "react-router-dom";

const InventoryManagement = () => {
  const navigate = useNavigate();

  // Background images with overlay class for better readability
  const cardBackgrounds = {
    "Product Inventory": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1974&q=80",
    "Machinery Inventory": "https://images.unsplash.com/photo-1703113691621-af7d6e70dcc1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "Rental Orders": "https://images.unsplash.com/photo-1687709644237-ca3ef4127cc2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "Shop Orders": "https://images.unsplash.com/photo-1693086913434-96cb7f64729e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
    "Landscaper Orders": "https://plus.unsplash.com/premium_photo-1682437514491-e4f6cbf650f2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  };

  const cards = [
    {
      title: "Product Inventory",
      description: "Manage all shop products in stock.",
      path: "/admin/inventory",
      icon: "🌿",
    },
    {
      title: "Machinery Inventory",
      description: "Track and manage machinery items.",
      path: "/admin/machinery",
      icon: "🚜",
    },
    {
      title: "Rental Orders",
      description: "View and manage all rental requests.",
      path: "/admin/rentalInventoryOrders",
      icon: "📋",
    },
    {
      title: "Shop Orders",
      description: "Check and manage shop customer orders.",
      path: "/admin/shopInventoryOrders",
      icon: "🛒",
    },
    {
      title: "Landscaper Orders",
      description: "View all landscaper requests for items.",
      path: "/admin/landscapeInventory",
      icon: "🏡",
    },
  ];

  // Navigation is handled per-card click; no separate add-new handler used here

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-20">
      {/* Header with Add New button */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-600 mb-6 md:mb-0">
            Inventory Management
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-3xl">Manage your inventory, track machinery, and handle orders from one central dashboard.</p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto cursor-pointer">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}
            className="group relative h-64 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:translate-y-[-5px]"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: `url(${cardBackgrounds[card.title]})`,
              }}
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-transparent opacity-80"></div>

            {/* Card Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{card.icon}</span>
                <h2 className="text-2xl font-bold">{card.title}</h2>
              </div>
              <p className="text-white text-opacity-90 font-medium">{card.description}</p>

              {/* View Button */}
              <div className="mt-4 overflow-hidden h-8">
                <span className="inline-flex items-center text-sm font-semibold py-1 px-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm transition-transform duration-300 transform translate-y-8 group-hover:translate-y-0">
                  View Details →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto mt-16 bg-white rounded-2xl shadow-lg p-8 border border-green-100">
        <h3 className="text-xl font-bold text-green-700 mb-6">Inventory Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-green-800">247</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Machinery Items</p>
            <p className="text-3xl font-bold text-green-800">32</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-green-800">18</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
            <p className="text-3xl font-bold text-green-800">7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
