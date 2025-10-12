import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, Truck, FileText, Package, LogOut, Bell } from "lucide-react";
import AuthContext from "../../context/AuthContext";

const navLinks = [
  { to: "/admin/driver-dashboard", label: "Dashboard", icon: <Truck size={18} /> },
  { to: "/admin/customer-dashboard", label: "Customers", icon: <User size={18} /> },
  { to: "/admin/inventory-dashboard", label: "Inventory", icon: <Package size={18} /> },
  { to: "/admin/payment-dashboard", label: "Payments", icon: <FileText size={18} /> },
  { to: "/admin/maintanance", label: "Maintanance", icon: <FileText size={18} /> },
  { to: "/admin/staff", label: "Staff", icon: <User size={18} /> },
];

const AdminNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [adminNotes, setAdminNotes] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch admin notifications and poll every 30s
  useEffect(() => {
    const fetchAdminNotes = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/notifications`);
        const data = await res.json();
        setAdminNotes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load admin notifications", e);
      }
    };
    fetchAdminNotes();
    const t = setInterval(fetchAdminNotes, 30000);
    return () => clearInterval(t);
  }, []);

  const unreadCount = adminNotes.filter((n) => !n.isRead).length;
  const markNoteRead = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/notifications/read/${id}`, { method: "PUT" });
      setAdminNotes((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error("Failed to mark admin notification as read", e);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-green-800 to-green-600 w-full text-white px-8 py-4 shadow flex items-center justify-between">
      <div className="flex items-center justify-between gap-8 w-full">
        <span className="font-extrabold text-2xl tracking-wide">LeafSphere Admin</span>

        <ul className="flex gap-4 ml-8">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-white text-green-700 font-semibold shadow" : "hover:bg-green-700 hover:text-white"
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
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
                            <button className="text-xs text-green-700 hover:underline" onClick={() => markNoteRead(n._id)}>
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-3 border-t bg-gray-50">
                  <button
                    onClick={() => {
                      setNotesOpen(false);
                      navigate("/admin/notifications");
                    }}
                    className="w-full text-center text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg py-2"
                  >
                    Go to Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-green-700 font-semibold hover:bg-green-700 hover:text-white transition-colors duration-200 shadow"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
