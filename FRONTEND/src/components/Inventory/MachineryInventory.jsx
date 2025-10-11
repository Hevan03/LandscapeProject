import React, { useEffect, useState } from "react";
import UpdateMachineryForm from "./UpdateMachineryForm";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assign jsPDF to window (plugin compatibility)
if (typeof window !== "undefined") {
  window.jsPDF = jsPDF;
}

// Add Machinery Form
const AddMachineryForm = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    rentalPricePerDay: "",
    defaultDurationDays: "",
    penaltyPerDay: "",
    quantity: "",
  });

  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (["rentalPricePerDay", "defaultDurationDays", "penaltyPerDay", "quantity"].includes(name)) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0) {
        toast.error(`${name} cannot be negative`);
        newValue = 0;
      } else {
        newValue = numericValue;
      }
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error("You can upload a maximum of 3 images.");
      e.target.value = null;
      return;
    }
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Adding new machinery...");
    const data = new FormData();
    for (const key in formData) data.append(key, formData[key]);
    imageFiles.forEach((file) => data.append("images", file));

    try {
      const response = await axios.post("http://localhost:5001/api/machinery/machines", data, { headers: { "Content-Type": "multipart/form-data" } });
      onAdd(response.data.machine);
      onClose();
      toast.success("Machinery added successfully!", { id: loadingToast });
    } catch (err) {
      const errorMessage = err.response?.data?.details || err.message;
      toast.error(`Error adding machinery: ${errorMessage}`, {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-1/2 lg:w-1/3 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold">
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Add New Machinery</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 border border-gray-300 rounded"
            required
          ></textarea>

          <input
            type="number"
            name="rentalPricePerDay"
            value={formData.rentalPricePerDay}
            onChange={handleChange}
            placeholder="Price/Day"
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            required
          />
          <input
            type="number"
            name="defaultDurationDays"
            value={formData.defaultDurationDays}
            onChange={handleChange}
            placeholder="Duration (Days)"
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            required
          />
          <input
            type="number"
            name="penaltyPerDay"
            value={formData.penaltyPerDay}
            onChange={handleChange}
            placeholder="Penalty/Day"
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            required
          />
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            required
          />

          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            multiple
            accept="image/png, image/jpeg, image/jpg"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          {imageFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected files:
              <ul className="list-disc list-inside">
                {imageFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//  Machinery Inventory
function MachineryInventory() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachines = async () => {
      const loadingToast = toast.loading("Loading machinery inventory...");
      try {
        const response = await axios.get("http://localhost:5001/api/machinery/machines");
        setMachines(response.data);
        toast.success("Inventory loaded successfully!", { id: loadingToast });
      } catch (err) {
        setError(err.message);
        toast.error(`Error: ${err.message}`, { id: loadingToast });
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machinery?")) return;
    const loadingToast = toast.loading("Deleting machinery...");
    try {
      await axios.delete(`http://localhost:5001/api/machinery/machines/${id}`);
      setMachines((prev) => prev.filter((m) => m._id !== id));
      toast.success("Machinery deleted successfully!", { id: loadingToast });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Error deleting machinery: ${errorMessage}`, {
        id: loadingToast,
      });
    }
  };

  const handleAddMachinery = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);
  const handleAddSuccess = (newMachine) => setMachines((prev) => [...prev, newMachine]);

  const handleUpdateClick = (machine) => {
    setSelectedMachine(machine);
    setIsUpdateFormOpen(true);
  };
  const handleCloseUpdateForm = () => {
    setIsUpdateFormOpen(false);
    setSelectedMachine(null);
  };
  const handleUpdateSuccess = (updatedMachine) => setMachines((prev) => prev.map((m) => (m._id === updatedMachine._id ? updatedMachine : m)));

  // PDF Report
  const generatePdfReport = () => {
    const doc = new jsPDF("p", "mm");
    doc.setFontSize(18);
    doc.text("Machinery Inventory Report", 14, 22);

    const tableColumn = ["Name", "Category", "Description", "Price/Day", "Duration", "Penalty/Day", "Quantity", "Added Date"];
    const tableRows = machines.map((machine) => [
      machine.name,
      machine.category,
      machine.description,
      `Rs.${parseFloat(machine.rentalPricePerDay).toFixed(2)}`,
      machine.defaultDurationDays,
      `Rs.${parseFloat(machine.penaltyPerDay).toFixed(2)}`,
      machine.quantity,
      new Date(machine.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`machinery_inventory_${date}.pdf`);
    toast.success("PDF report generated!");
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading machinery inventory...</div>;

  if (error) return <div className="flex justify-center items-center h-screen text-red-600">Error: {error}</div>;

  return (
    <div>
      {/* Header & Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Machinery Dashboard</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Back
          </button>
          <button onClick={handleAddMachinery} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Machinery
          </button>
          <button
            onClick={generatePdfReport}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <Download size={18} />
            Download Report
          </button>
        </div>
      </div>

      {/* Table */}
      {machines.length === 0 ? (
        <p className="text-center text-gray-500">No machinery found in the inventory.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Name</th>
                <th className="border border-gray-300 p-2">Category</th>
                <th className="border border-gray-300 p-2">Description</th>
                <th className="border border-gray-300 p-2">Price/Day</th>
                <th className="border border-gray-300 p-2">Duration</th>
                <th className="border border-gray-300 p-2">Penalty/Day</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Added Date</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap">
                      {machine.imageUrl.map((url, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:5001${url}`}
                          alt={`${machine.name} ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded-md mr-1 mb-1"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="border p-2">{machine.name}</td>
                  <td className="border p-2">{machine.category}</td>
                  <td className="border p-2">{machine.description}</td>
                  <td className="border p-2">Rs.{machine.rentalPricePerDay}</td>
                  <td className="border p-2">{machine.defaultDurationDays}</td>
                  <td className="border p-2">Rs.{machine.penaltyPerDay}</td>
                  <td className="border p-2">{machine.quantity}</td>
                  <td className="border p-2">{new Date(machine.createdAt).toLocaleDateString()}</td>
                  <td className="border p-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateClick(machine)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(machine._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isFormOpen && <AddMachineryForm onAdd={handleAddSuccess} onClose={handleCloseForm} />}
      {isUpdateFormOpen && selectedMachine && (
        <UpdateMachineryForm initialData={selectedMachine} onUpdate={handleUpdateSuccess} onClose={handleCloseUpdateForm} />
      )}
    </div>
  );
}

export default MachineryInventory;
