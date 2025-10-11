// src/pages/InventoryDashboard.jsx

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getAllItems, deleteItem } from "../../../api/itemApi";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  // Filter items whenever search term or category changes
  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) => item.itemname.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const categories = ["All", ...new Set(items.map((item) => item.category))];

  return (
    <>
      <div className="min-h-screen p-6">
        <Toaster position="top-right" reverseOrder={false} />
        <h1 className="text-2xl font-bold mb-4">Inventory Dashboard</h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <button onClick={() => navigate("/admin/addItemForm")} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Add New Item
          </button>

          <button onClick={generatePdfReport} className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-700">
            Generate Report (PDF)
          </button>

          <input
            type="text"
            placeholder="Search for Products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="w-full md:w-1/4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Item</th>
                <th className="border border-gray-300 p-2">Category</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item._id} className="text-center">
                    <td className="border border-gray-300 p-2">{item.itemname}</td>
                    <td className="border border-gray-300 p-2">{item.category}</td>
                    <td className="border border-gray-300 p-2">{item.price}</td>
                    <td className="border border-gray-300 p-2">{item.quantity}</td>
                    <td className="border border-gray-300 p-2">{item.description}</td>
                    <td className="border border-gray-300 p-2">
                      {item.imageUrl && (
                        <img
                          src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, "/")}`}
                          alt={item.itemname}
                          className="h-12 w-12 object-cover mx-auto"
                        />
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/admin/update/${item._id}`)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 w-full"
                        >
                          Update
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 w-full">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default InventoryDashboard;
