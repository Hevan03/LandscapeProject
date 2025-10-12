import React, { useState, useEffect } from "react";
import { BsFileEarmarkText, BsSearch, BsFilter } from "react-icons/bs";
import { FaCheck, FaHourglassHalf, FaInfoCircle, FaBell } from "react-icons/fa";
import jsPDF from "jspdf";

import toast from "react-hot-toast";

import { getAllAccidentReports, updateAccidentReportStatus, updateAccidentReport } from "../../api/accidentReportApi";

const AccidentReports = () => {
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]); // New state for drivers
  const [vehicles, setVehicles] = useState([]); // New state for vehicles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ description: "", location: "", vehicleNo: "", time: "", status: "" });
  const [filters, setFilters] = useState({ status: "", driver: "", vehicle: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Handle filter changes for selects
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch accident reports and master data on load
  useEffect(() => {
    fetchReports();
    fetchMasterData(); // Fetch drivers and vehicles
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllAccidentReports();
      setReports(res.data);
    } catch (err) {
      toast.error("Failed to load accident reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      // You need to create these API functions in your driverApi.js and vehicleApi.js
      const driversRes = await fetch("http://localhost:5001/api/delivery/driver");
      const vehiclesRes = await fetch("http://localhost:5001/api/vehicles");
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
  const handleNotifyCustomer = async () => {
    // **NOTE:** You need to implement this API endpoint on your backend
    // It should find the customer by deliveryId and send a notification (e.g., email)
    try {
      // const res = await axios.post('http://localhost:5000/notifications/send', { deliveryId });
      toast.success("Customer has been notified of the delay.");
    } catch {
      toast.error("Failed to send notification.");
    }
  };

  // Download selected accident report as PDF
  const handleDownloadPdf = async () => {
    try {
      // Create PDF directly instead of capturing HTML
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Set up the PDF with manual styling (avoiding oklch colors)
      pdf.setFillColor(34, 197, 94); // Use RGB instead of oklch
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Accident Report", pageWidth / 2, 15, { align: "center" });

      // Reset to regular text
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      // Add report details
      let y = 40;
      const lineHeight = 8;

      // Add report ID with styling
      pdf.setFont("helvetica", "bold");
      pdf.text(`Report ID: ${selectedReport?._id || "N/A"}`, 20, y);
      y += lineHeight * 2;

      // Add other details
      pdf.setFont("helvetica", "normal");
      pdf.text(`Driver: ${selectedReport?.driverId || "N/A"}`, 20, y);
      y += lineHeight;

      pdf.text(`Vehicle: ${selectedReport?.vehicleNo || "N/A"}`, 20, y);
      y += lineHeight;

      pdf.text(`Delivery ID: ${selectedReport?.deliveryId || "N/A"}`, 20, y);
      y += lineHeight;

      pdf.text(`Date & Time: ${selectedReport?.time ? new Date(selectedReport.time).toLocaleString() : "N/A"}`, 20, y);
      y += lineHeight;

      // Add status with color indicator
      pdf.text(`Status: ${selectedReport?.status || "N/A"}`, 20, y);

      // Set color box based on status
      let statusColor;
      switch (selectedReport?.status) {
        case "Reported":
          statusColor = [255, 87, 87]; // Red for error
          break;
        case "Under Investigation":
          statusColor = [255, 193, 7]; // Yellow for warning
          break;
        case "Resolved":
          statusColor = [39, 174, 96]; // Green for success
          break;
        default:
          statusColor = [160, 160, 160]; // Gray for default
      }

      pdf.setFillColor(...statusColor);
      pdf.rect(60, y - 5, 7, 7, "F");
      y += lineHeight * 2;

      // Add description
      pdf.setFont("helvetica", "bold");
      pdf.text("Description:", 20, y);
      y += lineHeight;

      pdf.setFont("helvetica", "normal");
      const description = selectedReport?.description || "No description available";

      // Handle text wrapping
      const splitText = pdf.splitTextToSize(description, pageWidth - 40);
      pdf.text(splitText, 20, y);

      // Add image if available (disabled for now to avoid more color issues)
      // if (selectedReport?.photo) {
      //   // You'd need to handle the image separately
      // }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: "center" });

      // Save the PDF
      const filename = `accident-report-${selectedReport?._id?.substring(18) || "details"}.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("Failed to generate PDF");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Reported":
        return {
          badge: "bg-red-100 text-red-800 border border-red-200",
          dot: "bg-red-500",
        };
      case "Under Investigation":
        return {
          badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          dot: "bg-yellow-500",
        };
      case "Resolved":
        return {
          badge: "bg-green-100 text-green-800 border border-green-200",
          dot: "bg-green-500",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  // UPDATED filter logic
  const filteredReports = reports.filter((report) => {
    const matchesStatus = filters.status ? report.status === filters.status : true;
    const matchesDriver = filters.driver ? report.driverId === filters.driver : true;
    const matchesVehicle = filters.vehicle ? report.vehicleNo === filters.vehicle : true;
    const matchesSearch =
      report._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch && matchesDriver && matchesVehicle;
  });

  const openDetailsModal = (report) => {
    setSelectedReport(report);
    setIsEditMode(false);
    setEditData({
      description: report.description || "",
      location: report.location || "",
      vehicleNo: report.vehicleNo || "",
      time: report.time ? new Date(report.time).toISOString().slice(0, 16) : "",
      status: report.status || "Reported",
    });
    setIsDetailsModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Accident Reports</span>
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">Review, update, and track delivery accident reports</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or description..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select name="status" className="select select-bordered" onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select name="driver" className="select select-bordered" onChange={handleFilterChange}>
              <option value="">All Drivers</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select name="vehicle" className="select select-bordered" onChange={handleFilterChange}>
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v.vehicleNo}>
                  {v.vehicleNo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-green-600 animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading accident reports...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredReports.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reports Found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters or refresh the list.</p>
            <button onClick={fetchReports} className="btn btn-success">
              Refresh
            </button>
          </div>
        )}

        {/* Reports list (card style) */}
        {!loading && filteredReports.length > 0 && (
          <div className="space-y-6">
            {filteredReports.map((report) => {
              const shortId = report._id?.substring(18) || report._id;
              const styles = getStatusStyles(report.status);
              return (
                <div key={report._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${styles.dot}`}></div>
                      <h3 className="text-lg font-semibold text-gray-800">Report #{shortId}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}>{report.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-sm btn-ghost text-green-700" onClick={() => openDetailsModal(report)}>
                        <FaInfoCircle className="mr-2" /> Details
                      </button>
                      {report.status !== "Under Investigation" && (
                        <button className="btn btn-sm btn-warning" onClick={() => handleUpdateStatus(report._id, "Under Investigation")}>
                          <FaHourglassHalf className="mr-2" /> Investigate
                        </button>
                      )}
                      {report.status !== "Resolved" && (
                        <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(report._id, "Resolved")}>
                          <FaCheck className="mr-2" /> Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Driver</div>
                      <div className="font-medium text-gray-800">{report.driverId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Vehicle</div>
                      <div className="font-medium text-gray-800">{report.vehicleNo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date & Time</div>
                      <div className="font-medium text-gray-800">{report.time ? new Date(report.time).toLocaleString() : "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Delivery ID</div>
                      <div className="font-medium text-gray-800">{report.deliveryId || "N/A"}</div>
                    </div>
                    <div className="md:col-span-4">
                      <div className="text-sm text-gray-500">Description</div>
                      <p className="text-gray-700 mt-1 line-clamp-2">{report.description || "No description"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Report Details Modal */}
      {isDetailsModalOpen && selectedReport && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Accident Report</h3>
                <p className="text-xs text-gray-500">
                  Report ID: <span className="font-mono">{selectedReport._id}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(selectedReport.status).badge}`}
                >
                  {selectedReport.status}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsDetailsModalOpen(false)} aria-label="Close" title="Close">
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 bg-white">
              {!isEditMode ? (
                <>
                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500">Driver</div>
                      <div className="text-gray-900 font-medium break-all">{selectedReport.driverId}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500">Vehicle</div>
                      <div className="text-gray-900 font-medium">{selectedReport.vehicleNo}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500">Delivery ID</div>
                      <div className="text-gray-900 font-medium">{selectedReport.deliveryId || "N/A"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500">Date & Time</div>
                      <div className="text-gray-900 font-medium">{selectedReport.time ? new Date(selectedReport.time).toLocaleString() : "N/A"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-gray-900 font-medium">{selectedReport.location || "N/A"}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Description</div>
                    <div className="rounded-lg border border-gray-100 bg-white p-4 text-gray-800 leading-relaxed">
                      {selectedReport.description || "No description"}
                    </div>
                  </div>

                  {/* Attachments */}
                  {Array.isArray(selectedReport.photos) && selectedReport.photos.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Attachments</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedReport.photos.map((ph, idx) => (
                          <div key={idx} className="overflow-hidden rounded-lg border border-gray-100">
                            <img
                              src={ph.url}
                              alt={ph.name || `photo-${idx}`}
                              className="w-full h-28 object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <form
                  className="grid grid-cols-1 gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const payload = {
                        description: editData.description,
                        location: editData.location,
                        vehicleNo: editData.vehicleNo,
                        status: editData.status,
                      };
                      if (editData.time) payload.time = new Date(editData.time);
                      await updateAccidentReport(selectedReport._id, payload);
                      toast.success("Accident report updated");
                      setIsEditMode(false);
                      await fetchReports();
                    } catch (err) {
                      toast.error("Failed to update report");
                      console.error(err);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control">
                      <span className="label-text">Vehicle No</span>
                      <input
                        className="input input-bordered w-full mt-1"
                        value={editData.vehicleNo}
                        onChange={(e) => setEditData((d) => ({ ...d, vehicleNo: e.target.value }))}
                      />
                    </label>
                    <label className="form-control">
                      <span className="label-text">Date & Time</span>
                      <input
                        type="datetime-local"
                        className="input input-bordered w-full mt-1"
                        value={editData.time}
                        onChange={(e) => setEditData((d) => ({ ...d, time: e.target.value }))}
                      />
                    </label>
                  </div>

                  <label className="form-control">
                    <span className="label-text">Location</span>
                    <input
                      className="input input-bordered w-full mt-1"
                      value={editData.location}
                      onChange={(e) => setEditData((d) => ({ ...d, location: e.target.value }))}
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Status</span>
                    <select
                      className="select select-bordered w-full mt-1"
                      value={editData.status}
                      onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value }))}
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </label>

                  <label className="form-control">
                    <span className="label-text">Description</span>
                    <textarea
                      className="textarea textarea-bordered w-full mt-1"
                      rows={4}
                      value={editData.description}
                      onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                    />
                  </label>

                  <div className="mt-2 flex justify-end gap-2">
                    <button type="submit" className="btn btn-success btn-sm">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setIsEditMode(false);
                        setEditData({
                          description: selectedReport.description || "",
                          location: selectedReport.location || "",
                          vehicleNo: selectedReport.vehicleNo || "",
                          time: selectedReport.time ? new Date(selectedReport.time).toISOString().slice(0, 16) : "",
                          status: selectedReport.status || "Reported",
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer actions */}
            <div className="modal-action px-6 py-4 bg-gray-50 border-t flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                {!isEditMode && (
                  <button className="btn btn-sm" onClick={() => setIsEditMode(true)}>
                    Edit
                  </button>
                )}
                {!isEditMode && selectedReport.status !== "Under Investigation" && (
                  <button className="btn btn-warning btn-sm" onClick={() => handleUpdateStatus(selectedReport._id, "Under Investigation")}>
                    <FaHourglassHalf className="mr-2" /> Investigate
                  </button>
                )}
                {!isEditMode && selectedReport.status !== "Resolved" && (
                  <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(selectedReport._id, "Resolved")}>
                    <FaCheck className="mr-2" /> Resolve
                  </button>
                )}
                {!isEditMode && (
                  <button className="btn btn-info btn-sm" onClick={() => handleNotifyCustomer(selectedReport.deliveryId)}>
                    <FaBell className="mr-2" /> Notify Customer
                  </button>
                )}
                {!isEditMode && (
                  <button className="btn btn-outline btn-sm" onClick={handleDownloadPdf}>
                    Download PDF
                  </button>
                )}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsDetailsModalOpen(false)}>
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
