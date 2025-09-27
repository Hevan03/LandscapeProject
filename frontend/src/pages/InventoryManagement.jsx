import React from "react";
import { useNavigate } from "react-router-dom";

const InventoryManagement = () => {
  const navigate = useNavigate();

  // Background images 
  const cardBackgrounds = {
    "Product Inventory":
      "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1974&q=80')", 
    "Machinery Inventory":
      "url('https://images.unsplash.com/photo-1703113691621-af7d6e70dcc1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGxhbmRzY2FwZSUyME1hY2hpbmVyeXxlbnwwfHwwfHx8MA%3D%3D')", 
    "Rental Orders":
      "url('https://images.unsplash.com/photo-1687709644237-ca3ef4127cc2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVudGFsJTIwbWFjaGluZXJ5fGVufDB8fDB8fHww')", 
    "Shop Orders":
      "url('https://images.unsplash.com/photo-1693086913434-96cb7f64729e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGxhbnQlMjBTaG9wfGVufDB8fDB8fHww')", 
    "Landscaper Orders":
      "url('https://plus.unsplash.com/premium_photo-1682437514491-e4f6cbf650f2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGxhbnQlMjBvcmRlcnN8ZW58MHx8MHx8fDA%3D')", 
  };

  const cards = [
    {
      title: "Product Inventory",
      description: "Manage all shop products in stock.",
      path: "/inventory",
    },
    {
      title: "Machinery Inventory",
      description: "Track and manage machinery items.",
      path: "/machinery",
    },
    {
      title: "Rental Orders",
      description: "View and manage all rental requests.",
      path: "/rentalInventoryOrders",
    },
    {
      title: "Shop Orders",
      description: "Check and manage shop customer orders.",
      path: "/shopInventoryOrders",
    },
    {
      title: "Landscaper Orders",
      description: "View all landscaper requests for items.",
      path: "/landscapeInventory",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-10 text-center text-green-800">
        Inventory Management Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mt-10">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}
            className="relative overflow-hidden cursor-pointer rounded-2xl shadow-xl p-8 transition transform hover:scale-105 group"
            style={{
              backgroundImage: cardBackgrounds[card.title],
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-opacity rounded-2xl"></div>

            {/* Content */}
            <div className="relative z-10 text-white">
              <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">
                {card.title}
              </h2>
              <p className="text-lg opacity-95">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryManagement;
