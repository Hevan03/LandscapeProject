import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const CustomerNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const userContext = useContext(AuthContext);
  const { logout } = useContext(AuthContext);

  const userID = userContext.user?.id;

  const isHomePage = location.pathname === "/customer"; // Add this line

  // Navigation links for customer
  const navLinks = [
    { name: "Home", to: "/customer" },
    { name: "My Projects", to: "/my-projects" },
    { name: "My Orders", to: `/orders/${userID}` },
    { name: "Shop", to: "/shop" },
    { name: "My Appointments", to: "/appointmentstatus" },
    { name: "Ratings", to: "/ratings" },
  ];

  return (
    <nav
      className={`${
        isHomePage ? "bg-transparent shadow-none" : "bg-gradient-to-r from-green-600 to-green-700"
      } shadow-sm absolute top-0 left-0 w-full z-50 transition-all duration-300 bg-transparent py-5`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Website Logo/Name */}
          <div className="flex-shrink-0">
            <Link to="/customer/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-white">LeafSphere</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {/* Regular Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`font-medium text-white hover:text-green-100 hover:underline transition-colors duration-200 ${
                    location.pathname === link.to ? "underline" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Logout Button */}
              <Link
                to="/login"
                className="font-medium text-white border border-white rounded-full px-5 py-2 hover:bg-white hover:text-green-700 transition-all duration-200"
              >
                Logout
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-green-100"
            >
              <span className="sr-only">Open main menu</span>
              {menuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${menuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-green-700 bg-opacity-90">
          {/* Regular Nav Links in Mobile Menu */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`block px-3 py-2 rounded-md font-medium text-white hover:bg-green-600 hover:underline ${
                location.pathname === link.to ? "underline" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* Logout Button in Mobile Menu */}
          <Link
            to="/login"
            className="block mt-2 text-center px-3 py-2 rounded-full font-medium text-white border border-white hover:bg-white hover:text-green-700"
            onClick={() => setMenuOpen(false)}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
