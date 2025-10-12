import { motion } from "framer-motion";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/AuthContext";

const StarRating = ({ rating, interactive = false, onRatingChange, size = "md" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={interactive ? () => onRatingChange(star) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          disabled={!interactive}
          className={`
            ${interactive ? "cursor-pointer" : "cursor-default"} 
            ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}
            transition-colors duration-200 hover:scale-110
          `}
        >
          ★
        </button>
      ))}
      {interactive && <span className="ml-2 text-gray-700 font-medium">{rating}/5</span>}
    </div>
  );
};

const UserCard = ({ user, userType, onRate }) => {
  const getName = () => {
    if (userType === "employees") return user.Employee_Name || "Unknown";
    if (userType === "drivers") return user.name || "Unknown";
    if (userType === "landscapers") return user.name || "Unknown";
    if (userType === "maintenance") return user.name || "Unknown";
    return "Unknown";
  };

  const getInitial = () => {
    const name = getName();
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getRole = () => {
    if (userType === "employees") return user.Employee_Type || "Employee";
    if (userType === "drivers") return "Driver";
    if (userType === "landscapers") return "Landscaper";
    if (userType === "maintenance") return "Maintenance";
    return "Unknown Role";
  };

  const rating = user.rating || 0;
  const ratingCount = user.ratingCount || 0;

  const calculateRatingPercentage = (averageRating, totalRatings) => {
    if (!totalRatings || totalRatings === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (averageRating >= 4.5) {
      distribution[5] = 70;
      distribution[4] = 30;
    } else if (averageRating >= 3.5) {
      distribution[4] = 60;
      distribution[3] = 25;
      distribution[5] = 15;
    } else if (averageRating >= 2.5) {
      distribution[3] = 50;
      distribution[2] = 30;
      distribution[4] = 20;
    } else if (averageRating >= 1.5) {
      distribution[2] = 50;
      distribution[1] = 30;
      distribution[3] = 20;
    } else if (averageRating > 0) {
      distribution[1] = 70;
      distribution[2] = 30;
    }
    return distribution;
  };

  const ratingPercentages = calculateRatingPercentage(rating, ratingCount);

  // Get role-specific color
  const getRoleColor = () => {
    if (userType === "drivers") return "from-teal-500 to-teal-600";
    if (userType === "landscapers") return "from-emerald-500 to-emerald-600";
    if (userType === "maintenance") return "from-lime-500 to-lime-600";
    return "from-green-500 to-green-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border-0 relative flex flex-col"
    >
      {/* Top Badge */}
      {rating >= 4.5 && ratingCount >= 3 && (
        <div className="absolute top-3 right-3 bg-yellow-50 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center z-10 shadow-sm">
          <span className="mr-1">⭐</span> Top Rated
        </div>
      )}

      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${getRoleColor()} p-6 text-white`}>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold shadow-inner">
            {getInitial()}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-bold">{getName()}</h3>
            <div className="flex items-center mt-1 text-white/80 text-sm">
              <span>{getRole()}</span>
              {user._id && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">#{user._id.slice(-5)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Rating Summary */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-800">{rating.toFixed(1)}</span>
            <StarRating rating={rating} size="sm" />
          </div>
          <span className="text-sm text-gray-500">
            {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Email if available */}
        {user.email && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">{user.email}</span>
          </div>
        )}

        {/* Rating Distribution */}
        {ratingCount >= 0 && (
          <div className="space-y-1.5 mb-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600 w-6">{star}★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratingPercentages[star] || 0}%` }}
                    transition={{ duration: 0.7, delay: star * 0.1 }}
                    className={`bg-gradient-to-r ${getRoleColor()} h-1.5 rounded-full`}
                  ></motion.div>
                </div>
                <span className="text-xs text-gray-500 w-8">{ratingPercentages[star] || 0}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => onRate(user, userType)}
          className={`mt-auto py-2.5 bg-gradient-to-r ${getRoleColor()} text-white font-medium rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-md`}
        >
          <span className="mr-2">⭐</span> Rate {getRole()}
        </button>
      </div>
    </motion.div>
  );
};

