import React, { useState } from "react";
import ShopDashboardContent from "./ShopDashboardContent"; // Your original shop component logic
import MachineryShop from "../../components/Inventory/MachineryShop";

const ShopDashboard = () => {
  const [activeShop, setActiveShop] = useState("shop"); // "shop" or "machinery"

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 pt-24 px-4 sm:px-6 lg:px-8">
        {/* Shop Type Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-xl shadow p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="shopType"
                value="shop"
                checked={activeShop === "shop"}
                onChange={() => setActiveShop("shop")}
                className="form-radio text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-lg font-medium text-gray-700">Product Shop</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="shopType"
                value="machinery"
                checked={activeShop === "machinery"}
                onChange={() => setActiveShop("machinery")}
                className="form-radio text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-lg font-medium text-gray-700">Machinery Rental</span>
            </label>
          </div>
        </div>

        {/* Shop Content */}
        <div>{activeShop === "shop" ? <ShopDashboardContent /> : <MachineryShop />}</div>
      </div>
    </div>
  );
};

export default ShopDashboard;
