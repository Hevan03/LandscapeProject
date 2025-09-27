import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import { BsCheckCircle } from 'react-icons/bs';
import toast from 'react-hot-toast';

// Import all API functions
import {
  getOrdersForAssignment,
  getAvailableDrivers,
  getAvailableVehicles,
  createNewAssignment,
  getAssignedDeliveries,
} from '../../api/deliveryAssignApi';

const DeliveryAssign = () => {
  const [ordersForAssignment, setOrdersForAssignment] = useState([]);
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, driversRes, vehiclesRes, assignedRes] = await Promise.all([
        getOrdersForAssignment(),
        getAvailableDrivers(),
        getAvailableVehicles(),
        getAssignedDeliveries(),
      ]);

      setOrdersForAssignment(ordersRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setAssignedDeliveries(assignedRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data. Please try again.');
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
      toast.error('Please select a driver and a vehicle.');
      return;
    }

    try {
      const assignmentData = {
        orderId: selectedOrder._id,
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
        status: 'Assigned',
        allowUnpaid: true,
      };

      await createNewAssignment(assignmentData);

      toast.success('Order assigned successfully!');

      const assignedOrderWithDetails = {
        ...selectedOrder,
        driverId: drivers.find((d) => d._id === selectedDriver),
        vehicleId: vehicles.find((v) => v._id === selectedVehicle),
      };

      setOrdersForAssignment((prev) => prev.filter((o) => o._id !== selectedOrder._id));
      setAssignedDeliveries((prev) => [...prev, assignedOrderWithDetails]);

      setIsAssignModalOpen(false);
      setSelectedOrder(null);
      setSelectedDriver('');
      setSelectedVehicle('');
    } catch (error) {
      console.error('Failed to create new assignment:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign delivery.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8 font-poppins bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Delivery Assignment</h1>

        {/* Orders Ready to Assign Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Orders Ready to Assign</h2>
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
                      <td>{order.customerId?.name || 'N/A'}</td>
                      <td>
                        {Array.isArray(order.items) && order.items.length > 0
                          ? order.items.map((item) => item.itemName).join(', ')
                          : 'N/A'}
                      </td>
                      <td>
                        <div className="badge badge-info text-white">Paid</div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline btn-success"
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

        {/* Assigned Deliveries Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Assigned Deliveries</h2>
          {assignedDeliveries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th>Order ID</th>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedDeliveries.map((assignment) => (
                    <tr key={assignment._id}>
                      <td>{assignment.orderId ? assignment.orderId._id?.substring(18) : 'N/A'}</td>
                      <td>{assignment.driverId?.name || 'N/A'}</td>
                      <td>{assignment.vehicleId?.vehicleNo || 'N/A'}</td>
                      <td>
                        <div
                          className={`badge ${
                            assignment.status === 'Assigned'
                              ? 'badge-warning'
                              : assignment.status === 'In Transit'
                              ? 'badge-info'
                              : assignment.status === 'Delivered'
                              ? 'badge-success'
                              : 'badge-ghost'
                          }`}
                        >
                          {assignment.status}
                        </div>
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

        {/* Assignment Modal */}
        {isAssignModalOpen && (
          <dialog className="modal" open={isAssignModalOpen}>
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                Assign Order: {selectedOrder?._id?.substring(18)}
              </h3>
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
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsAssignModalOpen(false)}
                  >
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
