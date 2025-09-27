import React from 'react';

const Navbar = () => {
  return (
  <header className="shadow-lg">
      {/* Wrapper for both header and navbar with the specific gradient */}
      <div className="bg-gradient-to-b from-[#134E1A] to-green-500 text-white"> 
        {/* Top Header with Logo */}
        <div className="py-6 text-center relative">
          <h1 className="text-4xl font-extrabold tracking-wide flex justify-center items-center gap-2">
            LeafSphere
          </h1>
          <p className="text-green-100 text-sm mt-1">
            Connecting Nature, People & Sustainability
          </p>
        </div>


            {/* Navigation */}
          <nav>
            <ul className="flex space-x-6 text-lg font-medium">
              <li>
                <a href="/Admin-dashboard" className="hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/DeliveryManagement/vehicles" className="hover:text-primary transition-colors">
                  Vehicles
                </a>
              </li>
              <li>
                <a href="/DeliveryManagement/delivery-reports" className="hover:text-primary transition-colors">
                  Reports
                </a>
              </li>
              <li>
                <a href="/DeliveryManagement/delivery-assign" className="hover:text-primary transition-colors">
                  Deliveries
                </a>
              </li>
              <li>
                <a href="/DeliveryManagement/driver" className="hover:text-primary transition-colors">
                  Drivers
                </a>
              </li>
            </ul>
          </nav>
            
        </div>
      

  </header>
    
  );
}

export default Navbar;