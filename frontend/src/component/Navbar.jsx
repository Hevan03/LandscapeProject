import React from "react";
import {
  Home,
  ShoppingBag,
  Truck,
  ClipboardList,
  Trees,
} from "lucide-react"; // icons

const Navbar = () => {
  return (
    <header className="shadow-lg">
      {/* Wrapper for both header and navbar with the specific gradient */}
      <div className="bg-gradient-to-b from-[#134E1A] to-green-500 text-white"> 
        {/* Top Header with Logo */}
        <div className="py-6 text-center relative">
          <h1 className="text-4xl font-extrabold tracking-wide flex justify-center items-center gap-2">
            LeafSphere
          </h1>
          <p className="text-green-100 text-sm mt-1">
            Connecting Nature, People & Sustainability
          </p>
        </div>

        {/* Navigation Bar */}
        <nav>
          <ul className="flex justify-center space-x-10 py-4 font-medium text-lg">
            <li>
              <a
                href="/"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Home size={20} /> Home
              </a>
            </li>
            <li>
              <a
                href="/Shop"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <ShoppingBag size={20} /> Shop
              </a>
            </li>
            <li>
              <a
                href="/rentals"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Truck size={20} /> Rental
              </a>
            </li>
            <li>
              <a
                href="/orders/68cd012dfe7ed10e950e0f6b"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <ClipboardList size={20} /> My Orders
              </a>
            </li>
            <li>
              <a
                href="/request"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Trees size={20} /> Landscaper Request
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;