import React, { useState, useEffect } from "react";
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
} from "recharts";
import toast from "react-hot-toast";
import { parseISO, format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { downloadDeliveryReportCsv } from "../../api/deliveryAssignApi";

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

const COLORS = ["#4CAF50", "#F44336", "#FF9800"];

//download handler
const handleDownloadCsv = async () => {
  try {
    const blob = await downloadDeliveryReportCsv();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  } catch (e) {
    console.error("CSV download failed:", e);
    toast.error("Failed to download CSV");
  }
};

const DeliveryReports = () => {
  // State to hold fetched data
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState({ month: "", driver: "", vehicle: "" });

  // State for chart data
  const [deliveriesData, setDeliveriesData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [deliveryStatusData, setDeliveryStatusData] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all reports to populate charts
      const reportsRes = await getAllDeliveryReports();
      setReports(reportsRes.data);
      processReportsForCharts(reportsRes.data);

      // Fetch drivers and vehicles for filter dropdowns
      const driversRes = await getAllDrivers();
      setDrivers(driversRes.data);

      const vehiclesRes = await getAllVehicles();
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load reports.");
    }
  };

  // Export only the table data using jsPDF autoTable (no html2canvas)
  const handleExportTablePdf = async () => {
    try {
      if (!Array.isArray(reports) || reports.length === 0) {
        toast.error("No data to export");
        return;
      }
      const doc = new jsPDF("p", "mm", "a4");
      doc.setFontSize(14);
      doc.text("Delivery Summary Table", 14, 15);

      const head = [
        [
          "Order ID",
          "Driver",
          "Vehicle",
          "Status",
          "Assigned Date",
          "Delivered Date",
          "Amount",
        ],
      ];

      const body = reports.map((r) => [
        (r.orderId?._id || r._id || "").toString().slice(-6),
        r.driverId?.name || "N/A",
        r.vehicleId?.vehicleNo || "N/A",
        r.status || "N/A",
        r.orderId?.deliveryAssignedDate
          ? format(parseISO(r.orderId.deliveryAssignedDate), "yyyy-MM-dd")
          : r.assignedDate
          ? format(parseISO(r.assignedDate), "yyyy-MM-dd")
          : "",
        r.orderId?.deliveredAt
          ? format(parseISO(r.orderId.deliveredAt), "yyyy-MM-dd")
          : "",
        r.orderId?.totalAmount ?? "",
      ]);

      autoTable(doc, {
        head,
        body,
        startY: 22,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [67, 160, 71] }, // green
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 32 },
          2: { cellWidth: 25 },
          3: { cellWidth: 22 },
          4: { cellWidth: 28 },
          5: { cellWidth: 28 },
          6: { cellWidth: 20 },
        },
      });

      const filename = `delivery-table-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      doc.save(filename);
      toast.success("Table PDF downloaded");
    } catch (err) {
      console.error("Table PDF export failed:", err);
      toast.error("Failed to export table PDF");
    }
  };

  const processReportsForCharts = (data) => {
    // Process data for Deliveries per Month chart
    const monthlyCounts = data.reduce((acc, report) => {
      const month = format(parseISO(report.createdAt), "MMM");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    setDeliveriesData(
      Object.keys(monthlyCounts).map((month) => ({
        name: month,
        count: monthlyCounts[month],
      }))
    );

    // Process data for Deliveries per Driver chart
    const driverCounts = data.reduce((acc, report) => {
      const driverName = report.driverId?.name || "N/A";
      acc[driverName] = (acc[driverName] || 0) + 1;
      return acc;
    }, {});
    setDriverData(
      Object.keys(driverCounts).map((name) => ({
        name,
        deliveries: driverCounts[name],
      }))
    );

    // Process data for Delivery Status Pie Chart
    const statusCounts = data.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});
    setDeliveryStatusData(
      Object.keys(statusCounts).map((status) => ({
        name: status,
        value: statusCounts[status],
        color: COLORS[Object.keys(statusCounts).indexOf(status)], // Simple color assignment
      }))
    );
  };

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));

    try {
      let res;
      if (name === "month" && value) {
        const [year, month] = value.split("-");
        res = await getMonthlyDeliveryReports(year, month);
      } else if (name === "driver" && value) {
        res = await getDeliveriesByDriver(value);
      } else if (name === "vehicle" && value) {
        res = await getDeliveriesByVehicle(value);
      } else {
        res = await getAllDeliveryReports();
      }
      setReports(res.data);
      processReportsForCharts(res.data);
    } catch (error) {
      console.error("Failed to apply filter:", error);
      toast.error("Failed to load filtered data.");
    }
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
          pageCtx.drawImage(
            canvas,
            0,
            srcY / ratio,
            canvas.width,
            pageCanvasHeight / ratio,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );
          const pageImgData = pageCanvas.toDataURL("image/png");
          pdf.addImage(
            pageImgData,
            "PNG",
            10,
            imgPositionY,
            imgWidth,
            pageHeight - 30
          );
          remainingHeight -= pageHeight - 30;
          srcY += pageCanvasHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            y = 10;
            pdf.text("Delivery Reports Summary (cont.)", 10, y);
          }
        }
      }

      const filename = `delivery-reports-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report.");
    }
  };

  return (
    <div className="min-h-screen" id="delivery-report-container">
      <div className="bg-gray-100 min-h-screen p-8 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <BsFileEarmarkSpreadsheet className="mr-3 text-green-700" />
          Delivery Reports
        </h1>

        {/* Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Filter Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Filter by Month</span>
              </label>
              <select
                name="month"
                className="select select-bordered bg-gray-100 w-full rounded-lg"
                onChange={handleFilterChange}
                value={filter.month}
              >
                <option value="">All Months</option>
                {/* Dynamically generate options from fetched data or static list */}
                <option value="2025-01">January 2025</option>
                <option value="2025-02">February 2025</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Filter by Driver</span>
              </label>
              <select
                name="driver"
                className="select select-bordered bg-gray-100 w-full rounded-lg"
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

            <div className="form-control">
              <label className="label">
                <span className="label-text">Filter by Vehicle</span>
              </label>
              <select
                name="vehicle"
                className="select select-bordered bg-gray-100 w-full rounded-lg"
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
          </div>
        </div>

        {/* Main Charts & Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Deliveries Per Month Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <BsGraphUp className="mr-2 text-green-700" />
              Deliveries per Month
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliveriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Delivery Status Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center flex items-center">
              <BsGraphUp className="mr-2 text-green-700" />
              Delivery Status
            </h2>
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
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deliveries Per Driver Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <BsGraphUp className="mr-2 text-green-700" />
              Deliveries per Driver
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deliveries" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Main Table */}
          <div
            id="delivery-report-summary"
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Delivery Summary Table
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="btn bg-green-700 hover:bg-green-800 text-white rounded-lg shadow-lg"
                >
                  <BiExport className="mr-2" />
                  Export PDF (Card)
                </button>
                <button
                  onClick={handleExportTablePdf}
                  className="btn btn-primary text-white"
                >
                  Export Table PDF
                </button>
                <button onClick={handleDownloadCsv} className="btn btn-outline">
                  Download CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Total Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover">
                    <td>Total Deliveries</td>
                    <td>{reports.length}</td>
                  </tr>
                  <tr className="hover">
                    <td>Completed Deliveries</td>
                    <td>
                      {reports.filter((r) => r.status === "Delivered").length}
                    </td>
                  </tr>
                  <tr className="hover">
                    <td>Failed/Cancelled Deliveries</td>
                    <td>
                      {
                        reports.filter(
                          (r) =>
                            r.status === "Canceled" || r.status === "Failed"
                        ).length
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReports;
