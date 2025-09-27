import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const UpdateMachineryForm = ({ initialData, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({ ...initialData });
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [keptImageUrls, setKeptImageUrls] = useState(initialData.imageUrl || []);

  useEffect(() => {
    setFormData(initialData);
    setKeptImageUrls(initialData.imageUrl || []);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Fields that cannot be negative
    const restrictedFields = [
      "rentalPricePerDay",
      "defaultDurationDays",
      "penaltyPerDay",
      "quantity",
    ];

    if (restrictedFields.includes(name)) {
      let newValue = parseFloat(value);
      if (isNaN(newValue) || newValue < 0) {
        toast.error(`${name.replace(/([A-Z])/g, " $1")} cannot be negative`);
        newValue = 0;
      }
      setFormData({ ...formData, [name]: newValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(files);
  };

  const handleImageDelete = (url) => {
    setKeptImageUrls(keptImageUrls.filter((imgUrl) => imgUrl !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating machinery...");
    const data = new FormData();

    for (const key in formData) {
      if (key !== "imageUrl") {
        data.append(key, formData[key]);
      }
    }

    newImageFiles.forEach((file) => {
      data.append("images", file);
    });

    data.append("keptImages", JSON.stringify(keptImageUrls));

    try {
      const response = await axios.put(
        `http://localhost:5001/api/machinery/machines/${initialData._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onUpdate(response.data.machine);
      onClose();
      toast.success("Machinery updated successfully!", { id: loadingToast });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Error updating machinery: ${errorMessage}`, { id: loadingToast });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-1/2 lg:w-1/3 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Update Machinery</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <label className="block text-sm font-medium text-gray-700">Rental Price / Day</label>
          <input
            type="number"
            name="rentalPricePerDay"
            value={formData.rentalPricePerDay}
            onChange={handleChange}
            min="0"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <label className="block text-sm font-medium text-gray-700">
            Default Duration (Days)
          </label>
          <input
            type="number"
            name="defaultDurationDays"
            value={formData.defaultDurationDays}
            onChange={handleChange}
            min="0"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <label className="block text-sm font-medium text-gray-700">Penalty / Day</label>
          <input
            type="number"
            name="penaltyPerDay"
            value={formData.penaltyPerDay}
            onChange={handleChange}
            min="0"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          {keptImageUrls.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Current Images:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {keptImageUrls.map((url) => (
                  <div key={url} className="relative group">
                    <img
                      src={`http://localhost:5001${url}`}
                      alt="machinery"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Upload New Images (Optional)
          </label>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            multiple
            accept="image/png, image/jpeg, image/jpg"
          />
          {newImageFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              New files to upload:
              <ul className="list-disc list-inside">
                {newImageFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMachineryForm;
