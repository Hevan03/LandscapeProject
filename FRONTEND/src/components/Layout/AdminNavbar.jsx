import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, Truck, FileText, Package, LogOut } from "lucide-react";
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

  const handleLogout = () => {
    logout();
    navigate("/login");
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-green-700 font-semibold hover:bg-green-700 hover:text-white transition-colors duration-200 shadow"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
