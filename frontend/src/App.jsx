import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import InventoryDashboard from './pages/InventoryDashboard'
import ItemForm from './pages/ItemForm'
import UpdateItemForm from "./pages/UpdateItemForm";
import ShopDashboard from './pages/ShopDashboard'; 
import Cart from './pages/Cart';
import MachineryInventory from './pages/MachineryInventory';
import toast, { Toaster} from 'react-hot-toast'
import MachineryShop from './pages/MachineryShop';
import RequestForm from "./pages/RequestForm";
import ItemSelect from "./pages/ItemSelect";
import Orders from './pages/Orders';
import RentalInventoryOrders from './pages/RentalInventoryOrders';
import ShopInventoryOrders from './pages/ShopInventoryOrders';
import InventoryManagement from './pages/InventoryManagement';
import LandscapeInventory from './pages/LandscapeInventory';


const App = () => {
  return (
    <div data-theme="forest">
     
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Route for adding a new item */}
        <Route path="/update/:id" element={<UpdateItemForm />} />
        <Route path="/addItemForm" element={<ItemForm />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/shop" element={<ShopDashboard />} />
        <Route path="/machinery" element={<MachineryInventory />} />
        <Route path="/rentals" element={<MachineryShop />} />
        
        <Route path="/request" element={<RequestForm />} />
        <Route path="/selectitems" element={<ItemSelect />} />
        <Route path="/orders/:customerId" element={<Orders />} />
        <Route path="/rentalInventoryOrders" element={<RentalInventoryOrders />} />
        <Route path="/shopInventoryOrders" element={<ShopInventoryOrders />} />
        <Route path="/landscapeInventory" element={<LandscapeInventory />} />

        <Route path="/inventoryManagement" element={<InventoryManagement />} />
      </Routes>
      
    </div>
  );
};

export default App;
