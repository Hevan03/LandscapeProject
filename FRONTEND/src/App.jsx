import React from "react";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout & shared
import Navbar from "./components/Layout/navbar";
import LandscaperLayout from "./components/LandscaperLayout";
import AdminLayout from "./components/Layout/AdminLayout";
import CustomerLayout from "./components/Layout/CustomerLayout";

//Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserProfile from "./pages/auth/UserProfile";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Landscape
import LandscaperProgressPage from "./pages/Landscape/LandscaperProgressPage";
import UpdateProgressPage from "./components/Landscape/UpdateProgressPage";
import CreateProgressPage from "./components/Landscape/CreateProgressPage";
import AddProgressPage from "./components/Landscape/AddProgressPage";
import LandscaperAppointments from "./components/Landscape/LandscaperAppointments";
import LandscaperHomePage from "./pages/Landscape/LandscaperHomePage";
import CreateLandscapePage from "./pages/Landscape/CreateLandscapePage";
import LandscaperProjectsPage from "./components/Landscape/LandscaperProjectsPage";
import LandscaperProfilePage from "./pages/Landscape/LandscaperProfilePage";
import AppointmentForm from "./components/Landscape/AppointmentForm";
import LandscaperRentalOrders from "./pages/Landscape/LandscaperRentalOrders";

// Customer (adjusted paths)
import CustomerProgressPage from "./components/Customer/CustomerProgressPage";
import CustomerManagement from "./pages/CustomerManagement/Admin/CustomerManagement";
import CustomerProjectsPage from "./components/Customer/CustomerProjectPage";
import CustomerDashboard from "./pages/CustomerManagement/CustomerDashboard";
import CustomerHomePage from "./pages/CustomerManagement/CustomerHomePage";
import MaintanancePage from "./pages/CustomerManagement/MaintenancePage";
import AdminMaintanancePage from "./pages/CustomerManagement/Admin/MaintenanceHires";
import AdminMaintenanceRequests from "./pages/CustomerManagement/AdminMaintenanceRequests";
import CustomerMaintenance from "./pages/CustomerManagement/CustomerMaintenance";
import CustomerAppointmentStatus from "./components/Customer/CustomerAppointmentStatus";
import BookLandscaper from "./pages/CustomerManagement/BookLandscaper";

// Payment & appointments

import PaymentPortal from "./pages/PaymentManagement/PaymentPortal";
import ServicePayments from "./components/PaymentManagement/ServicePayments";
import InventoryPayments from "./components/PaymentManagement/InventoryPayments";
import AdminPaymentDashboard from "./pages/PaymentManagement/Admin/ModernAdminPaymentDashboard";
// import AdminPaymentDashboard from "./pages/PaymentManagement/Admin/AdminPaymentDashboard";
import ShopDashboard from "./pages/PaymentManagement/ShopDashboard";
import Cart from "./components/PaymentManagement/Cart";
import ProductDetails from "./pages/PaymentManagement/ProductDetails";

// Delivery
import AdminDash from "./pages/DeliveryManagement/Admin/AdminDash";
import DriverDash from "./pages/DeliveryManagement/DriverDash";
import AccidentReportSubmit from "./components/DeliveryManagement/AccidentReportSubmit";
import Vehicles from "./components/DeliveryManagement/Vehicles";
import DeliveryReports from "./components/DeliveryManagement/DeliveryReports";
import DeliveryAssign from "./components/DeliveryManagement/DeliveryAssign";
import Driver from "./components/DeliveryManagement/Driver";
import AccidentReports from "./components/DeliveryManagement/AccidentReports";

// Inventory
import CreateOrder from "./pages/Inventory/CreateOrder";
import InventoryDashboard from "./pages/Inventory/Admin/ModernInventoryDashboard";
// import InventoryDashboard from "./pages/Inventory/Admin/InventoryDashboard";
import InventoryManagement from "./pages/Inventory/InventoryManagement";
import UpdateItemForm from "./components/Inventory/UpdateItemForm";
import ItemForm from "./components/Inventory/ItemForm";
import MachineryInventory from "./components/Inventory/ModernMachineryInventory";
import MachineryShop from "./components/Inventory/MachineryShop";
import RequestForm from "./components/PaymentManagement/RequestForm";
import ItemSelect from "./components/Inventory/ItemSelect";
import Orders from "./components/PaymentManagement/Orders";
import RentalInventoryOrders from "./components/Inventory/ModernRentalInventoryOrders";
import ShopInventoryOrders from "./components/Inventory/ShopInventoryOrders";
// import ShopInventoryOrders from "./components/Inventory/ShopInventoryOrders";
import LandscapeInventory from "./components/Inventory/LandscapeInventory";

// Navigation & misc
import Notifications from "./components/Notifications";

//Staff
import ApplicationPage from "./pages/Staff/ApplicationPage";
import Employeerating from "./pages/Staff/EmployeeRatingPage";
import MaintenanceWorkerDashboard from "./pages/Staff/MaintenanceWorkerDashboard";
import RatingPage from "./pages/Staff/RatingsPage";

//TEmp
import AdminPage from "./pages/Staff/AdminPage";

import HomePage from "./pages/Staff/HomePage";
import LandingPage from "./pages/LandingPage";
//import notificationpage from "./pages/Staff/NotificationsPage";

