import React, { useState, useEffect } from 'react';
import { BsCashCoin, BsFileText, BsSearch, BsCheckCircle, BsDownload } from 'react-icons/bs';
import { FaFilter } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// Import the new API functions
import {
    getAllInventoryPayments,
    getAllServicePayments
} from "../api/adminPaymentApi"; // Correct path


const AdminPaymentDashboard = () => {
    const [inventoryPayments, setInventoryPayments] = useState([]);
    const [servicePayments, setServicePayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [inventoryRes, serviceRes] = await Promise.all([
                    getAllInventoryPayments(),
                    getAllServicePayments()
                ]);
                setInventoryPayments(inventoryRes.data);
                setServicePayments(serviceRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch payment data:", err);
                setError("Failed to load payment data. Please try again later.");
                setLoading(false);
                toast.error("Failed to load payment data.");
            }
        };
        fetchData();
    }, []);

    const allPayments = [
        ...inventoryPayments.map(p => ({ ...p, type: 'Inventory' })),
        ...servicePayments.map(p => ({ ...p, type: 'Service' }))
    ];

    const monthlyPaymentData = allPayments.reduce((acc, payment) => {
        const date = new Date(payment.createdAt || payment.date);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const existingMonth = acc.find(item => item.month === month);

        if (existingMonth) {
            existingMonth.totalAmount += payment.totalAmount || payment.amount;
        } else {
            acc.push({ month, totalAmount: payment.totalAmount || payment.amount });
        }
        return acc;
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading payments...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <BsCashCoin className="mr-3 text-green-700" />
                Admin Payment Dashboard
            </h1>

            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Payment Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyPaymentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `LKR ${value.toLocaleString()}`} />
                        <Bar dataKey="totalAmount" fill="#4ade80" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">All Payment Records</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Amount (LKR)</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th className="text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPayments.length > 0 ? (
                                allPayments.map(payment => (
                                    <tr key={payment._id || payment.id} className="hover">
                                        <td className="font-semibold">{payment.orderId || payment.id}</td>
                                        <td>{payment.customer || 'N/A'}</td>
                                        <td>{payment.totalAmount ? `LKR ${payment.totalAmount.toLocaleString()}` : `LKR ${payment.amount.toLocaleString()}`}</td>
                                        <td><div className={`badge badge-ghost`}>{payment.type}</div></td>
                                        <td><div className={`badge ${payment.status === 'Completed' ? 'badge-success' : 'badge-warning'} text-white`}>{payment.status}</div></td>
                                        <td>{new Date(payment.createdAt || payment.date).toLocaleDateString()}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-info text-white">
                                                <BsFileText /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-gray-500 py-8">No payment records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentDashboard;