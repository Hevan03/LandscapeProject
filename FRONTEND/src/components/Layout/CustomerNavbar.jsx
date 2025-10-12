import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

const CustomerNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [customerNotes, setCustomerNotes] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);

  const userID = user?._id || user?.id;

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

  // Fetch customer notifications
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (!userID) return;
        const res = await fetch(`http://localhost:5001/api/customer/notifications/${userID}`);
        const data = await res.json();
        setCustomerNotes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load customer notifications", e);
      }
    };
    fetchNotes();
    const t = setInterval(fetchNotes, 30000);
    return () => clearInterval(t);
  }, [userID]);

  const unreadCount = customerNotes.filter((n) => !n.isRead).length;
  const markNoteRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/customer/notifications/read/${id}`, { method: "PUT" });
      setCustomerNotes((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

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

              {/* Notifications bell (left of Logout) */}
              <div className="relative">
                <button
                  className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10"
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

              {/* Logout Button */}
              <button
                onClick={logout}
                className="font-medium text-white border border-white rounded-full px-5 py-2 hover:bg-white hover:text-green-700 transition-all duration-200"
              >
                Logout
              </button>
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
          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="block w-full mt-2 text-center px-3 py-2 rounded-full font-medium text-white border border-white hover:bg-white hover:text-green-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