const RatingsPage = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState({
    employees: [],
    drivers: [],
    landscapers: [],
    maintenance: [],
  });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const user = useContext(AuthContext);
  const showDriverDashboardButton = user?.role === "driver";
  const [ratingData, setRatingData] = useState({
    rating: 5,
    comment: "",
    clientName: "",
  });

  // Helper to get excluded type based on logged-in user role
  const getExcludedType = () => {
    if (!user) return null;
    if (user.role === "driver") return "drivers";
    if (user.role === "maintenance") return "maintenance";
    if (user.role === "employees" || user.role === "employee") return null; // Employees can rate maintenance
    if (user.role === "landscaper") return "landscapers";
    return null;
  };

  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/staff/all");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();

      setAllUsers({
        employees: Array.isArray(data.employees) ? data.employees : [],
        drivers: Array.isArray(data.drivers) ? data.drivers : [],
        landscapers: Array.isArray(data.landscapers) ? data.landscapers : [],
        maintenance: Array.isArray(data.maintenance) ? data.maintenance : [],
      });

      // Set initial filtered users to be all users combined
      const combined = [
        ...(Array.isArray(data.employees) ? data.employees : []).map((user) => ({ ...user, type: "employees" })),
        ...(Array.isArray(data.drivers) ? data.drivers : []).map((user) => ({ ...user, type: "drivers" })),
        ...(Array.isArray(data.landscapers) ? data.landscapers : []).map((user) => ({ ...user, type: "landscapers" })),
        ...(Array.isArray(data.maintenance) ? data.maintenance : []).map((user) => ({ ...user, type: "maintenance" })),
      ];

      setFilteredUsers(combined);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic with exclusion
  const excludedType = getExcludedType();

  const filterUsers = (filter) => {
    let users = [];
    if (filter === "all") {
      users = [
        ...allUsers.employees.map((user) => ({ ...user, type: "employees" })),
        ...allUsers.drivers.map((user) => ({ ...user, type: "drivers" })),
        ...allUsers.landscapers.map((user) => ({ ...user, type: "landscapers" })),
        ...allUsers.maintenance.map((user) => ({ ...user, type: "maintenance" })),
      ];
    } else {
      users = allUsers[filter].map((user) => ({ ...user, type: filter }));
    }
    // Exclude same type as logged-in user (except employees can rate maintenance)
    if (excludedType && filter !== "maintenance") {
      users = users.filter((u) => u.type !== excludedType);
    }
    // Employees can rate maintenance, so do not exclude maintenance for employees
    if ((user?.role === "employees" || user?.role === "employee") && filter === "maintenance") {
      return users;
    }
    // Maintenance cannot rate other maintenance
    if (user?.role === "maintenance" && filter === "maintenance") {
      return [];
    }
    // Drivers cannot rate other drivers
    if (user?.role === "driver" && filter === "drivers") {
      return [];
    }
    // Landscapers cannot rate other landscapers
    if (user?.role === "landscaper" && filter === "landscapers") {
      return [];
    }
    return users;
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setFilteredUsers(filterUsers(filter));
  };

  useEffect(() => {
    setFilteredUsers(filterUsers(activeFilter));
    // eslint-disable-next-line
  }, [allUsers, activeFilter, user]);

  const handleRateUser = (user, userType) => {
    setSelectedUser(user);
    setSelectedUserType(userType);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    ratingData.clientName = user.user?.Employee_Name || user.user?.name || user.user?.username || "";

    if (!ratingData.clientName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      const userId = selectedUser._id;
      if (!userId) {
        toast.error("Invalid user selected");
        return;
      }

      const response = await fetch(`http://localhost:5001/api/rating/${userId}/rate-public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: ratingData.rating,
          comment: ratingData.comment,
          clientName: ratingData.clientName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      const result = await response.json();
      toast.success("Rating submitted successfully!");

      setAllUsers((prev) => {
        const updated = { ...prev };
        updated[selectedUserType] = prev[selectedUserType].map((u) =>
          u._id === userId ? { ...u, rating: result.user.rating, ratingCount: result.user.ratingCount } : u
        );
        return updated;
      });

      handleFilterChange(activeFilter);

      setRatingData({ rating: 5, comment: "", clientName: "" });
      setShowRatingModal(false);
      setSelectedUser(null);
      setSelectedUserType(null);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-green-800 font-semibold text-xl">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100  px-4 sm:px-6 lg:px-8">
      <div className={` mx-20 pt-24`}>
        {!showDriverDashboardButton && (
          <div className="absolute flex  flex-row text-left justify-start inset-0 bg-gradient-to-br from-green-400 via-green-600 to-green-700 z-10 h-20 w-full"></div>
        )}

        {showDriverDashboardButton && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate("/driver-dashboard")}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-600 transition-all duration-300 font-medium"
            >
              Go to Driver Dashboard
            </button>
          </div>
        )}

        <div className="flex flex-row items-center justify-between text-center mb-12 mt-4 w-full ">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className=" flex  flex-col text-left justify-start">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">Employee & Staff Ratings</h1>
            <p className="text-xl text-green-700 w-full mx-auto">
              Rate and review our team members. Your feedback helps us improve our service quality.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 ">
            {[
              { key: "all", label: "All Members", icon: "👥" },
              { key: "employees", label: "Employees", icon: "🌱" },
              { key: "drivers", label: "Drivers", icon: "🚚" },
              { key: "landscapers", label: "Landscapers", icon: "🌳" },
              { key: "maintenance", label: "Maintenance", icon: "🛠️" },
            ]
              .filter((filter) => {
                if (!user) return true;
                if (user.role === "driver" && filter.key === "drivers") return false;
                if (user.role === "maintenance" && filter.key === "maintenance") return false;
                if ((user.role === "employees" || user.role === "employee") && filter.key === "employees") return false;
                if (user.role === "landscaper" && filter.key === "landscapers") return false;
                return true;
              })
              .map((filter) => (
                <motion.button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
          px-6 py-3 rounded-full text-base font-medium transition-all duration-300
          flex items-center space-x-2
          ${activeFilter === filter.key ? "bg-green-600 text-white shadow-md" : "bg-white text-green-700 border-2 border-green-600 hover:bg-green-50"}
        `}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </motion.button>
              ))}
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredUsers.map((user) => (
              <UserCard key={`${user.type}-${user._id}`} user={user} userType={user.type} onRate={handleRateUser} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No results found</h3>
            <p className="text-gray-600">No {activeFilter === "all" ? "users" : activeFilter} are available for rating.</p>
          </motion.div>
        )}
      </div>

      {showRatingModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-t-2xl p-6 text-white">
              <h2 className="text-2xl font-bold text-center">Rate {selectedUser.Employee_Name || selectedUser.name || "User"}</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(selectedUser.Employee_Name || selectedUser.name || "?").charAt(0)}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={user.user?.Employee_Name || user.user?.name || user.user?.username || ""}
                    disabled
                    onChange={(e) => setRatingData({ ...ratingData, clientName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating *</label>
                  <div className="flex justify-center bg-green-50 py-4 rounded-lg">
                    <StarRating
                      rating={ratingData.rating}
                      interactive={true}
                      onRatingChange={(rating) => setRatingData({ ...ratingData, rating })}
                      size="lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                  <textarea
                    value={ratingData.comment}
                    onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Share your experience..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedUser(null);
                    setSelectedUserType(null);
                    setRatingData({ rating: 5, comment: "", clientName: "" });
                  }}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-colors duration-300"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RatingsPage;
