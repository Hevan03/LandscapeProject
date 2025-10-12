import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllItems, deleteItem, createItem, updateItem } from "../../../api/itemApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";
import { FaPlus, FaFileDownload, FaSearch, FaBoxOpen, FaChartBar, FaPercent, FaExclamationTriangle, FaCubes } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const ModernInventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // const navigate = useNavigate(); // not used in this dashboard

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  // Filter items whenever search term or category changes
  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemname?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory]);

  // Fetch items from backend
  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await getAllItems();
      const fetchedItems = Array.isArray(response.data) ? response.data : response.data.items || [];
      setItems(fetchedItems);
      setFilteredItems(fetchedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this item?");
    if (isConfirmed) {
      try {
        await deleteItem(id);
        setItems(items.filter((item) => item._id !== id));
        toast.success("Item deleted successfully");
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Failed to delete item");
      }
    }
  };

  // Generate PDF report
  const generatePdfReport = () => {
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 22);

    const tableColumn = ["Item", "Category", "Price", "Quantity", "Description"];
    const tableRows = filteredItems.map((item) => [item.itemname, item.category, `Rs. ${item.price}`, item.quantity, item.description]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: "auto" },
      },
    });

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`inventory_report_${date}.pdf`);
    toast.success("PDF report generated successfully!");
  };

  // Calculate inventory stats
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
  const lowStockItems = items.filter((item) => item.quantity < 10).length;
  const categories = ["All", ...new Set(items.map((item) => item.category).filter(Boolean))];

  // Create chart data
  const categoryChartData = Object.entries(
    items.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) acc[category] = 0;
      acc[category] += 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const stockValueChartData = Object.entries(
    items.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) acc[category] = 0;
      acc[category] += item.price * item.quantity || 0;
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
              <h2 className="text-xl font-bold text-gray-800 mb-5 border-l-4 border-green-500 pl-3">Inventory Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Items Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg mr-3">
                            <FaBoxOpen className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Items</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalItems}</p>
                        <p className="text-xs text-gray-500 mt-2">In inventory</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center"
                    >
                      Add New Item{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Total Value Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-green-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg mr-3">
                            <FaChartBar className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Total Value</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">Rs. {totalValue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Inventory worth</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-5 py-2 border-t border-green-100">
                    <span
                      className="text-xs font-medium text-green-700 hover:text-green-800 flex items-center cursor-pointer"
                      onClick={generatePdfReport}
                    >
                      Generate Report <FaFileDownload className="ml-1" />
                    </span>
                  </div>
                </div>

                {/* Categories Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-purple-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-500 p-2 rounded-lg mr-3">
                            <FaCubes className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Categories</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{categories.length - 1}</p>
                        <p className="text-xs text-gray-500 mt-2">Product categories</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-2 border-t border-purple-100">
                    <span className="text-xs font-medium text-purple-700 flex items-center">
                      {categories.slice(1, 4).join(", ")}
                      {categories.length > 4 ? "..." : ""}
                    </span>
                  </div>
                </div>

                {/* Low Stock Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:border-yellow-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center mb-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-lg mr-3">
                            <FaExclamationTriangle className="text-white text-xl" />
                          </div>
                          <h2 className="text-sm font-medium text-gray-600">Low Stock</h2>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{lowStockItems}</p>
                        <p className="text-xs text-gray-500 mt-2">Items need restocking</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-5 py-2 border-t border-yellow-100">
                    <Link
                      to="/admin/inventory?filter=lowStock"
                      className="text-xs font-medium text-yellow-700 hover:text-yellow-800 flex items-center"
                    >
                      View Low Stock Items{" "}
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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
                    placeholder="Search items..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    className="inline-flex items-center px-4 w-72  py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaPlus className="mr-2 -ml-1" />
                    Add New
                  </button>
                  <button
                    onClick={generatePdfReport}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                      <FaCubes className="text-blue-600 mr-2" /> Categories Distribution
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 font-medium">Item Count</span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-center">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="count"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => [`${value} items`, "Items"]} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Stock Value by Category Chart */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaChartBar className="text-green-600 mr-2" /> Stock Value by Category
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200 font-medium">
                      Value in Rs.
                    </span>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stockValueChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Value"]} />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Inventory Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {item.imageUrl ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={`http://localhost:5001/${item.imageUrl.replace(/^\/*/, "")}`}
                                    alt={item.itemname}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FaBoxOpen className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.itemname}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{item.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Rs. {item.price?.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity > 10 ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                In Stock
                              </span>
                            ) : item.quantity > 0 ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowEditForm(true);
                                }}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md px-2 py-1 transition-colors duration-150"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
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
                          {items.length === 0 ? "No items found in inventory" : "No items match your search criteria"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredItems.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredItems.length}</span> of <span className="font-medium">{items.length}</span> items
                  </span>
                  <button
                    onClick={generatePdfReport}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
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

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Item</h3>
              <div className="mt-2 px-7 py-3">
                <AddItemForm
                  onAdd={(saved) => {
                    setItems((prev) => [saved, ...prev]);
                    setShowAddForm(false);
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Item</h3>
              <div className="mt-2 px-7 py-3">
                <EditItemForm
                  item={editingItem}
                  onUpdate={(updated) => {
                    setItems((prev) => prev.map((it) => (it._id === updated._id ? updated : it)));
                    setShowEditForm(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setShowEditForm(false);
                    setEditingItem(null);
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

export default ModernInventoryDashboard;

// Add Item Form Component
const AddItemForm = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({
    itemname: "",
    category: "",
    price: "",
    quantity: 0,
    description: "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "price" || name === "quantity" ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("itemname", form.itemname);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("quantity", form.quantity);
      fd.append("description", form.description);
      if (file) fd.append("image", file); // backend expects single field name 'image'

      const { data } = await createItem(fd);
      toast.success("Item added successfully");
      onAdd(data);
    } catch (err) {
      console.error("Error adding item:", err);
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700">Item Name</label>
        <input name="itemname" value={form.itemname} onChange={onChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input name="category" value={form.category} onChange={onChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-3 text-left grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={form.price}
            onChange={onChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="0"
            name="quantity"
            value={form.quantity}
            onChange={onChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" rows="3" value={form.description} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-sm font-medium text-gray-700">Image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
      </div>
      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          {isSubmitting ? "Adding..." : "Add Item"}
        </button>
      </div>
    </form>
  );
};

// Edit Item Form Component
const EditItemForm = ({ item, onUpdate, onCancel }) => {
  const [form, setForm] = useState({
    itemname: item.itemname || "",
    category: item.category || "",
    price: item.price || 0,
    quantity: item.quantity || 0,
    description: item.description || "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "price" || name === "quantity" ? Number(value) : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("itemname", form.itemname);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("quantity", form.quantity);
      fd.append("description", form.description);
      if (file) fd.append("image", file); // optional new image

      const { data } = await updateItem(item._id, fd);
      toast.success("Item updated successfully");
      onUpdate(data);
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error("Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700">Item Name</label>
        <input name="itemname" value={form.itemname} onChange={onChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input name="category" value={form.category} onChange={onChange} required className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-3 text-left grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={form.price}
            onChange={onChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="0"
            name="quantity"
            value={form.quantity}
            onChange={onChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="mb-3 text-left">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" rows="3" value={form.description} onChange={onChange} className="mt-1 block w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4 text-left">
        <label className="block text-sm font-medium text-gray-700">Replace Image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
      </div>
      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          {isSubmitting ? "Updating..." : "Update Item"}
        </button>
      </div>
    </form>
  );
};
