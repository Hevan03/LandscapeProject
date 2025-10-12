import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaTools, FaCog, FaFileDownload, FaSearch, FaPlus, FaSort, FaExchangeAlt, FaDollarSign, FaCalendarAlt, FaChartPie } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Assign jsPDF to window (plugin compatibility)
if (typeof window !== "undefined") {
  window.jsPDF = jsPDF;
}

const ModernMachineryInventory = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    loadMachinery();
  }, []);

  const loadMachinery = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/machinery/machines");
      setMachines(response.data);
      toast.success("Machinery data loaded successfully");
    } catch (err) {
      console.error("Error loading machinery:", err);
      toast.error("Failed to load machinery data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (id) => {
    if (window.confirm("Are you sure you want to delete this machinery?")) {
      try {
        await axios.delete(`http://localhost:5001/api/machinery/machines/${id}`);
        setMachines(machines.filter((machine) => machine._id !== id));
        toast.success("Machinery deleted successfully");
      } catch (err) {
        console.error("Error deleting machinery:", err);
        toast.error("Failed to delete machinery");
      }
    }
  };

  const handleAddMachine = (newMachine) => {
    setMachines([...machines, newMachine]);
    setShowAddForm(false);
  };

  const handleEditMachine = (machine) => {
    setEditingMachine(machine);
    setShowEditForm(true);
  };

  const handleUpdateMachine = (updatedMachine) => {
    setMachines(machines.map((machine) => (machine._id === updatedMachine._id ? updatedMachine : machine)));
    setShowEditForm(false);
    setEditingMachine(null);
  };

  const generatePdfReport = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text("Machinery Inventory Report", 14, 22);

    const tableColumn = ["Name", "Category", "Rental Price (Rs./day)", "Quantity", "Availability"];
    const tableRows = filteredMachines.map((machine) => [
      machine.name,
      machine.category,
      machine.rentalPricePerDay,
      machine.quantity,
      machine.quantity > 0 ? "Available" : "Not Available",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`machinery_report_${date}.pdf`);
    toast.success("PDF report generated successfully!");
  };

  // Filter and sort machinery
  const getFilteredAndSortedMachines = () => {
    return machines
      .filter((machine) => {
        const matchesSearch =
          !searchTerm ||
          machine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === "All" || machine.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortDirection === "asc" ? a.name?.localeCompare(b.name || "") : b.name?.localeCompare(a.name || "");
        } else if (sortField === "rentalPricePerDay") {
          return sortDirection === "asc"
            ? (a.rentalPricePerDay || 0) - (b.rentalPricePerDay || 0)
            : (b.rentalPricePerDay || 0) - (a.rentalPricePerDay || 0);
        } else if (sortField === "quantity") {
          return sortDirection === "asc" ? (a.quantity || 0) - (b.quantity || 0) : (b.quantity || 0) - (a.quantity || 0);
        }
        return 0;
      });
  };

  const filteredMachines = getFilteredAndSortedMachines();

  // Extract unique categories
  const categories = ["All", ...new Set(machines.map((machine) => machine.category).filter(Boolean))];

  // Calculate statistics
  const totalMachines = machines.length;
  const availableMachines = machines.filter((machine) => machine.quantity > 0).length;
  const totalValue = machines.reduce((sum, machine) => sum + (machine.rentalPricePerDay || 0) * (machine.quantity || 0), 0);

  // Create chart data
  const categoryData = Object.entries(
    machines.reduce((acc, machine) => {
      const category = machine.category || "Uncategorized";
      if (!acc[category]) acc[category] = 0;
      acc[category] += 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const revenueData = Object.entries(
    machines.reduce((acc, machine) => {
      const category = machine.category || "Uncategorized";
      if (!acc[category]) acc[category] = 0;
      acc[category] += (machine.rentalPricePerDay || 0) * (machine.defaultDurationDays || 1) * (machine.quantity || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Machinery Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Machines Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg mr-3">
                            <FaTools className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Machinery</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalMachines}</p>
                        <p className="text-xs text-gray-500 mt-2">In inventory</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center"
                    >
                      Add New Machinery{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Available Machines Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-green-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg mr-3">
                            <FaCog className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Available Machines</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{availableMachines}</p>
                        <p className="text-xs text-gray-500 mt-2">Ready for rental</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <Link to="/rental-orders" className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center">
                      View Rental Orders{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Daily Revenue Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-lg mr-3">
                            <FaDollarSign className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Daily Revenue</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">Rs. {totalValue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Potential daily income</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-2 border-t border-purple-100">
                    <span
                      className="text-xs font-medium text-purple-700 hover:text-purple-800 flex items-center cursor-pointer"
                      onClick={generatePdfReport}
                    >
                      Generate Report <FaFileDownload className="ml-1" />
                    </span>
                  </div>
                </div>

                {/* Categories Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-yellow-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg mr-3">
                            <FaExchangeAlt className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Categories</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{categories.length - 1}</p>
                        <p className="text-xs text-gray-500 mt-2">Machinery types</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-5 py-2 border-t border-yellow-100">
                    <span className="text-xs font-medium text-yellow-700 flex items-center">
                      {categories.slice(1, 4).join(", ")}
                      {categories.length > 4 ? "..." : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-md mb-8 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search machinery..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center w-72 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaPlus className="mr-2 -ml-1" />
                    Add New
                  </button>
                  <button
                    onClick={generatePdfReport}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaFileDownload className="mr-2 -ml-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Analytics Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Categories Distribution Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaChartPie className="text-blue-600 mr-2" /> Categories Distribution
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 font-medium">Machine Count</span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="count"
                          labelLine={false}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, _name) => [`${value} machines`, _name]} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Potential Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaDollarSign className="text-green-600 mr-2" /> Revenue Potential by Category
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200 font-medium">
                      Value in Rs.
                    </span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Potential Revenue"]} />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Machinery Table */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Machinery Inventory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          if (sortField === "name") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("name");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center">Name {sortField === "name" && <FaSort className="ml-1 text-gray-400" />}</div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          if (sortField === "rentalPricePerDay") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("rentalPricePerDay");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center">
                          Rental Price/Day {sortField === "rentalPricePerDay" && <FaSort className="ml-1 text-gray-400" />}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => {
                          if (sortField === "quantity") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                          } else {
                            setSortField("quantity");
                            setSortDirection("asc");
                          }
                        }}
                      >
                        <div className="flex items-center">Quantity {sortField === "quantity" && <FaSort className="ml-1 text-gray-400" />}</div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMachines.length > 0 ? (
                      filteredMachines.map((machine) => (
                        <tr key={machine._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {machine.imageUrl && machine.imageUrl[0] ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={`http://localhost:5001${machine.imageUrl[0]}`}
                                    alt={machine.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FaTools className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{machine.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Rs. {machine.rentalPricePerDay?.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {machine.quantity > 0 ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Not Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditMachine(machine)}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md px-2 py-1 transition-colors duration-150"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMachine(machine._id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md px-2 py-1 transition-colors duration-150"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          {machines.length === 0 ? "No machinery found in inventory" : "No machinery matches your search criteria"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredMachines.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredMachines.length}</span> of <span className="font-medium">{machines.length}</span>{" "}
                    machines
                  </span>
                  <button
                    onClick={generatePdfReport}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <FaFileDownload className="mr-1" />
                    Export Current View
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Machinery Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Machinery</h3>
              <div className="mt-2 px-7 py-3">
                <AddMachineryForm onAdd={handleAddMachine} onCancel={() => setShowAddForm(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Machinery Modal */}
      {showEditForm && editingMachine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Machinery</h3>
              <div className="mt-2 px-7 py-3">
                <EditMachineryForm
                  machine={editingMachine}
                  onUpdate={handleUpdateMachine}
                  onCancel={() => {
                    setShowEditForm(false);
                    setEditingMachine(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Machinery Form Component
const AddMachineryForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    rentalPricePerDay: "",
    quantity: 1,
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rentalPricePerDay" || name === "quantity" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("rentalPricePerDay", formData.rentalPricePerDay);
      fd.append("quantity", formData.quantity);
      // optional images
      if (files && files.length) {
        Array.from(files).forEach((file) => fd.append("images", file));
      }

      const response = await axios.post("http://localhost:5001/api/machinery/machines", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Machinery added successfully");
      onAdd(response.data.machine);
    } catch (err) {
      console.error("Error adding machinery:", err);
      toast.error("Failed to add machinery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
          Images (optional)
        </label>
        <input
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          id="images"
          type="file"
          name="images"
          multiple
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => setFiles(e.target.files)}
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
          Category
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="category"
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rentalPricePerDay">
          Rental Price Per Day
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="rentalPricePerDay"
          type="number"
          name="rentalPricePerDay"
          value={formData.rentalPricePerDay}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
          Quantity
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          required
        />
      </div>
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Machinery"}
        </button>
      </div>
    </form>
  );
};

// Edit Machinery Form Component
const EditMachineryForm = ({ machine, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: machine.name || "",
    category: machine.category || "",
    description: machine.description || "",
    rentalPricePerDay: machine.rentalPricePerDay || "",
    quantity: machine.quantity || 1,
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rentalPricePerDay" || name === "quantity" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("rentalPricePerDay", formData.rentalPricePerDay);
      fd.append("quantity", formData.quantity);
      if (files && files.length) {
        Array.from(files).forEach((file) => fd.append("images", file));
      }

      const response = await axios.put(`http://localhost:5001/api/machinery/machines/${machine._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Machinery updated successfully");
      onUpdate(response.data.machine);
    } catch (err) {
      console.error("Error updating machinery:", err);
      toast.error("Failed to update machinery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-images">
          Replace Images (optional)
        </label>
        <input
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          id="edit-images"
          type="file"
          name="images"
          multiple
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => setFiles(e.target.files)}
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
          Category
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="category"
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rentalPricePerDay">
          Rental Price Per Day
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="rentalPricePerDay"
          type="number"
          name="rentalPricePerDay"
          value={formData.rentalPricePerDay}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
          Quantity
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="quantity"
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0"
          required
        />
      </div>
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Machinery"}
        </button>
      </div>
    </form>
  );
};

export default ModernMachineryInventory;
