import React, { useState, useContext, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import {
  Home,
  Truck,
  FileText,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Driver navbar
  if (user?.role === "driver") {
    return (
      <nav
        className={`w-full bg-gradient-to-b from-[#134E1A] to-green-500 text-white fixed top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-md py-2" : "py-3"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center gap-2">
                LeafSphere
              </h1>
              <p className="text-green-100 text-xs sm:text-sm">
                Connecting Nature, People & Sustainability
              </p>
            </div>
          </div>

          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
            onClick={logout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    );
  }

  // Admin/Default navbar
  const navItems = [
    { name: "Home", path: "/Admin-dashboard", icon: <Home size={18} /> },
    {
      name: "Vehicles",
      path: "/DeliveryManagement/vehicles",
      icon: <Truck size={18} />,
    },
    {
      name: "Reports",
      path: "/DeliveryManagement/delivery-reports",
      icon: <FileText size={18} />,
    },
    {
      name: "Deliveries",
      path: "/DeliveryManagement/delivery-assign",
      icon: <Package size={18} />,
    },
    {
      name: "Drivers",
      path: "/DeliveryManagement/driver",
      icon: <Users size={18} />,
    },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="bg-gradient-to-b from-[#134E1A] to-green-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Header with Logo */}
          <div className="py-4 sm:py-5 flex justify-between items-center">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center gap-2">
                LeafSphere
              </h1>
              <p className="text-green-100 text-xs sm:text-sm">
                Connecting Nature, People & Sustainability
              </p>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden rounded-md p-2 text-white hover:bg-green-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* User section for larger screens */}
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-2 py-2 px-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200">
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <span>{user.name || "User"}</span>
                    <ChevronDown size={16} />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="py-1">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </a>
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </a>
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-1 text-md font-medium pb-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-4 py-2 rounded-t-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white text-green-600 font-semibold"
                          : "hover:bg-white/10"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`md:hidden fixed inset-0 bg-[#134E1A]/95 z-40 transition-all duration-300 transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <ul className="space-y-4 text-lg font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white text-green-600 font-semibold"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {user && (
            <div className="mt-auto mb-8">
              <div className="border-t border-white/20 pt-4 mt-8">
                <button
                  onClick={logout}
                  className="flex items-center w-full space-x-3 p-3 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
