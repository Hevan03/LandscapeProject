import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDash from './pages/AdminDash';
import DriverDash from './pages/DriverDash';
import AccidentReportSubmit from './pages/AccidentReportSubmit';
import Vehicles from './pages/DeliveryManagement/Vehicles';
import DeliveryReports from './pages/DeliveryManagement/DeliveryReports';
import DeliveryAssign from './pages/DeliveryManagement/DeliveryAssign';
import Driver from './pages/DeliveryManagement/Driver';
import AccidentReports from './pages/DeliveryManagement/AccidentReports';
import ServicePayments from "./pages/PaymentManagement/ServicePayments";
import InventoryPayments from "./pages/PaymentManagement/InventoryPayments";
import AdminPaymentDashboard from "./pages/AdminPaymentDashboard";
import NavigationDash from "./pages/NavigationDash";
import Notifications from "./pages/Notifications";
import Navbar from "./components/navbar";
import CreateOrder from "./pages/Orders/CreateOrder";



function App() {
  return (
    <div>

      <Routes>
        <Route path="/" element={<NavigationDash />} />
        <Route path="/DeliveryManagement/vehicles" element={<Vehicles />} />
        <Route path="/DeliveryManagement/delivery-reports" element={<DeliveryReports />} />
        <Route path="/DeliveryManagement/delivery-assign" element={<DeliveryAssign />} />
        <Route path="/DeliveryManagement/driver" element={<Driver />} />
        <Route path="/DeliveryManagement/accident-reports" element={<AccidentReports />} />

        <Route path="/PaymentManagement/Servicepay" element={<ServicePayments />} />
        <Route path="/PaymentManagement/InventoryPay" element={<InventoryPayments />} />
        <Route path="/InventoryPayments" element={<InventoryPayments />} />

        {/* Aliases (lowercase, hyphenated) for convenience */}
        <Route path="/payment-management/service" element={<ServicePayments />} />
        <Route path="/payment-management/inventory" element={<InventoryPayments />} />

        <Route path="/Admin-dashboard" element={<AdminDash/>} />
        <Route path="/Driver-dashboard" element={<DriverDash/>} />
        <Route path="/AccidentReportSubmission" element={<AccidentReportSubmit/>} />
        <Route path="/AdminPaymentDashboard" element={<AdminPaymentDashboard/>} />
        <Route path="/notifications" element={<Notifications/>} />
        <Route path="/Orders/create" element={<CreateOrder/>} />
        {/* Login route removed: Single-driver, no-auth flow */}
      </Routes>

   
    </div>
  );
}

export default App;
