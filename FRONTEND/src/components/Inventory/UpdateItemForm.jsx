import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getItemById, updateItem } from "../../api/itemApi";

const UpdateItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemname: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    imageUrl: "",
    imageFile: null,
  });

  // Load existing item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await getItemById(id);
        const fetchedItem = res.data.item;

        setFormData({
          itemname: fetchedItem.itemname,
          category: fetchedItem.category,
          price: fetchedItem.price,
          quantity: fetchedItem.quantity,
          description: fetchedItem.description,
          imageUrl: `http://localhost:5001/${fetchedItem.imageUrl.replace(/\\/g, "/")}`,
          imageFile: null,
        });
      } catch (err) {
        console.error("Error fetching item:", err);
        toast.error("Failed to fetch item details");
      }
    };
    fetchItem();
  }, [id]);

  // Handle changes for text and number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      const val = parseFloat(value);
      if (val < 0) {
        toast.error("Price cannot be negative");
        return;
      }
      setFormData((prev) => ({ ...prev, price: val }));
    } else if (name === "quantity") {
      const val = parseFloat(value);
      if (val < 0) {
        toast.error("Quantity cannot be negative");
        return;
      }
      setFormData((prev) => ({ ...prev, quantity: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("itemname", formData.itemname);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("quantity", formData.quantity);
      data.append("description", formData.description);

      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      }

      await updateItem(id, data);
      toast.success("Item updated successfully!");
      navigate("/admin/inventory");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update item");
    }
  };

  return (
    <div className="min-h-screen p-6 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Update Item</h2>

        <label className="block mb-2">
          Item Name
          <input type="text" name="itemname" value={formData.itemname} onChange={handleChange} className="w-full border rounded p-2" required />
        </label>

        <label className="block mb-2">
          Category
          <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border rounded p-2" required />
        </label>

        <label className="block mb-2">
          Price
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border rounded p-2"
            required
          />
        </label>

        <label className="block mb-2">
          Quantity
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full border rounded p-2"
            required
          />
        </label>

        <label className="block mb-2">
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" />
        </label>

        <label className="block mb-2">
          Image
          {formData.imageUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Current Image:</p>
              <img src={formData.imageUrl} alt="Current item" className="w-32 h-32 object-cover rounded mt-2" />
            </div>
          )}
          <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange} className="w-full border rounded p-2" />
        </label>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
          Update Item
        </button>
      </form>
    </div>
  );
};

export default UpdateItemForm;
