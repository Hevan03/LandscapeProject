import React, { useState, useEffect, useContext } from "react";
import { getAllItems } from "../../api/itemApi";
import { getCart, addItemToCart } from "../../api/cartApi";
import toast from "react-hot-toast";
import { Range } from "react-range";
import { useNavigate } from "react-router-dom";
import CartIcon from "../../components/CartIcon";
import AuthContext from "../../context/AuthContext";

const ShopDashboard = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minMaxPrice, setMinMaxPrice] = useState([0, 10000]);
  const user = useContext(AuthContext);

  console.log("Authenticated User:", user);
  const customerId = user?.user.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const itemResponse = await getAllItems();
        const fetchedItems = Array.isArray(itemResponse.data) ? itemResponse.data : itemResponse.data.items || [];
        setItems(fetchedItems);

        if (fetchedItems.length > 0) {
          const prices = fetchedItems.map((item) => item.price);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          setMinMaxPrice([minP, maxP]);
          setPriceRange([minP, maxP]);
        }

        const cartResponse = await getCart(customerId);
        setCartItemCount(cartResponse.data.items.length);
      } catch (error) {
        console.error("Failed to fetch data:", error);
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
        (item) => item.itemname.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    filtered = filtered.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1]);

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, priceRange, items]);

  const handleAddToCart = async (item) => {
    try {
      await addItemToCart(item._id, 1, customerId);
      toast.success(`${item.itemname} added to cart!`);
      const updatedCart = await getCart(customerId);
      setCartItemCount(updatedCart.data.items.length);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

  const handleBuyNow = (item) => {
    toast(`Redirecting to checkout for ${item.itemname}...`, { icon: "🛒" });
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const getStockStatusClass = (quantity) => {
    if (quantity === 0) return "bg-gray-200 text-gray-800";
    if (quantity < 10) return "bg-red-100 text-red-800";
    if (quantity < 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 10) return "Low Stock";
    if (quantity < 30) return "Medium Stock";
    return "High Stock";
  };

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const [minPriceFromItems, maxPriceFromItems] = minMaxPrice;

  // Generate skeleton loading cards
  const renderSkeletons = () => {
    return Array(8)
      .fill()
      .map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-7 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded-full w-1/4"></div>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ));
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-screen-2xl mx-auto p-4 pt-10 px-4 sm:px-6 lg:px-8">
        {/* Header with Cart */}
        <div className="relative mb-10">
          <div className="absolute top-0 right-0 cursor-pointer z-50" onClick={handleCartClick}>
            <CartIcon itemCount={cartItemCount} />
          </div>
          <h1 className="text-4xl font-bold text-center text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Shop Our Products</span>
          </h1>
          <p className="text-center text-gray-600 mt-2">Find everything you need for your garden and landscape projects</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="flex-grow w-full md:w-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for Products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
            <div className="w-full md:w-1/4 relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-4 text-center">Price Range</h3>
            <div className="flex justify-between text-gray-700 font-medium mb-4">
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200">Rs. {priceRange[0]}</span>
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200">Rs. {priceRange[1]}</span>
            </div>
            <div className="px-2 py-4">
              <Range
                step={1}
                min={minPriceFromItems}
                max={maxPriceFromItems}
                values={priceRange}
                onChange={setPriceRange}
                renderTrack={({ props, children }) => (
                  <div {...props} className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{
                        width: `${((priceRange[1] - minPriceFromItems) / (maxPriceFromItems - minPriceFromItems)) * 100}%`,
                        position: "absolute",
                        left: `${((priceRange[0] - minPriceFromItems) / (maxPriceFromItems - minPriceFromItems)) * 100}%`,
                      }}
                    />
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    className="h-6 w-6 bg-white rounded-full shadow border-2 border-green-500 flex items-center justify-center outline-none"
                    style={{
                      ...props.style,
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{renderSkeletons()}</div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden h-56">
                  <img
                    src={`http://localhost:5001/${item.imageUrl.replace(/\\/g, "/")}`}
                    alt={item.itemname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-3 right-3 ${getStockStatusClass(item.quantity)} text-xs font-semibold px-3 py-1 rounded-full shadow-sm`}
                  >
                    {getStockStatus(item.quantity)}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{item.itemname}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2 h-10">{item.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">Rs. {item.price.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                      disabled={item.quantity === 0}
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(item)}
                      className="border border-green-600 hover:bg-green-100 text-gray-800 px-4 py-2.5 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any products matching your search criteria. Try adjusting your filters or search term.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setPriceRange([minPriceFromItems, maxPriceFromItems]);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination could go here */}

        {/* Footer */}
        {filteredItems.length > 0 && (
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Showing {filteredItems.length} of {items.length} products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDashboard;
