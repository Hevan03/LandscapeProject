import React, { useState, useEffect } from 'react';
import { getAllItems } from '../api/itemApi';
import { getCart, addItemToCart } from '../api/cartApi';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../component/Navbar";
import { Range } from 'react-range';
import { useNavigate } from "react-router-dom";
import CartIcon from '../component/CartIcon';

const ShopDashboard = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItemCount, setCartItemCount] = useState(0);

  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minMaxPrice, setMinMaxPrice] = useState([0, 10000]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const itemResponse = await getAllItems();
        const fetchedItems = Array.isArray(itemResponse.data)
          ? itemResponse.data
          : itemResponse.data.items || [];
        setItems(fetchedItems);

        if (fetchedItems.length > 0) {
          const prices = fetchedItems.map((item) => item.price);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          setMinMaxPrice([minP, maxP]);
          setPriceRange([minP, maxP]);
        }

        const cartResponse = await getCart();
        setCartItemCount(cartResponse.data.items.length);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    filtered = filtered.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, priceRange, items]);

  const handleAddToCart = async (item) => {
    try {
      await addItemToCart(item._id);
      toast.success(`${item.itemname} added to cart!`);
      const updatedCart = await getCart();
      setCartItemCount(updatedCart.data.items.length);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const handleBuyNow = (item) => {
    toast(`Redirecting to checkout for ${item.itemname}...`, { icon: '🛒' });
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const getStockStatusClass = (quantity) => {
    if (quantity === 0) return 'bg-gray-200 text-gray-800';
    if (quantity < 10) return 'bg-red-100 text-red-800';
    if (quantity < 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    if (quantity < 30) return 'Medium Stock';
    return 'High Stock';
  };

  const categories = ['All', ...new Set(items.map((item) => item.category))];
  const [minPriceFromItems, maxPriceFromItems] = minMaxPrice;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 relative">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Cart Icon */}
        <div
          className="absolute top-4 right-4 cursor-pointer z-50"
          onClick={handleCartClick}
        >
          <CartIcon itemCount={cartItemCount} />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">
          Shop Our Products
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-grow w-full md:w-auto">
            <input
              type="text"
              placeholder="Search for Products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm"
            />
          </div>
          <div className="w-full md:w-1/4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6 p-4 border rounded-md shadow-sm mx-auto max-w-lg">
          <h3 className="font-semibold mb-2 text-center">Filter by Price:</h3>
          <div className="flex justify-between text-gray-700 font-medium">
            <span>Rs. {priceRange[0]}</span>
            <span>Rs. {priceRange[1]}</span>
          </div>
          <Range
            step={1}
            min={minPriceFromItems}
            max={maxPriceFromItems}
            values={priceRange}
            onChange={setPriceRange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ccc',
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                }}
              />
            )}
          />
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading products...</p>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden 
                           transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <img
                  src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, '/')}`}
                  alt={item.itemname}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1">{item.itemname}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      Rs. {item.price}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getStockStatusClass(
                        item.quantity
                      )}`}
                    >
                      {getStockStatus(item.quantity)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex-1 disabled:bg-gray-400"
                      disabled={item.quantity === 0}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(item)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex-1 disabled:bg-gray-400"
                      disabled={item.quantity === 0}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            No items found with the selected filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default ShopDashboard;
