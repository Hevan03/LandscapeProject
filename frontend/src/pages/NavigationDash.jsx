import React from 'react';
import { Link } from 'react-router-dom';
import { BsGrid, BsTruck, BsCashStack, BsPerson } from 'react-icons/bs';

const NavigationDash = () => {
    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-12">Main Dashboard</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
                
                {/* Admin Payments Card */}
                <Link to="/Admin-dashboard" className="card w-full bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body items-center text-center">
                        <BsCashStack className="text-green-500 mb-4" size={48} />
                        <h2 className="card-title text-2xl">Admin Dashboard</h2>
                        <p className="text-gray-500">View all customer payment records.</p>
                    </div>
                </Link>

                {/* Inventory Payments Card */}
                <Link to="/PaymentManagement/InventoryPay" className="card w-full bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body items-center text-center">
                        <BsGrid className="text-blue-500 mb-4" size={48} />
                        <h2 className="card-title text-2xl">Inventory Payments</h2>
                        <p className="text-gray-500">Customer-side inventory payment form.</p>
                    </div>
                </Link>

                {/* Service Payments Card */}
                <Link to="/PaymentManagement/Servicepay" className="card w-full bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body items-center text-center">
                        <BsTruck className="text-yellow-500 mb-4" size={48} />
                        <h2 className="card-title text-2xl">Service Payments</h2>
                        <p className="text-gray-500">Customer-side service payment form.</p>
                    </div>
                </Link>

                {/* Driver Dashboard Card */}
                <Link to="/Driver-dashboard" className="card w-full bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body items-center text-center">
                        <BsPerson className="text-purple-500 mb-4" size={48} />
                        <h2 className="card-title text-2xl">Driver Dashboard</h2>
                        <p className="text-gray-500">Manage driver and delivery details.</p>
                    </div>
                </Link>

            </div>
        </div>
    );
};

export default NavigationDash;