export const App = () => {
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const { user } = useContext(AuthContext);
  const isLandscaper = user?.role === "landscaper";

  const hideNavbar = authRoutes.includes(location.pathname);

  return (
    <div data-theme="cupcake">
      <Toaster position="top-center" reverseOrder={false} />
      {!hideNavbar && <Navbar /> && !isLandscaper}
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Landscaper Routes */}
        <Route path="/landscaper" element={<LandscaperLayout />}>
          <Route path="home" element={<LandscaperHomePage />} />
          <Route path="projects" element={<LandscaperProjectsPage />} />
          <Route path="appointments" element={<LandscaperAppointments />} />
          <Route path="profile" element={<LandscaperProfilePage />} />
          <Route path="create-landscape" element={<CreateLandscapePage />} />
          <Route path="rentals" element={<LandscaperRentalOrders />} />
        </Route>
        {/* customer routers */}
        {/* Driver Routes */}
        <Route path="/driver-dashboard" element={<DriverDash />} />
        {/* Payment Routes */}

        <Route path="/paymentportal" element={<PaymentPortal />} />
        {/* inventory Routes */}

        <Route path="/cart" element={<Cart />} />
        <Route
          path="/product/:id"
          element={
            <CustomerLayout>
              <ProductDetails />
            </CustomerLayout>
          }
        />
        <Route path="/request" element={<RequestForm />} />
        <Route path="/selectitems" element={<ItemSelect />} />
        {/* Staff Routers */}
        <Route path="/application" element={<ApplicationPage />} />
        <Route path="/driver/:id" element={<Employeerating />} />
        <Route
          path="/customer/maintenance"
          element={
            <CustomerLayout>
              <CustomerMaintenance />
            </CustomerLayout>
          }
        />
        <Route path="/maintenance/dashboard" element={<MaintenanceWorkerDashboard />} />
        <Route
          path="/customerdashboard"
          element={
            <CustomerLayout>
              <CustomerDashboard />
            </CustomerLayout>
          }
        />
        <Route
          path="/customer"
          element={
            <CustomerLayout>
              <CustomerHomePage />
            </CustomerLayout>
          }
        />

        <Route
          path="/customer/book"
          element={
            <CustomerLayout>
              <BookLandscaper />
            </CustomerLayout>
          }
        />

        <Route
          path="/shop"
          element={
            <CustomerLayout>
              <ShopDashboard />
            </CustomerLayout>
          }
        />
        <Route
          path="/orders/:customerId"
          element={
            <CustomerLayout>
              <Orders />
            </CustomerLayout>
          }
        />
        <Route
          path="/appointmentstatus"
          element={
            <CustomerLayout>
              <CustomerAppointmentStatus />
            </CustomerLayout>
          }
        />
        <Route
          path="/ratings"
          element={
            <CustomerLayout>
              <RatingPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/my-projects"
          element={
            <CustomerLayout>
              <CustomerProjectsPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/progress/:landscapeId"
          element={
            <CustomerLayout>
              <CustomerProgressPage />
            </CustomerLayout>
          }
        />
        <Route
          path="/book/:landscaperId"
          element={
            <CustomerLayout>
              <AppointmentForm />
            </CustomerLayout>
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          {/* customer */}
          <Route path="customer-dashboard" element={<CustomerManagement />} />
          <Route path="maintanance" element={<AdminMaintanancePage />} />
          <Route path="maintenance-requests" element={<AdminMaintenanceRequests />} />

          {/* delivery */}
          <Route path="driver-dashboard" element={<AdminDash />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="accident-reports" element={<AccidentReports />} />

          {/* inventory */}
          <Route path="inventory-dashboard" element={<InventoryManagement />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="machinery" element={<MachineryInventory />} />
          <Route path="rentalInventoryOrders" element={<RentalInventoryOrders />} />
          <Route path="shopInventoryOrders" element={<ShopInventoryOrders />} />
          <Route path="landscapeInventory" element={<LandscapeInventory />} />

          {/* Payment */}
          <Route path="payment-dashboard" element={<AdminPaymentDashboard />} />

          {/* staff */}
          <Route path="staff" element={<AdminPage />} />
        </Route>
        {/* --- CUSTOMER & GENERAL ROUTES (with general Navbar) --- */}
        <Route path="/customer/progress/:landscapeId" element={<CustomerProgressPage />} />
        <Route path="/customer/my-projects" element={<CustomerProjectsPage />} />
        <Route path="/customer/maintanance" element={<MaintanancePage />} />
        <Route path="/book/:landscaperId" element={<AppointmentForm />} />
        <Route path="/payment" element={<PaymentPortal />} />
        <Route path="/DeliveryManagement/delivery-reports" element={<DeliveryReports />} />
        <Route path="/DeliveryManagement/delivery-assign" element={<DeliveryAssign />} />
        <Route path="AccidentReportSubmission" element={<AccidentReportSubmit />} />
        <Route path="/DeliveryManagement/driver" element={<Driver />} />
        <Route path="/PaymentManagement/Servicepay" element={<ServicePayments />} />
        <Route path="/PaymentManagement/InventoryPay" element={<InventoryPayments />} />
        <Route path="/InventoryPayments" element={<InventoryPayments />} />
        {/* Aliases (lowercase, hyphenated) for convenience */}
        <Route path="/payment-management/service" element={<ServicePayments />} />
        <Route path="/payment-management/inventory" element={<InventoryPayments />} />
        {/* --- STANDALONE ROUTES (no shared navbar) --- */}
        <Route path="/addprogress/:landscapeId" element={<AddProgressPage />} />
        <Route path="/updateprogress/:id" element={<UpdateProgressPage />} />
        <Route path="/createprogress/:landscapeId" element={<CreateProgressPage />} />
        <Route path="/landscaperprogress/:id" element={<LandscaperProgressPage />} />
        <Route path="/staff/application" element={<ApplicationPage />} />
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/career"
          element={
            <CustomerLayout>
              <HomePage />
            </CustomerLayout>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
