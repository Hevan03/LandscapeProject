import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const DriverDash = () => {
    const [driverData, setDriverData] = useState({
        username: 'Kamal Herath',
        vehicle: 'Van',
        driverId: ''
    });
    const [deliveries, setDeliveries] = useState([]);

    const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
    const [accidentDetails, setAccidentDetails] = useState('');
    const [photos, setPhotos] = useState([]);
    const [accidentReport, setAccidentReport] = useState({
        driverId: '',
        vehicleNo: '',
        deliveryId: '',
        description: ''
    });

    // Static demo content used only when live data is empty
    const demoDeliveries = [
        { id: '000234', customer: 'Nimal Perera', vehicle: 'LKA-1023', status: 'Assigned' },
        { id: '000235', customer: 'Chamari Silva', vehicle: 'LKA-3309', status: 'In Transit' },
        { id: '000236', customer: 'Ruwan Jayasuriya', vehicle: 'LKA-1023', status: 'Delivered' },
    ];

    const demoAccidents = [
        { id: 'AR-1021', date: '2025-09-10 09:32', location: 'Kandy Rd, Kiribathgoda', status: 'Resolved' },
        { id: 'AR-1044', date: '2025-09-14 16:05', location: 'Baseline Rd, Colombo 09', status: 'Under Investigation' },
    ];

    // On mount: find the single driver (Kamal Herath) and fetch his deliveries
    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const res = await fetch('http://localhost:5000/drivers');
                if (!res.ok) throw new Error('Failed to fetch drivers');
                const allDrivers = await res.json();
                const kamal = allDrivers.find(d => (d.name || d.username) === 'Kamal Herath');
                if (kamal && kamal._id) {
                    setDriverData(prev => ({ ...prev, driverId: kamal._id }));
                    setAccidentReport(prev => ({ ...prev, driverId: kamal._id }));
                    fetchDriverDeliveries(kamal._id);
                } else {
                    toast.error('Driver "Kamal Herath" not found. Please add him in the admin panel.');
                }
            } catch (e) {
                console.error(e);
                toast.error('Unable to load driver info.');
            }
        };
        fetchDriver();
    }, []);

    // Function to fetch driver's assigned deliveries
    const fetchDriverDeliveries = async (driverProfileId) => {
        try {
            const response = await fetch(`http://localhost:5000/delivery-assignments/driver/${driverProfileId}`);
            if (response.ok) {
                const deliveries = await response.json();
                setDeliveries(deliveries);
            }
        } catch (error) {
            console.error("Failed to fetch driver deliveries:", error);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length <= 6) {
            setPhotos([...photos, ...files]);
        } else {
            toast.error('You can only upload up to 6 photos.');
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Prepare the accident report data
            const reportData = {
                driverId: accidentReport.driverId,
                vehicleNo: accidentReport.vehicleNo,
                deliveryId: accidentReport.deliveryId,
                description: accidentDetails,
                photos: photos.length > 0 ? photos.map(file => ({ name: file.name, url: 'placeholder-url' })) : [],
                time: new Date(),
                status: 'Reported'
            };

            // Send to backend (no auth header needed in this simple flow)
            const response = await fetch('http://localhost:5000/accident-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (response.ok) {
                toast.success('Accident report submitted successfully! Admin has been notified.');
                
                // Reset the form
                setAccidentDetails('');
                setPhotos([]);
                setAccidentReport({ 
                    driverId: driverData.driverId, 
                    vehicleNo: '',
                    deliveryId: '',
                    description: ''
                });
                setIsAccidentModalOpen(false);
            } else {
                throw new Error('Failed to submit accident report');
            }
        } catch (error) {
            console.error('Error submitting accident report:', error);
            toast.error('Failed to submit accident report. Please try again.');
        }
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Driver Dashboard</h1>
                <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="avatar">
                            <div className="w-16 rounded-full ring ring-green-700 ring-offset-base-100 ring-offset-2">
                                <img src="https://placehold.co/64x64/E0F2F1/004D40?text=JD" alt="Driver Profile" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700">Hi, {driverData.username}!</h2>
                            <p className="text-sm text-gray-500">Driver ID: {driverData.driverId}</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
                        <button
                            className="btn bg-green-800 hover:bg-green-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                            onClick={() => setIsAccidentModalOpen(true)}
                        >
                            <span className="mr-2">🚗</span>
                            Report an Accident
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Assigned Deliveries Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2 text-green-700">🚚</span> My Deliveries
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Vehicle</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveries.length > 0 ? (
                                            deliveries.map(delivery => (
                                                <tr key={delivery._id}>
                                                    <td>{delivery.orderId?._id?.substring(18) || 'N/A'}</td>
                                                    <td>{delivery.orderId?.customerId?.name || 'N/A'}</td>
                                                    <td>{delivery.vehicleId?.vehicleNo || 'N/A'}</td>
                                                    <td>
                                                        <div className={`badge ${
                                                            delivery.status === 'Assigned' ? 'badge-warning' :
                                                            delivery.status === 'In Transit' ? 'badge-info' :
                                                            delivery.status === 'Delivered' ? 'badge-success' : 'badge-ghost'
                                                        }`}>
                                                            {delivery.status}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            demoDeliveries.map(d => (
                                                <tr key={d.id}>
                                                    <td>{d.id}</td>
                                                    <td>{d.customer}</td>
                                                    <td>{d.vehicle}</td>
                                                    <td>
                                                        <div className={`badge ${
                                                            d.status === 'Assigned' ? 'badge-warning' :
                                                            d.status === 'In Transit' ? 'badge-info' :
                                                            d.status === 'Delivered' ? 'badge-success' : 'badge-ghost'
                                                        }`}>
                                                            {d.status}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Accident Reports (Static Demo) */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2 text-red-600">⚠️</span> Recent Accident Reports
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Report ID</th>
                                            <th>Date & Time</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demoAccidents.map(a => (
                                            <tr key={a.id}>
                                                <td>{a.id}</td>
                                                <td>{a.date}</td>
                                                <td>{a.location}</td>
                                                <td>
                                                    <div className={`badge ${a.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                                                        {a.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Driver Profile Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2 text-green-700">🚗</span> Vehicle Information
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <p className="text-lg">
                                    <span className="font-medium">Driver:</span> {driverData.username}
                                </p>
                                <p className="text-lg">
                                    <span className="font-medium">Vehicle:</span> {driverData.vehicle}
                                </p>
                            </div>
                        </div>

                        {/* Driver Rating (Static Demo) */}
                        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Driver Rating</h3>
                            <div className="flex items-center mb-1">
                                <div className="text-yellow-500 text-xl mr-2">★★★★★</div>
                                <span className="text-gray-700 font-semibold">4.6</span>
                                <span className="text-gray-500 ml-2 text-sm">(120 reviews)</span>
                            </div>
                            <p className="text-sm text-gray-600">Great communication and timely deliveries. Keep up the safe driving!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accident Report Modal */}
            <dialog id="accident_modal" className={`modal ${isAccidentModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-2xl rounded-2xl shadow-xl bg-gradient-to-br from-green-50 to-white text-gray-800 border border-green-200">
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle absolute right-2 top-2 bg-gray-100 hover:bg-gray-200 text-gray-600"
                            onClick={() => setIsAccidentModalOpen(false)}
                        >
                            ✕
                        </button>
                    </form>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <span className="text-2xl">🚗</span>
                        </div>
                        <h3 className="font-bold text-2xl text-gray-800 mb-2">Report an Accident</h3>
                        <p className="text-sm text-gray-600">
                            Please provide details and photos of the incident.
                        </p>
                    </div>
                    <form onSubmit={handleReportSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Driver ID</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-300 text-gray-800 focus:border-green-500 focus:bg-white"
                                    value={accidentReport.driverId}
                                    readOnly
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Vehicle Number</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full rounded-xl bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    placeholder="Enter Vehicle Number"
                                    value={accidentReport.vehicleNo}
                                    onChange={(e) => setAccidentReport({ ...accidentReport, vehicleNo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium text-gray-700">Delivery ID (Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full rounded-xl bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    placeholder="Enter Delivery ID"
                                    value={accidentReport.deliveryId}
                                    onChange={(e) => setAccidentReport({ ...accidentReport, deliveryId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-control my-4">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Accident Details</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-24 w-full rounded-xl bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                placeholder="Describe the incident here..."
                                value={accidentDetails}
                                onChange={(e) => setAccidentDetails(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text font-medium text-gray-700">Attach Photos (up to 6)</span>
                            </label>
                            <input
                                type="file"
                                className="file-input file-input-bordered w-full rounded-xl bg-white border-gray-300 text-gray-800 file:bg-green-50 file:border-green-300 file:text-green-700 hover:file:bg-green-100 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        {photos.length > 0 && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                    <span className="mr-2">📷</span>
                                    Attached Photos ({photos.length}/6)
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {photos.map((file, index) => (
                                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-green-300 group shadow-md">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="modal-action mt-6">
                            <button type="submit" className="btn bg-green-600 hover:bg-green-700 text-white w-full rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                <span className="mr-2">📸</span>
                                Submit Report
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default DriverDash;
