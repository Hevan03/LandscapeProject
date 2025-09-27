import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
// --- FIX 1: Correctly import the Toaster component ---
import { Toaster } from "react-hot-toast";

// --- COMPONENT & LAYOUT IMPORTS ---
import Navbar from "./components/navbar";
import LandscaperLayout from "./components/LandscaperLayout";

// --- PAGE IMPORTS ---
import LandscaperProgressPage from "./pages/LandscaperProgressPage";
import HomePage from "./pages/HomePage";
import CustomerProgressPage from "./pages/CustomerProgressPage";
import UpdateProgressPage from "./pages/UpdateProgressPage";
import CreateProgressPage from "./pages/CreateProgressPage";
import AddProgressPage from "./pages/AddProgressPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import AppointmentForm from "./pages/AppointmentForm";
import PaymentPortal from "./pages/PaymentPortal";
import LandscaperAppointments from "./pages/LandscaperAppointments";
import LandscaperHomePage from "./pages/LandscaperHomePage";
import CreateLandscapePage from "./pages/CreateLandscapePage";
import LandscaperProjectsPage from "./pages/LandscaperProjectsPage";
// --- FIX 2: Correct the import path to match your singular filename ---
import CustomerProjectsPage from "./pages/CustomerProjectPage";

// A simple helper component for pages that use the general navbar
const GeneralLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export const App = () => {
  return (
    <div data-theme="cupcake">
      {/* --- FIX 1: Use the correct uppercase <Toaster /> component --- */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* --- LANDSCAPER ROUTES (with LandscaperNavbar) --- */}
        <Route path="/landscaper" element={<LandscaperLayout />}>
          <Route path="home" element={<LandscaperHomePage />} />
          <Route path="projects" element={<LandscaperProjectsPage />} />
          <Route path="appointments" element={<LandscaperAppointments />} />
          <Route path="account" element={<div>Landscaper Account Page</div>} />
        </Route>

        {/* --- CUSTOMER & GENERAL ROUTES (with general Navbar) --- */}
        <Route element={<GeneralLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/customer/progress/:landscapeId" element={<CustomerProgressPage />} />
            <Route path="/customerdashboard" element={<CustomerDashboard />} />
            <Route path="/customer/my-projects" element={<CustomerProjectsPage />} />
            <Route path="/book/:landscaperId" element={<AppointmentForm />} />
            <Route path="/payment" element={<PaymentPortal />} />
        </Route>

        {/* --- STANDALONE ROUTES (no shared navbar) --- */}
        <Route path="/create-landscape" element={<CreateLandscapePage />} />
        <Route path="/addprogress/:landscapeId" element={<AddProgressPage />} />
        <Route path="/updateprogress/:id" element={<UpdateProgressPage />} />
        <Route path="/createprogress/:landscapeId" element={<CreateProgressPage />} />
        <Route path="/landscaperprogress/:id" element={<LandscaperProgressPage />} />
      </Routes>
    </div>
  );
};

export default App;