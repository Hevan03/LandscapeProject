import React, { useState, useEffect } from "react";

import { BsPersonBadge, BsPlusCircle } from "react-icons/bs";
import { FaUserEdit, FaTrashAlt, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";

// Import API functions from the driverApi.js file
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from "../../api/driverApi";

const Driver = () => {
  // State to hold the list of drivers fetched from the backend
  const [drivers, setDrivers] = useState([]);
  // State to control modal visibility and form data
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNo: "",
    availability: "Available",
  });
  const [editingDriverId, setEditingDriverId] = useState(null);

  const getAvailabilityBadgeClasses = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Assigned":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "On Leave":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Normalize availability status to a displayable string
  const resolveDriverStatus = (driver) => {
    // Common backend field variants
    if (typeof driver?.availability === "string") return driver.availability;
    if (typeof driver?.driveravailability === "string") return driver.driveravailability;
    if (typeof driver?.availabilityStatus === "string") return driver.availabilityStatus;
    // Fallback when only schedule array exists
    return "Available";
  };

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Function to fetch all drivers from the backend
  const fetchDrivers = async () => {
    try {
      const response = await getAllDrivers();
      setDrivers(response.data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      toast.error("Failed to load drivers.");
    }
  };
  const handleAddOrEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriverId) {
        await updateDriver(editingDriverId, newDriver);
        toast.success("Driver updated successfully!");
      } else {
        await createDriver(newDriver);
        toast.success("New driver added successfully!");
      }
      setIsAddModalOpen(false);
      setNewDriver({
        name: "",
        phone: "",
        licenseNo: "",
        availability: "Available",
      });
      setEditingDriverId(null);
      fetchDrivers();
    } catch (error) {
      console.error("Failed to save driver:", error);
      // Show backend error message if available
      const msg = error.response?.data?.message || "Failed to save driver. Please try again.";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriver(id);
        toast.success("Driver deleted successfully.");
        // Update the state to remove the deleted driver
        setDrivers(drivers.filter((d) => d._id !== id));
      } catch (error) {
        console.error("Failed to delete driver:", error);
        toast.error("Failed to delete driver.");
      }
    }
  };

  const openAddModal = (driver = null) => {
    if (driver) {
      setNewDriver({
        name: driver.name,
        phone: driver.phone,
        licenseNo: driver.licenseNo,
        availability: resolveDriverStatus(driver),
      });
      setEditingDriverId(driver._id);
    } else {
      setNewDriver({
        name: "",
        phone: "",
        licenseNo: "",
        availability: "Available",
      });
      setEditingDriverId(null);
    }
    setIsAddModalOpen(true);
  };

  const openHistoryModal = (driver) => {
    setSelectedDriver(driver);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BsPersonBadge className="text-green-700 w-7 h-7" />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Driver Management</h1>
              <p className="text-gray-600">View, add, edit, and manage your delivery drivers.</p>
            </div>
          </div>
          {/* <button
            className="inline-flex items-center px-4 py-2 rounded-md border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            onClick={() => openAddModal()}
          >
            <BsPlusCircle className="mr-2" /> Add New Driver
          </button> */}
        </div>

        {/* Drivers Table */}
        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Driver List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-700">{driver._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.licenseNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const status = resolveDriverStatus(driver);
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityBadgeClasses(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex gap-2">
                          <button
                            className="px-3 py-1.5 rounded-md border border-green-300 text-green-800 bg-green-50 hover:bg-green-100 inline-flex items-center gap-1"
                            onClick={() => openHistoryModal(driver)}
                          >
                            <FaHistory size={16} /> History
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-md border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 inline-flex items-center gap-1"
                            onClick={() => openAddModal(driver)}
                          >
                            <FaUserEdit size={16} /> Edit
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-md border border-red-300 text-red-800 bg-red-50 hover:bg-red-100 inline-flex items-center gap-1"
                            onClick={() => handleDelete(driver._id)}
                          >
                            <FaTrashAlt size={16} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No drivers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Driver Modal */}
        <dialog open={isAddModalOpen} className="modal">
          <div className="modal-box bg-white p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-lg mb-4">{editingDriverId ? "Edit Driver" : "Add New Driver"}</h3>
            <form onSubmit={handleAddOrEditSubmit}>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  required
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newDriver.phone}
                  maxLength={10}
                  pattern="\d{10}"
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  required
                  placeholder="Enter 10-digit contact number"
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">License No</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newDriver.licenseNo}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNo: e.target.value })}
                  required
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newDriver.availability}
                  onChange={(e) => setNewDriver({ ...newDriver, availability: e.target.value })}
                  required
                >
                  <option>Available</option>
                  <option>Assigned</option>
                  <option>On Leave</option>
                </select>
              </div>
              <div className="modal-action">
                <button type="submit" className="px-4 py-2 rounded-md border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100">
                  {editingDriverId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Driver History Modal */}
        <dialog open={isHistoryModalOpen} className="modal">
          <div className="modal-box bg-white p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-lg mb-4">Completed Deliveries for {selectedDriver?.name}</h3>
            <div className="overflow-x-auto">
              <p className="text-gray-500 italic mb-3">This feature is not yet connected to the backend. The data below is for demonstration only.</p>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {selectedDriver &&
                    selectedDriver.deliveries &&
                    selectedDriver.deliveries.map((delivery, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{delivery.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{delivery.customer}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{delivery.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 bg-gray-50 hover:bg-gray-100"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default Driver;
