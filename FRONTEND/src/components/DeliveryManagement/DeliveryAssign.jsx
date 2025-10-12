import React, { useState, useEffect } from "react";
import { BsCheckCircle } from "react-icons/bs";
import toast from "react-hot-toast";

// Import all API functions
import {
  getOrdersForAssignment,
  getAvailableDrivers,
  getAvailableVehicles,
  createNewAssignment,
  getAssignedDeliveries,
  getPendingOrders,
  updateAssignmentStatus,
} from "../../api/deliveryAssignApi";

const DeliveryAssign = () => {
  const [ordersForAssignment, setOrdersForAssignment] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, driversRes, vehiclesRes, assignedRes, pendingRes] = await Promise.all([
        getOrdersForAssignment(),
        getAvailableDrivers(),
        getAvailableVehicles(),
        getAssignedDeliveries(),
        getPendingOrders(),
      ]);

      setOrdersForAssignment(ordersRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setAssignedDeliveries(assignedRes.data);
      setPendingOrders(pendingRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data. Please try again.");
    }
  };

  // Open assignment modal
  const handleOpenAssignModal = (order) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  // Handle form submission for assignment
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDriver || !selectedVehicle) {
      toast.error("Please select a driver and a vehicle.");
      return;
    }

    try {
      const assignmentData = {
        orderId: selectedOrder._id,
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
        status: "Assigned",
      };

      await createNewAssignment(assignmentData);
      toast.success("Order assigned successfully!");

      // Refresh all data to reflect accurate populations and availability changes
      await fetchData();

      setIsAssignModalOpen(false);
      setSelectedOrder(null);
      setSelectedDriver("");
      setSelectedVehicle("");
    } catch (error) {
      console.error("Failed to create new assignment:", error);
      toast.error(error?.response?.data?.message || "Failed to assign delivery.");
    }
  };

  // Update assignment status (Assigned -> In Transit -> Delivered)
  const handleUpdateStatus = async (assignmentId, newStatus) => {
    try {
      await updateAssignmentStatus(assignmentId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error?.response?.data?.message || "Failed to update delivery status.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 font-poppins">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Delivery Assignment</span>
          </h1>
          <p className="text-gray-600 mt-2">Assign paid orders to available drivers and vehicles, and track delivery status.</p>
        </div>

        {/* Orders Ready to Assign Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Orders Ready to Assign</h2>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">Paid</span>
          </div>
          <div className="p-6">
            {ordersForAssignment.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersForAssignment.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-100 transition-colors duration-200">
                        <td>{order._id?.substring(18)}</td>
                        <td>{order.customerId?.name || "N/A"}</td>
                        <td>{Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item) => item.itemName).join(", ") : "N/A"}</td>
                        <td>
                          <div className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                            Paid
                          </div>
                        </td>
                        <td>
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                            onClick={() => handleOpenAssignModal(order)}
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No paid orders available for assignment.</p>
            )}
          </div>
        </div>

        {/* Pending Orders (Not Paid) */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Pending Orders (Not Paid)</h2>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">Pending</span>
          </div>
          <div className="p-6">
            {pendingOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td>{order._id?.substring(18)}</td>
                        <td>{order.customerId?.name || "N/A"}</td>
                        <td>{Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item) => item.itemName).join(", ") : "N/A"}</td>
                        <td>
                          <div className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Pending
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No pending orders.</p>
            )}
          </div>
        </div>

        {/* Assigned Deliveries Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Assigned Deliveries</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200">Live</span>
          </div>
          <div className="p-6">
            {assignedDeliveries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th>Order ID</th>
                      <th>Driver</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedDeliveries.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td>{assignment.orderId ? assignment.orderId._id?.substring(18) : "N/A"}</td>
                        <td>{assignment.driverId?.name || "N/A"}</td>
                        <td>{assignment.vehicleId?.vehicleNo || "N/A"}</td>
                        <td>
                          <div
                            className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full border ${
                              assignment.status === "Assigned"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : assignment.status === "In Transit"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : assignment.status === "Delivered"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {assignment.status}
                          </div>
                        </td>
                        <td className="space-x-2">
                          {assignment.status === "Assigned" && (
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100"
                              onClick={() => handleUpdateStatus(assignment._id, "In Transit")}
                            >
                              Start Delivery
                            </button>
                          )}
                          {assignment.status !== "Delivered" && (
                            <button
                              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                              onClick={() => handleUpdateStatus(assignment._id, "Delivered")}
                            >
                              Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No deliveries have been assigned yet.</p>
            )}
          </div>
        </div>

        {/* Assignment Modal */}
        {isAssignModalOpen && (
          <dialog className="modal" open={isAssignModalOpen}>
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Assign Order: {selectedOrder?._id?.substring(18)}</h3>
              <p className="py-2">Assign this order to a driver and vehicle.</p>
              <form onSubmit={handleAssign}>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Select Driver</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                    required
                  >
                    <option value="">Select a driver</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Select Vehicle</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-action">
                  <button type="submit" className="btn btn-success">
                    <BsCheckCircle /> Assign
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsAssignModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default DeliveryAssign;
