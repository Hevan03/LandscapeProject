import React, { useState, useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, PlusSquare, Briefcase, Calendar, User, Menu, X, ChevronDown, Bell, Star, ShoppingBag } from "lucide-react";
import AuthContext from "../context/AuthContext";

const LandscaperNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  // Derive landscaper identifier for staff notifications (serviceNum preferred)
  const serviceNum = user?.serviceNum || user?.Service_Num || user?.id || user?._id;

  // Handle scroll effect for adding shadow/background changes
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch landscaper notifications (staff notifications by serviceNum)
  useEffect(() => {
    if (!serviceNum) return;
    let timer;
    const fetchNotes = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/notifications/${serviceNum}`);
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load landscaper notifications", e);
      }
    };
    fetchNotes();
    timer = setInterval(fetchNotes, 30000);
    return () => clearInterval(timer);
  }, [serviceNum]);

  const unreadCount = notes.filter((n) => !(n.isRead ?? n.read)).length;

  const markNoteRead = async (id) => {
    try {
      // Staff route uses /api/notifications/read/:id
      await fetch(`http://localhost:5001/api/notifications/read/${id}`, { method: "PUT" });
      setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n)));
    } catch (e) {
      console.error("Failed to mark landscaper notification as read", e);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-white/10" : "backdrop-blur-sm bg-transparent"}`}
    >
      <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="flex flex-col md:flex-row items-center">
            {/* Logo Section */}
            <div className="py-4 md:py-5 text-center md:text-left w-full md:w-auto flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-wide">LeafSphere</h1>
                <p className="text-green-100 text-xs">Connecting Nature, People & Sustainability</p>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Navigation - Desktop */}
            <div className={`hidden md:flex flex-grow justify-center items-center`}>
              <nav className="flex-1">
                <ul className="flex items-center justify-center space-x-1 text-base font-medium">
                  <NavItem to="/landscaper/home" icon={<Home size={18} />} label="Home" />
                  <NavItem to="/landscaper/create-landscape" icon={<PlusSquare size={18} />} label="New Project" />
                  <NavItem to="/landscaper/projects" icon={<Briefcase size={18} />} label="My Projects" />
                  <NavItem to="/landscaper/shop" icon={<ShoppingBag size={18} />} label="Shop" />
                  <NavItem to="/landscaper/appointments" icon={<Calendar size={18} />} label="Appointments" />
                </ul>
              </nav>
            </div>

            {/* User Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
                  onClick={() => setNotesOpen((o) => !o)}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-[10px] leading-4 text-white rounded-full text-center">
                      {unreadCount}
                    </span>
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
                      {notes.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No notifications</div>
                      ) : (
                        notes.map((n) => (
                          <div key={n._id} className={`px-4 py-3 text-sm border-b ${n.isRead ?? n.read ? "bg-white" : "bg-green-50"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-medium text-gray-800">{n.message}</div>
                                <div className="text-[11px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                              {!(n.isRead ?? n.read) && (
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

              {/* User Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200">
                  <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-sm font-medium">
                    {user?.name?.charAt(0) || "L"}
                  </div>
                  <span className="text-sm">Landscaper</span>
                  <ChevronDown size={14} />
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                  <div className="py-1">
                    <NavLink
                      to="/landscaper/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600"
                    >
                      <User size={16} className="mr-2" />
                      My Account
                    </NavLink>
                    <NavLink
                      to="/landscaper/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600"
                    >
                      Settings
                    </NavLink>
                    <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              mobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="pt-2 pb-4">
              <ul className="flex flex-col space-y-1">
                <MobileNavItem to="/landscaper/home" icon={<Home size={18} />} label="Home" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavItem
                  to="/create-landscape"
                  icon={<PlusSquare size={18} />}
                  label="Start New Project"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavItem
                  to="/landscaper/projects"
                  icon={<Briefcase size={18} />}
                  label="My Projects"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavItem to="/shop" icon={<ShoppingBag size={18} />} label="Shop" onClick={() => setMobileMenuOpen(false)} />
                <MobileNavItem
                  to="/landscaper/appointments"
                  icon={<Calendar size={18} />}
                  label="My Appointments"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavItem to="/landscaper/account" icon={<User size={18} />} label="My Account" onClick={() => setMobileMenuOpen(false)} />
              </ul>
            </nav>

            <div className="pt-2 border-t border-white/10">
              <button onClick={logout} className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 rounded-lg">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Desktop Navigation Item Component
const NavItem = ({ to, icon, label }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive ? "bg-white/20 text-white font-medium" : "text-gray-100 hover:bg-white/10"
        }`
      }
    >
      <span className="mr-1.5">{icon}</span> {label}
    </NavLink>
  </li>
);

// Mobile Navigation Item Component
const MobileNavItem = ({ to, icon, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive ? "bg-white/20 text-white font-medium" : "text-gray-100 hover:bg-white/10"
        }`
      }
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span> {label}
    </NavLink>
  </li>
);

export default LandscaperNavbar;
