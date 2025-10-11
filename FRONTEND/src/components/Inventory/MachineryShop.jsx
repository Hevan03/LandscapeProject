import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import MachineryCard from "./MachineryCard";
import MachineryDetailModal from "./MachineryDetailModal";

function MachineryShop() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5001/api/machinery/machines");
        setMachines(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error("Failed to load machinery list.");
      }
    };
    fetchMachines();
  }, []);

  const handleSeeMore = (machine) => {
    setSelectedMachine(machine);
  };

  const handleCloseModal = () => {
    setSelectedMachine(null);
  };

  // Get unique categories
  const categories = ["All", ...new Set(machines.map((machine) => machine.category || "Uncategorized"))];

  // Filter machines based on search and category
  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (machine.description && machine.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || machine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen  ">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Hero Section */}
      <div className=" text-green-700">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative mb-10">
              <h1 className="text-4xl font-bold text-center text-gray-800">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">Professional Machinery Rental</span>
              </h1>
              <p className="text-center text-gray-600 mt-2">Get access to high-quality equipment for your landscaping and construction projects</p>
            </div>

            <div className="bg-white rounded-full shadow-lg p-1 flex items-center max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search for machinery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow pl-6 py-3 bg-transparent outline-none text-gray-800"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3 font-medium transition-colors duration-200">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
              <div
                className="h-16 w-16 absolute top-4 left-4 rounded-full border-t-4 border-green-300 animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <p className="mt-6 text-xl font-medium text-gray-700">Loading available machinery...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
                <p className="mt-2 text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Available Machinery for Rent</h2>

            {filteredMachines.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredMachines.map((machine, index) => (
                  <motion.div key={machine._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <MachineryCard machine={machine} onSeeMore={() => handleSeeMore(machine)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 className="mt-4 text-xl font-medium text-gray-900">No machinery found</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  {searchTerm || selectedCategory !== "All"
                    ? "Try adjusting your filters or search term to find what you're looking for."
                    : "No machinery is currently available for rent."}
                </p>
                {(searchTerm || selectedCategory !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Machine Detail Modal */}
      <AnimatePresence>{selectedMachine && <MachineryDetailModal machine={selectedMachine} onClose={handleCloseModal} />}</AnimatePresence>
    </div>
  );
}

export default MachineryShop;
