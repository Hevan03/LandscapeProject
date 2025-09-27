import React, { useState, useEffect } from "react";
import { BsFileEarmarkText, BsSearch, BsFilter, BsBarChart, BsPieChart } from "react-icons/bs";
import { FaCheck, FaHourglassHalf, FaInfoCircle, FaBell } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

import {
  getAllAccidentReports,
  updateAccidentReportStatus,
} from "../../api/accidentReportApi";

const AccidentReports = () => {
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]); // New state for drivers
  const [vehicles, setVehicles] = useState([]); // New state for vehicles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({ status: "", driver: "", vehicle: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch accident reports and master data on load
  useEffect(() => {
    fetchReports();
    fetchMasterData(); // Fetch drivers and vehicles
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getAllAccidentReports();
      setReports(res.data);
    } catch (err) {
      toast.error("Failed to load accident reports");
      console.error(err);
    }
  };

  const fetchMasterData = async () => {
    try {
      // You need to create these API functions in your driverApi.js and vehicleApi.js
      const driversRes = await fetch('http://localhost:5000/drivers');
      const vehiclesRes = await fetch('http://localhost:5000/vehicles');
      const driversData = await driversRes.json();
      const vehiclesData = await vehiclesRes.json();
      setDrivers(driversData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Failed to fetch master data", err);
    }
  };

  // Update status in backend
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateAccidentReportStatus(id, newStatus);
      toast.success(`Report updated to "${newStatus}"`);
      fetchReports(); // refresh list
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  // Placeholder function for customer notification
  const handleNotifyCustomer = async (deliveryId) => {
      // **NOTE:** You need to implement this API endpoint on your backend
      // It should find the customer by deliveryId and send a notification (e.g., email)
      try {
          // const res = await axios.post('http://localhost:5000/notifications/send', { deliveryId });
          toast.success("Customer has been notified of the delay.");
      } catch (error) {
          toast.error("Failed to send notification.");
      }
  };

  // Download selected accident report as PDF
  const handleDownloadPdf = async () => {
    try {
      const modalBox = document.querySelector(".modal .modal-box");
      if (!modalBox) {
        toast.error("Nothing to export");
        return;
      }
      const canvas = await html2canvas(modalBox, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // padding
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.text("Accident Report", 10, 10);
      pdf.addImage(imgData, "PNG", 10, 20, imgWidth, Math.min(imgHeight, pageHeight - 30));
      const filename = `accident-report-${selectedReport?._id?.substring(18) || "details"}.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("Failed to generate PDF");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Reported":
        return "badge-error";
      case "Under Investigation":
        return "badge-warning";
      case "Resolved":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  // UPDATED filter logic
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filters.status ? report.status === filters.status : true;
    const matchesDriver = filters.driver ? report.driverId === filters.driver : true;
    const matchesVehicle = filters.vehicle ? report.vehicleNo === filters.vehicle : true;
    const matchesSearch =
      report._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description &&
        report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch && matchesDriver && matchesVehicle;
  });

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <BsFileEarmarkText className="mr-3 text-green-700" />
        Accident Reports
      </h1>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <BsFilter className="mr-2" /> Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by ID or Description..."
            className="input input-bordered w-full rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            name="status"
            className="select select-bordered rounded-lg"
            onChange={handleFilterChange}
          >
            <option value="">Filter by Status</option>
            <option value="Reported">Reported</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            name="driver"
            className="select select-bordered rounded-lg"
            onChange={handleFilterChange}
          >
            <option value="">Filter by Driver</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select
            name="vehicle"
            className="select select-bordered rounded-lg"
            onChange={handleFilterChange}
          >
            <option value="">Filter by Vehicle</option>
            {vehicles.map(v => <option key={v._id} value={v.vehicleNo}>{v.vehicleNo}</option>)}
          </select>
        </div>
      </div>

      {/* Accident Reports Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Reports List</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Driver ID</th>
                <th>Vehicle No</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover">
                    <td className="font-semibold">{report._id.substring(18)}</td>
                    <td>{report.driverId}</td>
                    <td>{report.vehicleNo}</td>
                    <td>{new Date(report.time).toLocaleString()}</td>
                    <td>
                      <div
                        className={`badge ${getStatusBadge(report.status)} text-white`}
                      >
                        {report.status}
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-ghost text-green-700"
                        onClick={() => openDetailsModal(report)}
                      >
                        <FaInfoCircle size={20} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    No accident reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {isDetailsModalOpen && selectedReport && (
        <dialog open className="modal">
          <div className="modal-box bg-white p-6 rounded-xl shadow-xl">
            <h3 className="font-bold text-lg mb-4">
              Accident Report Details ({selectedReport._id})
            </h3>
            <div className="flex flex-col gap-4">
              <p>
                <strong>Driver:</strong> {selectedReport.driverId}
              </p>
              <p>
                <strong>Vehicle:</strong> {selectedReport.vehicleNo}
              </p>
              <p>
                <strong>Delivery ID:</strong>{" "}
                {selectedReport.deliveryId || "N/A"}
              </p>
              <p>
                <strong>Date & Time:</strong>{" "}
                {selectedReport.time
                  ? new Date(selectedReport.time).toLocaleString()
                  : "N/A"}
              </p>
              <div
                className={`badge badge-lg text-white ${getStatusBadge(
                  selectedReport.status
                )}`}
              >
                {selectedReport.status}
              </div>
              <p className="mt-4">
                <strong>Full Description:</strong>
              </p>
              <p className="text-gray-600">{selectedReport.description}</p>
              {selectedReport.photo && (
                <>
                  <p>
                    <strong>Photo/Attachment:</strong>
                  </p>
                  <img
                    src={selectedReport.photo}
                    alt="Accident"
                    className="w-full rounded-lg shadow-md mt-2"
                  />
                </>
              )}

              {/* Status Update Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                {selectedReport.status !== "Under Investigation" && (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() =>
                      handleUpdateStatus(selectedReport._id, "Under Investigation")
                    }
                  >
                    <FaHourglassHalf className="mr-2" /> Under Investigation
                  </button>
                )}
                {selectedReport.status !== "Resolved" && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() =>
                      handleUpdateStatus(selectedReport._id, "Resolved")
                    }
                  >
                    <FaCheck className="mr-2" /> Mark as Resolved
                  </button>
                )}
                <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleNotifyCustomer(selectedReport.deliveryId)}
                >
                    <FaBell className="mr-2" /> Notify Customer
                </button>
                <button
                    className="btn btn-sm btn-outline"
                    onClick={handleDownloadPdf}
                >
                    Download PDF
                </button>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AccidentReports;