import React, { useState, useEffect } from "react";

import {
  BsTruck,
  BsPlusCircle,
  BsPencilSquare,
  BsTrash,
  BsInfoCircle,
} from "react-icons/bs";
import { FaCar, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";

// Import the new API functions
import {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../api/vehicleApi";

const Vehicles = () => {
  // State to hold fetched data
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNo: "",
    type: "",
    status: "Available",
  });
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  // Fetch all vehicles when the component mounts
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getAllVehicles();
      setVehicles(res.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast.error("Failed to load vehicles.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, newVehicle);
        toast.success("Vehicle updated successfully!");
      } else {
        await createVehicle(newVehicle);
        toast.success("New vehicle added successfully!");
      }
      // Reset form and re-fetch data
      setNewVehicle({ vehicleNo: "", type: "", status: "Available" });
      setEditingVehicleId(null);
      setIsModalOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error("Failed to save vehicle:", error);
      toast.error(
        "Failed to save vehicle. Check for duplicate vehicle number."
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(id);
        toast.success("Vehicle deleted successfully.");
        setVehicles(vehicles.filter((v) => v._id !== id));
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
        toast.error("Failed to delete vehicle.");
      }
    }
  };

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setNewVehicle({
        vehicleNo: vehicle.vehicleNo,
        type: vehicle.type,
        status: vehicle.status,
      });
      setEditingVehicleId(vehicle._id);
    } else {
      setNewVehicle({ vehicleNo: "", type: "", status: "Available" });
      setEditingVehicleId(null);
    }
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "badge-success";
      case "In Use":
        return "badge-warning";
      case "Under Maintenance":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gray-100 min-h-screen p-8 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <BsTruck className="mr-3 text-green-700" />
          Vehicle Management
        </h1>

        {/* Add Vehicle Button */}
        <div className="flex justify-end mb-8">
          <button
            className="btn bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={() => openModal()}
          >
            <BsPlusCircle className="mr-2" />
            Add New Vehicle
          </button>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Vehicle List
          </h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Vehicle No.</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover">
                      <td className="font-semibold">{vehicle.vehicleNo}</td>
                      <td>{vehicle.type}</td>
                      <td>
                        <div
                          className={`badge badge-lg ${getStatusBadge(
                            vehicle.status
                          )} text-white`}
                        >
                          {vehicle.status}
                        </div>
                      </td>
                      <td className="text-center space-x-2">
                        <button
                          className="btn btn-sm btn-ghost text-yellow-600"
                          onClick={() => openModal(vehicle)}
                        >
                          <BsPencilSquare size={20} /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-red-500"
                          onClick={() => handleDelete(vehicle._id)}
                        >
                          <FaTrashAlt size={20} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-8">
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Vehicle Modal */}
        <dialog open={isModalOpen} className="modal">
          <div className="modal-box bg-white p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-lg mb-4">
              {editingVehicleId ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>
            <form onSubmit={handleAddOrEditSubmit}>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Vehicle Number</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-lg"
                  name="vehicleNo"
                  value={newVehicle.vehicleNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Vehicle Type</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-lg"
                  name="type"
                  value={newVehicle.type}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered w-full rounded-lg"
                  name="status"
                  value={newVehicle.status}
                  onChange={handleInputChange}
                >
                  <option>Available</option>
                  <option>In Use</option>
                  <option>Under Maintenance</option>
                </select>
              </div>
              <div className="modal-action">
                <button
                  type="submit"
                  className="btn bg-green-700 hover:bg-green-800 text-white"
                >
                  {editingVehicleId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default Vehicles;
