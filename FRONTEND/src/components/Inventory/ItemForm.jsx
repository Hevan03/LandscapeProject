import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createItem, getItemById, updateItem } from "../../api/itemApi";
import toast, { Toaster } from "react-hot-toast";

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState({
    itemname: "",
    category: "",
    price: 0,
    quantity: 0,
    description: "",
    image: null,
  });

  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch item if we're updating
  useEffect(() => {
    if (id) {
      setIsUpdate(true);
      const fetchItem = async () => {
        try {
          const response = await getItemById(id);
          const fetchedItem = response.data;
          setItem({
            itemname: fetchedItem.itemname,
            category: fetchedItem.category,
            price: fetchedItem.price,
            quantity: fetchedItem.quantity,
            description: fetchedItem.description,
            image: null,
          });
        } catch (err) {
          console.error("Error fetching item for update:", err);
          toast.error("Failed to load item for update");
        }
      };
      fetchItem();
    }
  }, [id]);

  // Handle input changes with price & quantity validation
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setItem({ ...item, image: files[0] });
    } else if (name === "price") {
      const val = parseFloat(value);
      if (val < 0) {
        toast.error("Price cannot be negative");
        return;
      }
      setItem({ ...item, price: val });
    } else if (name === "quantity") {
      const val = parseFloat(value);
      if (val < 0) {
        toast.error("Quantity cannot be negative");
        return;
      }
      setItem({ ...item, quantity: val });
    } else {
      setItem({ ...item, [name]: value });
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("itemname", item.itemname);
    formData.append("category", item.category);
    formData.append("price", item.price);
    formData.append("quantity", item.quantity);
    formData.append("description", item.description);
    if (item.image) {
      formData.append("image", item.image);
    }

    try {
      if (isUpdate) {
        await updateItem(id, formData);
        toast.success("Item updated successfully!");
      } else {
        await createItem(formData);
        toast.success("Item added successfully!");
      }
      navigate("/admin/inventory");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to save item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6 bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">{isUpdate ? "Update Item" : "Add New Item"}</h1>

        {/* Item Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="itemname">
            Item Name
          </label>
          <input
            type="text"
            name="itemname"
            value={item.itemname}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="category">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={item.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="price">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={item.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="quantity">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={item.quantity}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            name="description"
            value={item.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            rows="4"
            required
          ></textarea>
        </div>

        {/* Image */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="image">
            Item Image
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Saving..." : isUpdate ? "Update Item" : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default ItemForm;
