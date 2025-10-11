import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const DriverDash = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const driver = location.state?.driver;

  // If driver is passed from login, use it; otherwise, fetch from backend
  const [driverData, setDriverData] = useState(
    driver
      ? {
          username: driver.name || driver.username,
          vehicle: driver.vehicle || "",
          driverId: driver._id || "",
          email: driver.email || "",
          contact: driver.contact || "",
          licenseNo: driver.licenseNo || "",
        }
      : {
          username: "",
          vehicle: "",
          driverId: "",
          email: "",
          contact: "",
          licenseNo: "",
        }
  );
  const [deliveries, setDeliveries] = useState([]);
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [accidentDetails, setAccidentDetails] = useState("");
  const [accidents, setAccidents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [accidentReport, setAccidentReport] = useState({
    driverId: driverData.driverId,
    vehicleNo: "",
    deliveryId: "",
    description: "",
  });

  // Fetch driver details if not passed from login
  useEffect(() => {
    const driverId = driver.id;

    if (!driverId) {
      toast.error("Driver ID not found. Please log in again.");
      return;
    }

    const fetchDriver = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/delivery/driver/${driverId}`, { credentials: "include" });

        if (!res.ok) throw new Error("Failed to fetch driver");
        const driverInfo = await res.json();
        // ...inside fetchDriver success...
        setDriverData({
          name: driverInfo.name || "",
          username: driverInfo.name || driverInfo.username || "",
          vehicle: driverInfo.vehicle || "",
          driverId: driverInfo._id || "",
          email: driverInfo.email || "",
          contact: driverInfo.contact || "",
          licenseNo: driverInfo.licenseNo || "",
        });

        setAccidentReport((prev) => ({
          ...prev,
          driverId: driverInfo._id || "",
        }));
        fetchDriverDeliveries(driverInfo._id);
      } catch (e) {
        toast.error("Unable to load driver info.");
      }
    };
    fetchDriver();
    setAccidentReport((prev) => ({
      ...prev,
      driverId: driver._id || "",
    }));
    fetchDriverDeliveries(driver._id);
    fetchAccidentReports(driver._id);
    fetchDriverDeliveries(driverData.driverId);
  }, [driverData.driverId]);

  const fetchDriverDeliveries = async (driverId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/delivery/assignments/driver/${driver.id}`, { credentials: "include" });
      if (response.ok) {
        const deliveries = await response.json();
        setDeliveries(deliveries);
      } else {
        setDeliveries([]);
        toast.error("No deliveries found for this driver.");
      }
    } catch (error) {
      setDeliveries([]);
      toast.error("Failed to fetch driver deliveries.");
    }
  };

  const fetchAccidentReports = async (driverId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/delivery/accident-reports?driverId=${driverId}`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setAccidents(data);
      }
    } catch (error) {
      toast.error("Failed to fetch accident reports.");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length <= 6) {
      setPhotos([...photos, ...files]);
    } else {
      toast.error("You can only upload up to 6 photos.");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const reportData = {
        driverId: accidentReport.driverId,
        vehicleNo: accidentReport.vehicleNo,
        deliveryId: accidentReport.deliveryId,
        location: accidentReport.location,
        description: accidentDetails,
        photos:
          photos.length > 0
            ? photos.map((file) => ({
                name: file.name,
                url: "placeholder-url",
              }))
            : [],
        time: new Date(),
        status: "Reported",
      };
      const response = await fetch("http://localhost:5001/api/delivery/accident-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      if (response.ok) {
        toast.success("Accident report submitted successfully!");
        setAccidentDetails("");
        setPhotos([]);
        setAccidentReport({
          driverId: driverData.driverId,
          vehicleNo: "",
          deliveryId: "",
          description: "",
        });
        setIsAccidentModalOpen(false);
        fetchAccidentReports(driverData.driverId);
      } else {
        throw new Error("Failed to submit accident report");
      }
    } catch (error) {
      toast.error("Failed to submit accident report. Please try again.");
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    // Add logout logic here
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen py-6 font-sans">
      <div className=" px-6 lg:px-20 mx-20">
        {/* Header with Logout Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Driver Profile Card */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-md mb-8 border border-green-100 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {driverData.username ? driverData.username.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">Hi, {driverData.name || driverData.username || "Driver"}!</h2>
              <p className="text-sm text-gray-500">Driver ID: {driverData.driverId}</p>
              <p className="text-sm text-gray-500">Email: {driverData.email}</p>
              <p className="text-sm text-gray-500">Contact: {driverData.contact}</p>
              <p className="text-sm text-gray-500">License No: {driverData.licenseNo}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-green-700 hover:to-green-600 font-medium"
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
            <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2 text-green-700">🚚</span> My Deliveries
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-left">
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm rounded-tl-lg">Order ID</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm">Customer</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm">Driver</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm">Vehicle</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveries.map((delivery) => (
                      <tr key={delivery._id} className="hover:bg-green-50/50 transition-colors text-sm">
                        <td className="px-4 py-3 text-gray-700">{delivery.orderId?._id?.substring(18) || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-700">{delivery.orderId?.customerId?.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-700">{delivery.driverId?.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-700">{delivery.vehicleId?.vehicleNo || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              delivery.status === "Assigned"
                                ? "bg-yellow-100 text-yellow-800"
                                : delivery.status === "In Transit"
                                ? "bg-blue-100 text-blue-800"
                                : delivery.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {delivery.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {deliveries.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No deliveries assigned yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Accident Reports */}
            <div className="bg-white p-6 rounded-2xl shadow-md mt-6 border border-green-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2 text-red-600">⚠️</span> Recent Accident Reports
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-left">
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm rounded-tl-lg">Report ID</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm">Date & Time</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm">Description</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm">Location</th>
                      <th className="px-4 py-3 text-green-700 font-semibold text-sm rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {accidents.map((a) => (
                      <tr key={a._id} className="hover:bg-green-50/50 transition-colors text-sm">
                        <td className="px-4 py-3 text-gray-700">{a._id?.slice(-6)}</td>
                        <td className="px-4 py-3 text-gray-700">{new Date(a.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-700">{a.description}</td>
                        <td className="px-4 py-3 text-gray-700">{a.location}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              a.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {accidents.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No accident reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Driver Profile Section */}
          <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between border border-green-100 bg-gradient-to-br from-white to-green-50/50">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2 text-green-700">🚗</span> Vehicle Information
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="text-md">
                  <span className="font-medium">Driver:</span> {driverData.username}
                </p>
                <p className="text-md">
                  <span className="font-medium">Vehicle:</span> {driverData.vehicle}
                </p>
              </div>
            </div>

            {/* Driver Rating */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Driver Rating</h3>
              <div className="flex items-center mb-1">
                <div className="text-green-500 text-xl mr-2">★★★★★</div>
                <span className="text-gray-700 font-semibold">4.6</span>
                <span className="text-gray-500 ml-2 text-sm">(120 reviews)</span>
              </div>
              <p className="text-sm text-gray-600">Great communication and timely deliveries. Keep up the safe driving!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accident Report Modal */}
      <dialog id="accident_modal" className={`modal ${isAccidentModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box w-11/12 max-w-2xl rounded-2xl shadow-xl bg-gradient-to-br from-green-50 to-white text-gray-800 border border-green-100">
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
            <p className="text-sm text-gray-600">Please provide details and photos of the incident.</p>
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
                  onChange={(e) =>
                    setAccidentReport({
                      ...accidentReport,
                      vehicleNo: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-control ">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">Delivery ID (Optional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="Enter Delivery ID"
                  value={accidentReport.deliveryId}
                  onChange={(e) =>
                    setAccidentReport({
                      ...accidentReport,
                      deliveryId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="Enter Location of Accident"
                  value={accidentReport.location}
                  onChange={(e) =>
                    setAccidentReport({
                      ...accidentReport,
                      location: e.target.value,
                    })
                  }
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
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-action mt-6">
              <button
                type="submit"
                className="btn bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white w-full rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
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
