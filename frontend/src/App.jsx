import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Page Components
import HomePage from "./pages/HomePage";
import ApplicationPage from "./pages/ApplicationPage";
import NotificationsPage from "./pages/NotificationsPage";
import RatingsPage from "./pages/RatingsPage";
import EmployeeRatingPage from "./pages/EmployeeRatingPage";
import AdminPage from "./pages/AdminPage";
import LandscapeLoginPage from "./pages/landscapeLogin";


// Dashboard Components
import DriverDashboard from "./pages/DriverDashboard";
import LandscaperDashboard from "./pages/LandscaperDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  const location = useLocation();
  // Logic to hide Header/Footer on login or admin pages
  const showHeaderFooter = location.pathname !== '/admin' && location.pathname !== '/Login';

  return (
    <div className="app">
      {showHeaderFooter && <Header />}
      
      <main className={!showHeaderFooter ? "" : "main"}>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Login" element={<LandscapeLoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          <Route path="/application-form" element={<ApplicationPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/employee-ratings" element={<RatingsPage />} />
          <Route path="/rate/:employeeId" element={<EmployeeRatingPage />} />

          
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
          

          
            <Route path="/landscaper-dashboard" element={<LandscaperDashboard />} />
          

          
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
         

          {/* --- Wildcard Route (must be last) --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default App;