import React from 'react';

const PaymentPortal = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-10 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-700">Payment Portal</h1>
        <p className="mt-4 text-lg text-gray-600">Your appointment is pending. Please complete the payment to confirm.</p>
        <p className="mt-2 text-gray-500">(Payment gateway integration is the next step!)</p>
      </div>
    </div>
  );
};

export default PaymentPortal;