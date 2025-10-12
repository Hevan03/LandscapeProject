import React, { useState, useEffect, useRef } from "react";
import { BsFileEarmarkSpreadsheet, BsGraphUp } from "react-icons/bs";
import { BiExport } from "react-icons/bi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Brush,
  ComposedChart,
  Area,
} from "recharts";
import toast from "react-hot-toast";
import { parseISO, format, subMonths } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { downloadDeliveryReportCsv, getAssignedDeliveries } from "../../api/deliveryAssignApi";

// Import the new API functions
import {
  getAllDeliveryReports,
  getMonthlyDeliveryReports,
  getDeliveriesByDriver,
  getDeliveriesByVehicle,
  exportReports,
} from "../../api/deliveryReportApi";
// Assuming you have these APIs for the filter dropdowns
import { getAllDrivers } from "../../api/driverApi";
import { getAllVehicles } from "../../api/vehicleApi";

const COLORS = ["#4CAF50", "#FFC107", "#F44336", "#2196F3", "#9C27B0"];

//download handler
// Download CSV of filtered data
const handleDownloadCsv = () => {
  toast.promise(
    Promise.resolve().then(() => {
      const csvRows = [];
      // Add headers
      csvRows.push(["Order ID", "Driver", "Vehicle", "Status", "Date", "Amount", "Address"]);

      // Add data
      detailedReports.forEach((item) => {
        csvRows.push([
          item.orderId?._id ? item.orderId._id.toString().slice(-6) : "N/A",
          item.driverId?.name || "N/A",
          item.vehicleId?.vehicleNo || "N/A",
          item.status,
          item.createdAt ? format(parseISO(item.createdAt), "yyyy-MM-dd") : "N/A",
          item.orderId?.totalAmount ? `${item.orderId.totalAmount}` : "-",
          item.orderId?.deliveryAddress || "N/A",
        ]);
      });

      let csvContent = "";
      csvRows.forEach((row) => {
        // Ensure each field is properly quoted to handle commas in the content
        const quotedRow = row.map((field) => `"${String(field).replace(/"/g, '""')}"`);
        csvContent += quotedRow.join(",") + "\r\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const fileName = `delivery_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return fileName;
    }),
    {
      loading: "Generating CSV...",
      success: (fileName) => `CSV downloaded as ${fileName}!`,
      error: "Failed to generate CSV",
    }
  );
};
const DeliveryReports = () => {
  // State to hold fetched data
  const [reports, setReports] = useState([]);
  const [detailedReports, setDetailedReports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState({
    period: "all", // all, last30, last90, custom
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    driver: "",
    vehicle: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  // State for chart data
  const [deliveriesData, setDeliveriesData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [deliveryStatusData, setDeliveryStatusData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all reports to populate charts
      const reportsRes = await getAllDeliveryReports();
      const assignmentsRes = await getAssignedDeliveries();

      setReports(reportsRes.data);
      setDetailedReports(assignmentsRes.data || []);
      processReportsForCharts(assignmentsRes.data || []);

      // Fetch drivers and vehicles for filters
      setLoading(true);
      const driversRes = await getAllDrivers();
      setDrivers(driversRes.data);

      const vehiclesRes = await getAllVehicles();
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const tableRef = useRef(null);

  // Export table as PDF
  const handleExportTablePdf = () => {
    const element = tableRef.current;
    if (!element) return;

    toast.promise(
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        // Add title
        pdf.setFontSize(16);
        pdf.text("Delivery Reports", 14, 15);

        // Add date range
        pdf.setFontSize(10);
        pdf.text(
          `Date Range: ${filter.startDate ? format(new Date(filter.startDate), "PP") : "All"} to ${
            filter.endDate ? format(new Date(filter.endDate), "PP") : "Now"
          }`,
          14,
          22
        );

        // Add filter info
        pdf.text(
          `Filters: ${filter.driver ? "Driver - " + drivers.find((d) => d._id === filter.driver)?.name : "All Drivers"} | ${
            filter.vehicle ? "Vehicle - " + vehicles.find((v) => v._id === filter.vehicle)?.vehicleNo : "All Vehicles"
          } | ${filter.status ? "Status - " + filter.status : "All Statuses"}`,
          14,
          28
        );

        // Add image
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 10, 35, pdfWidth - 20, pdfHeight - 10);

        // Add footer
        pdf.setFontSize(8);
        pdf.text(`Generated on ${format(new Date(), "PPpp")}`, pdfWidth - 60, pdf.internal.pageSize.getHeight() - 10);

        pdf.save("delivery-report.pdf");
      }),
      {
        loading: "Generating PDF...",
        success: "PDF downloaded successfully!",
        error: "Failed to generate PDF",
      }
    );
  };

  const processReportsForCharts = (data = []) => {
    try {
      // Skip processing if no data
      if (!Array.isArray(data) || data.length === 0) {
        setDeliveriesData([]);
        setDriverData([]);
        setDeliveryStatusData([]);
        return;
      }

      // Process data for Deliveries per Month chart
      const dateMap = data.reduce((acc, report) => {
        if (!report.createdAt) return acc;

        try {
          const dateKey = format(parseISO(report.createdAt), "yyyy-MM-dd");
          const month = format(parseISO(report.createdAt), "MMM yyyy");

          if (!acc[month]) {
            acc[month] = {
              name: month,
              count: 0,
              delivered: 0,
              inTransit: 0,
              assigned: 0,
              canceled: 0,
              failed: 0,
            };
          }

          acc[month].count += 1;

          // Track delivery status counts
          if (report.status === "Delivered") {
            acc[month].delivered += 1;
          } else if (report.status === "In Transit") {
            acc[month].inTransit += 1;
          } else if (report.status === "Assigned") {
            acc[month].assigned += 1;
          } else if (report.status === "Canceled") {
            acc[month].canceled += 1;
          } else if (report.status === "Failed") {
            acc[month].failed += 1;
          }

          return acc;
        } catch (e) {
          console.error("Date parsing error:", e);
          return acc;
        }
      }, {});

      // Convert to array and sort by date
      const timelineData = Object.values(dateMap).sort((a, b) => {
        return new Date(a.name) - new Date(b.name);
      });

      setDeliveriesData(timelineData);

      // Process data for Deliveries per Driver chart
      const driverCounts = data.reduce((acc, report) => {
        if (!report.driverId) return acc;

        const driverName = report.driverId.name || "Unknown";
        const driverId = report.driverId._id;
        const key = `${driverId}-${driverName}`;

        if (!acc[key]) {
          acc[key] = {
            name: driverName,
            deliveries: 0,
            completed: 0,
          };
        }

        acc[key].deliveries += 1;
        if (report.status === "Delivered") {
          acc[key].completed += 1;
        }

        return acc;
      }, {});

      // Convert to array and limit to top 8 drivers
      const driversData = Object.values(driverCounts)
        .sort((a, b) => b.deliveries - a.deliveries)
        .slice(0, 8);

      setDriverData(driversData);

      // Process data for Delivery Status Pie Chart
      const statusCounts = data.reduce((acc, report) => {
        const status = report.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setDeliveryStatusData(
        Object.keys(statusCounts).map((status, index) => ({
          name: status,
          value: statusCounts[status],
          color: COLORS[index % COLORS.length],
        }))
      );
    } catch (error) {
      console.error("Error processing chart data:", error);
      toast.error("Error processing report data");
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      let res;
      if (filter.period === "custom" && filter.startDate && filter.endDate) {
        const [year, month] = filter.startDate.split("-");
        res = await getMonthlyDeliveryReports(year, month);
      } else if (filter.driver) {
        res = await getDeliveriesByDriver(filter.driver);
      } else if (filter.vehicle) {
        res = await getDeliveriesByVehicle(filter.vehicle);
      } else {
        res = await getAllDeliveryReports();
      }
      setReports(res.data);
      processReportsForCharts(res.data);
    } catch (error) {
      console.error("Failed to apply filter:", error);
      toast.error("Failed to load filtered data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "period" && value !== "custom") {
      // Auto-adjust dates for preset periods
      if (value === "last30") {
        setFilter((prev) => ({
          ...prev,
          period: value,
          startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
          endDate: format(new Date(), "yyyy-MM-dd"),
        }));
      } else if (value === "last90") {
        setFilter((prev) => ({
          ...prev,
          period: value,
          startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
          endDate: format(new Date(), "yyyy-MM-dd"),
        }));
      } else {
        setFilter((prev) => ({ ...prev, [name]: value }));
      }
    } else setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = async () => {
    try {
      // Capture a minimal section to avoid theme/background issues
      const container = document.querySelector("#delivery-report-summary");
      if (!container) {
        toast.error("Nothing to export");
        return;
      }
      // Force safe background colors in the cloned DOM to avoid oklch parsing issues
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          // Force a theme that uses hex colors (avoid oklch) in DaisyUI
          try {
            doc.documentElement.setAttribute("data-theme", "light");
          } catch {}
          const style = doc.createElement("style");
          style.setAttribute("id", "pdf-export-safelook");
          style.innerHTML = `
                        #delivery-report-summary, 
                        #delivery-report-summary * {
                          background: #ffffff !important;
                          background-color: #ffffff !important;
                          color: #111111 !important;
                          border-color: #e5e7eb !important; /* tailwind gray-200 */
                          outline-color: #e5e7eb !important;
                          box-shadow: none !important;
                        }
                        #delivery-report-summary svg *,
                        #delivery-report-summary svg {
                          fill: #4CAF50 !important; /* keep charts green */
                          stroke: #374151 !important; /* gray-700 */
                        }
                    `;
          doc.head.appendChild(style);
          const root = doc.querySelector("#delivery-report-summary");
          if (root) {
            root.style.background = "#ffffff";
            root.style.backgroundColor = "#ffffff";
          }
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 10;
      pdf.text("Delivery Reports Summary", 10, y);
      y += 6;
      let remainingHeight = imgHeight;
      let position = 20;
      let imgPositionY = position;
      let srcY = 0;

      // If content is taller than one page, slice into multiple pages
      if (imgHeight <= pageHeight - 20) {
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      } else {
        const pageCanvas = document.createElement("canvas");
        const pageCtx = pageCanvas.getContext("2d");
        const ratio = imgWidth / canvas.width;
        const pageCanvasHeight = (pageHeight - 30) / ratio; // portion of original canvas to fit one page
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        while (remainingHeight > 0) {
          pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, srcY / ratio, canvas.width, pageCanvasHeight / ratio, 0, 0, pageCanvas.width, pageCanvas.height);
          const pageImgData = pageCanvas.toDataURL("image/png");
          pdf.addImage(pageImgData, "PNG", 10, imgPositionY, imgWidth, pageHeight - 30);
          remainingHeight -= pageHeight - 30;
          srcY += pageCanvasHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            y = 10;
            pdf.text("Delivery Reports Summary (cont.)", 10, y);
          }
        }
      }

      const filename = `delivery-reports-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report.");
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-6 px-4 sm:px-6 lg:px-8" id="delivery-report-container">
      {/* Header with Title and Export Options */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <BsFileEarmarkSpreadsheet className="mr-3 text-green-600" />
            Delivery Reports Dashboard
          </h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow flex items-center"
            >
              <BiExport className="mr-2" />
              Export PDF
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 rounded-lg flex items-center"
            >
              <BsFileEarmarkSpreadsheet className="mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => {
                handleExport();
                setTimeout(handleDownloadCsv, 1000);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center"
            >
              <BsFileEarmarkSpreadsheet className="mr-2" />
              Export All
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-xl shadow mb-8 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Filter Reports</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  name="period"
                  className="select select-bordered bg-white w-full rounded-lg border-gray-300"
                  onChange={handleFilterChange}
                  value={filter.period}
                >
                  <option value="all">All Time</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="last90">Last 90 Days</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {filter.period === "custom" && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start</label>
                      <input
                        type="date"
                        name="startDate"
                        className="input input-bordered bg-white w-full rounded-lg border-gray-300"
                        onChange={handleFilterChange}
                        value={filter.startDate}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End</label>
                      <input
                        type="date"
                        name="endDate"
                        className="input input-bordered bg-white w-full rounded-lg border-gray-300"
                        onChange={handleFilterChange}
                        value={filter.endDate}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  name="driver"
                  className="select select-bordered bg-white w-full rounded-lg border-gray-300"
                  onChange={handleFilterChange}
                  value={filter.driver}
                >
                  <option value="">All Drivers</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  name="vehicle"
                  className="select select-bordered bg-white w-full rounded-lg border-gray-300"
                  onChange={handleFilterChange}
                  value={filter.vehicle}
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  className="select select-bordered bg-white w-full rounded-lg border-gray-300"
                  onChange={handleFilterChange}
                  value={filter.status}
                >
                  <option value="">All Statuses</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilter({
                      period: "all",
                      startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
                      endDate: format(new Date(), "yyyy-MM-dd"),
                      driver: "",
                      vehicle: "",
                      status: "",
                    });
                    setTimeout(fetchAllData, 100);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={loading}
                >
                  Reset
                </button>

                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Applying...
                    </span>
                  ) : (
                    "Apply Filters"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
              <p className="text-2xl font-bold text-gray-800">{detailedReports.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Transit</h3>
              <p className="text-2xl font-bold text-gray-800">{detailedReports.filter((r) => r.status === "In Transit").length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
              <p className="text-2xl font-bold text-gray-800">{detailedReports.filter((r) => r.status === "Delivered").length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pending/Assigned</h3>
              <p className="text-2xl font-bold text-gray-800">{detailedReports.filter((r) => r.status === "Assigned").length}</p>
            </div>
          </div>
        </div>

        {/* Main Charts & Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Delivery Timeline Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BsGraphUp className="mr-2 text-green-600" />
                Delivery Timeline
              </h2>
            </div>

            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={deliveriesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="count" fill="rgba(76, 175, 80, 0.2)" stroke="#4CAF50" />
                  <Line type="monotone" dataKey="delivered" stroke="#4CAF50" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="inTransit" stroke="#2196F3" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="assigned" stroke="#FFC107" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Brush dataKey="name" height={20} stroke="#4CAF50" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Delivery Status Pie Chart */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BsGraphUp className="mr-2 text-green-600" />
                Delivery Status
              </h2>
            </div>

            <div className="p-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {deliveryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} deliveries`, name]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Detailed Delivery Table */}
          <div className="lg:col-span-6 bg-white rounded-xl p-5 pb-10 shadow overflow-hidden" id="delivery-report-summary" ref={tableRef}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Delivery Details</h2>

              <div className="flex gap-2">
                <button onClick={handleExportTablePdf} className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm">
                  Export Table
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {detailedReports.length > 0 ? (
                    detailedReports.slice(0, 10).map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(report.orderId?._id || report._id || "").toString().slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.driverId?.name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.vehicleId?.vehicleNo || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              report.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : report.status === "In Transit"
                                ? "bg-blue-100 text-blue-800"
                                : report.status === "Assigned"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.createdAt ? format(parseISO(report.createdAt), "yyyy-MM-dd") : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.orderId?.totalAmount ? `Rs. ${report.orderId.totalAmount.toLocaleString()}` : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No delivery records found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {detailedReports.length > 10 && (
                <div className="px-6 py-3 bg-gray-50 text-right text-sm text-gray-500">Showing 10 of {detailedReports.length} records</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReports;
