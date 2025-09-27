import React, { useRef } from 'react';
import { BsCartCheck, BsInfoCircle, BsReceipt, BsCashStack, BsDownload } from 'react-icons/bs';
import { FaFileUpload, FaCheckCircle } from 'react-icons/fa';
import useInventoryPayments from '../../hooks/useInventoryPayments'; // Import the custom hook
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const InventoryPayments = () => {
    const {
        loading,
        orderId,
        customerId,
        displayOrder,
        customerName,
        setCustomerName,
        customerAddress,
        setCustomerAddress,
        contactNumber,
        handleContactNumberChange,
        contactNumberError,
        optionalContactNumber,
        setOptionalContactNumber,
        bankSlip,
        handleFileUpload,
        notes,
        setNotes,
        handleSubmitPayment,
        isReceiptModalOpen,
        setIsReceiptModalOpen
    } = useInventoryPayments();

    const receiptRef = useRef();

    const handleDownloadReceipt = () => {
        const input = receiptRef.current;
        if (input) {
            html2canvas(input).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`receipt_${orderId?.substring(18)}.pdf`);
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen p-8 font-sans">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!orderId || !customerId) {
        return (
            <div className="bg-gray-100 min-h-screen p-8 font-sans">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center">
                        <BsInfoCircle className="mx-auto text-6xl text-blue-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Order Information</h2>
                        <p className="text-gray-600 mb-6">This payment page requires order information. Please complete your order first through the inventory system.</p>
                        <div className="space-y-3">
                            <button onClick={() => window.history.back()} className="btn btn-primary mr-3">
                                Go Back
                            </button>
                            <button onClick={() => window.location.href = '/'} className="btn btn-outline">
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <BsCashStack className="mr-3 text-green-700" />
                    Checkout – Inventory Payments
                </h1>
                <p className="text-gray-500 mb-8">Review your order and complete the payment.</p>

                {/* Order Information Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Order Information</h3>
                    <p className="text-sm text-blue-700">
                        <strong>Order ID:</strong> {orderId?.substring(18) || 'N/A'} |
                        <strong> Customer:</strong> {displayOrder?.customerId?.name || 'N/A'}
                    </p>
                </div>

                {/* Cart Summary Section */}
                <div className="card border border-gray-200 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <BsCartCheck className="mr-2 text-green-700" />
                        Order Summary
                    </h2>
                    {displayOrder && displayOrder.items && displayOrder.items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.itemName} /> : <BsCartCheck />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{item.itemName}</div>
                                                </div>
                                            </td>
                                            <td>LKR {item.pricePerItem.toLocaleString()}</td>
                                            <td>{item.quantity}</td>
                                            <td className="font-bold">LKR {item.totalPrice.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <BsInfoCircle className="mx-auto text-4xl mb-2" />
                            <p>No items found for this order.</p>
                        </div>
                    )}
                </div>

                {/* Payment & Customer Details Section */}
                <form onSubmit={handleSubmitPayment}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Total Payment */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Total Payment (LKR)</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full rounded-lg bg-gray-100 border-gray-300"
                                value={displayOrder.totalAmount.toLocaleString()}
                                disabled
                            />
                        </div>

                        {/* Customer Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Customer Name</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full rounded-lg"
                                placeholder="Enter customer's name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Customer Address */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Customer Address</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full rounded-lg h-24"
                                placeholder="Enter customer's address"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        {/* Contact Number */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Contact Number</span>
                            </label>
                            <input
                                type="text"
                                className={`input input-bordered w-full rounded-lg ${contactNumberError ? 'border-red-500' : ''}`}
                                placeholder="Enter a valid contact number"
                                value={contactNumber}
                                onChange={handleContactNumberChange}
                                required
                            />
                            {contactNumberError && <p className="text-red-500 text-sm mt-1">{contactNumberError}</p>}
                        </div>

                        {/* Optional Contact Number */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Optional Contact Number</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full rounded-lg"
                                placeholder="Enter an optional contact number"
                                value={optionalContactNumber}
                                onChange={(e) => setOptionalContactNumber(e.target.value)}
                            />
                        </div>

                        {/* Bank Slip Upload */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Bank Slip</span>
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    accept=".jpg, .jpeg, .png, .pdf"
                                    onChange={handleFileUpload}
                                    className="file-input file-input-bordered file-input-success w-full rounded-lg"
                                    required
                                />
                                {bankSlip && <FaCheckCircle className="text-green-500 text-xl" />}
                            </div>
                            <label className="label">
                                <span className="label-text text-gray-500 text-sm">Accepted formats: JPG, PNG, PDF</span>
                            </label>
                        </div>

                        {/* Notes */}
                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Notes (Optional)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full rounded-lg h-24"
                                placeholder="Any additional notes about the payment or delivery"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button type="submit" className="btn btn-success btn-lg text-white font-bold">
                            <FaCheckCircle />
                            Submit Payment
                        </button>
                    </div>
                </form>

                {/* Receipt Modal */}
                <dialog id="receipt-modal" className={`modal ${isReceiptModalOpen ? 'modal-open' : ''}`}>
                    <div className="modal-box w-11/12 max-w-2xl bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-2xl text-green-700">
                                <BsReceipt className="inline mr-2" /> Payment Receipt
                            </h3>
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={() => setIsReceiptModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 mb-4" ref={receiptRef}>
                            <h4 className="font-bold text-lg mb-2">Company Name</h4>
                            <p className="text-sm font-semibold">Receipt for Order #{orderId?.substring(18)}</p>
                            <p className="text-sm">Customer Name: {customerName}</p>
                            <p className="text-sm">Contact Number: {contactNumber}</p>
                            {optionalContactNumber && <p className="text-sm">Optional Contact: {optionalContactNumber}</p>}
                            <p className="text-sm">Total Amount: <span className="font-bold">LKR {displayOrder.totalAmount.toLocaleString()}</span></p>
                            <p className="text-sm">Status: <span className="font-bold text-green-700">Submitted for Review</span></p>
                            <p className="text-xs mt-2 text-gray-500">
                                Your payment is being reviewed by our admin team. You will be notified once it's confirmed.
                            </p>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-outline btn-success"
                                onClick={handleDownloadReceipt}
                            >
                                <BsDownload /> Download
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={() => setIsReceiptModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
    );
};

export default InventoryPayments;