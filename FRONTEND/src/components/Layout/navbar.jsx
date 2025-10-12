import React, { useState, useContext, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { Home, Truck, FileText, Package, Users, LogOut, Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [customerNotes, setCustomerNotes] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState([]);
  const [adminNotesOpen, setAdminNotesOpen] = useState(false);

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

  // Fetch customer notifications when a customer is logged in
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (user?.role === "customer" && user?._id) {
          const res = await fetch(`http://localhost:5001/api/customer/notifications/${user._id}`);
          const data = await res.json();
          setCustomerNotes(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to load customer notifications", e);
      }
    };
    fetchNotes();
    const t = setInterval(fetchNotes, 30000);
    return () => clearInterval(t);
  }, [user]);

  const unreadCount = customerNotes.filter((n) => !n.isRead).length;
  const markNoteRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/customer/notifications/read/${id}`, { method: "PUT" });
      setCustomerNotes((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  // Fetch admin notifications (for admin role)
  useEffect(() => {
    const fetchAdminNotes = async () => {
      try {
        if (user?.role === "admin") {
          const res = await fetch(`http://localhost:5001/api/notifications`);
          const data = await res.json();
          setAdminNotes(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to load admin notifications", e);
      }
    };
    fetchAdminNotes();
    const t = setInterval(fetchAdminNotes, 30000);
    return () => clearInterval(t);
  }, [user]);

  const adminUnreadCount = adminNotes.filter((n) => !n.isRead).length;
  const markAdminNoteRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/notifications/read/${id}`, { method: "PUT" });
      setAdminNotes((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error("Failed to mark admin notification as read", e);
    }
  };

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
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center gap-2">LeafSphere</h1>
              <p className="text-green-100 text-xs sm:text-sm">Connecting Nature, People & Sustainability</p>
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
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}>
      <div className="bg-gradient-to-b from-[#134E1A] to-green-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Header with Logo */}
          <div className="py-4 sm:py-5 flex justify-between items-center">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center gap-2">LeafSphere</h1>
              <p className="text-green-100 text-xs sm:text-sm">Connecting Nature, People & Sustainability</p>
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
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">{user.name?.charAt(0) || "U"}</div>
                    <span>{user.name || "User"}</span>
                    <ChevronDown size={16} />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="py-1">
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Settings
                      </a>
                      {user.role !== "customer" && user.role !== "admin" && (
                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          Logout
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer notifications bell and logout (bell left of logout) */}
                {user.role === "customer" && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        className="relative btn btn-sm btn-ghost text-white"
                        onClick={() => setNotesOpen((o) => !o)}
                        aria-label="Notifications"
                        title="Notifications"
                      >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{unreadCount}</span>
                        )}
                      </button>
                      {notesOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                          <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="text-sm font-semibold">Notifications</div>
                            <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setNotesOpen(false)}>
                              Close
                            </button>
                          </div>
                          <div className="max-h-96 overflow-auto">
                            {customerNotes.length === 0 ? (
                              <div className="p-4 text-sm text-gray-500">No notifications</div>
                            ) : (
                              customerNotes.map((n) => (
                                <div key={n._id} className={`px-4 py-3 text-sm border-b ${n.isRead ? "bg-white" : "bg-green-50"}`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="font-medium text-gray-800">{n.message}</div>
                                      <div className="text-[11px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                                    </div>
                                    {!n.isRead && (
                                      <button className="text-xs text-green-700 hover:underline" onClick={() => markNoteRead(n._id)}>
                                        Mark read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                      onClick={logout}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

                {/* Admin logout and notifications bell (bell right of logout) */}
                {user.role === "admin" && (
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                      onClick={logout}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                    <div className="relative">
                      <button
                        className="relative btn btn-sm btn-ghost text-white"
                        onClick={() => setAdminNotesOpen((o) => !o)}
                        aria-label="Notifications"
                        title="Notifications"
                      >
                        <Bell size={18} />
                        {adminUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                            {adminUnreadCount}
                          </span>
                        )}
                      </button>
                      {adminNotesOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                          <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="text-sm font-semibold">Notifications</div>
                            <button className="text-xs text-gray-500 hover:text-gray-700" onClick={() => setAdminNotesOpen(false)}>
                              Close
                            </button>
                          </div>
                          <div className="max-h-96 overflow-auto">
                            {adminNotes.length === 0 ? (
                              <div className="p-4 text-sm text-gray-500">No notifications</div>
                            ) : (
                              adminNotes.map((n) => (
                                <div key={n._id} className={`px-4 py-3 text-sm border-b ${n.isRead ? "bg-white" : "bg-green-50"}`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="font-medium text-gray-800">{n.message}</div>
                                      <div className="text-[11px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                                    </div>
                                    {!n.isRead && (
                                      <button className="text-xs text-green-700 hover:underline" onClick={() => markAdminNoteRead(n._id)}>
                                        Mark read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                        isActive ? "bg-white text-green-600 font-semibold" : "hover:bg-white/10"
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
                      isActive ? "bg-white text-green-600 font-semibold" : "text-white hover:bg-white/10"
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
