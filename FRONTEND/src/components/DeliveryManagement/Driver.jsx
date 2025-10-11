import React, { useState, useEffect } from "react";

import {
  BsPersonBadge,
  BsPlusCircle,
  BsPencilSquare,
  BsTrash,
  BsClockHistory,
  BsInfoCircle,
} from "react-icons/bs";
import { FaUserPlus, FaUserEdit, FaTrashAlt, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";

// Import API functions from the driverApi.js file
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../../api/driverApi";

const Driver = () => {
  // State to hold the list of drivers fetched from the backend
  const [drivers, setDrivers] = useState([]);
  // State to control modal visibility and form data
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    contact: "",
    licenseNo: "",
    availability: "Available",
  });
  const [editingDriverId, setEditingDriverId] = useState(null);

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
        contact: "",
        licenseNo: "",
        availability: "Available",
      });
      setEditingDriverId(null);
      fetchDrivers();
    } catch (error) {
      console.error("Failed to save driver:", error);
      // Show backend error message if available
      const msg =
        error.response?.data?.message ||
        "Failed to save driver. Please try again.";
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
        contact: driver.contact,
        licenseNo: driver.licenseNo,
        availability: driver.availability,
      });
      setEditingDriverId(driver._id);
    } else {
      setNewDriver({
        name: "",
        contact: "",
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

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case "Available":
        return "badge-success";
      case "Assigned":
        return "badge-warning";
      case "On Leave":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gray-100 min-h-screen p-8 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <BsPersonBadge className="mr-3 text-green-700" />
          Driver Management
        </h1>

        {/* Add Driver Button */}
        <div className="flex justify-end mb-8">
          <button
            className="btn bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={() => openAddModal()}
          >
            <BsPlusCircle className="mr-2" />
            Add New Driver
          </button>
        </div>

        {/* Drivers Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Driver List
          </h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Driver ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>License No</th>
                  <th>Availability</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <tr key={driver._id} className="hover">
                      <td className="font-semibold">{driver._id}</td>
                      <td>{driver.name}</td>
                      <td>{driver.contact}</td>
                      <td>{driver.licenseNo}</td>
                      <td>
                        <div
                          className={`badge ${getAvailabilityBadge(
                            driver.availability
                          )} text-white`}
                        >
                          {driver.availability}
                        </div>
                      </td>
                      <td className="text-center space-x-2">
                        <button
                          className="btn btn-sm btn-ghost text-green-700"
                          onClick={() => openHistoryModal(driver)}
                        >
                          <FaHistory size={20} /> History
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-yellow-600"
                          onClick={() => openAddModal(driver)}
                        >
                          <FaUserEdit size={20} /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-red-500"
                          onClick={() => handleDelete(driver._id)}
                        >
                          <FaTrashAlt size={20} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-8">
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
            <h3 className="font-bold text-lg mb-4">
              {editingDriverId ? "Edit Driver" : "Add New Driver"}
            </h3>
            <form onSubmit={handleAddOrEditSubmit}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-lg"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Contact No</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-lg"
                  value={newDriver.contact}
                  maxLength={10}
                  pattern="\d{10}"
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      contact: e.target.value.replace(/\D/g, ""), // Only digits allowed
                    })
                  }
                  required
                  placeholder="Enter 10-digit contact number"
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">License No</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-lg"
                  value={newDriver.licenseNo}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, licenseNo: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Availability Status</span>
                </label>

                <select
                  className="select select-bordered w-full rounded-lg"
                  value={newDriver.availability}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, availability: e.target.value })
                  }
                  required
                >
                  <option>Available</option>
                  <option>Assigned</option>
                  <option>On Leave</option>
                </select>
              </div>
              <div className="modal-action">
                <button
                  type="submit"
                  className="btn bg-green-700 hover:bg-green-800 text-white"
                >
                  {editingDriverId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
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
            <h3 className="font-bold text-lg mb-4">
              Completed Deliveries for {selectedDriver?.name}
            </h3>
            <div className="overflow-x-auto">
              <p className="text-gray-500 italic">
                This feature is not yet connected to the backend. The data below
                is for demonstration only.
              </p>
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* This data would be fetched from a specific driver's delivery history endpoint */}
                  {/* For now, it remains as a placeholder to show the modal functionality */}
                  {selectedDriver &&
                    selectedDriver.deliveries &&
                    selectedDriver.deliveries.map((delivery, index) => (
                      <tr key={index}>
                        <td>{delivery.id}</td>
                        <td>{delivery.customer}</td>
                        <td>{delivery.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
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
