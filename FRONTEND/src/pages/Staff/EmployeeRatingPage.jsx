import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const StarRating = ({ rating, interactive = false, onRatingChange, size = "lg" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={interactive ? { scale: 1.15 } : {}}
          className={`transition-all duration-200 ${interactive ? "cursor-pointer" : "cursor-default"} ${
            star <= (interactive ? hoverRating || rating : rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={interactive ? () => onRatingChange(star) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          disabled={!interactive}
        >
          ★
        </motion.button>
      ))}
    </div>
  );
};

const RatingCard = ({ rating }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-md hover:shadow-lg border border-green-100 p-6 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {rating.clientName ? rating.clientName.charAt(0) : "A"}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{rating.clientName || "Anonymous"}</h4>
            <p className="text-sm text-gray-500">{new Date(rating.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <StarRating rating={rating.rating} interactive={false} size="sm" />
    </div>

    {rating.comment && <p className="text-gray-700 leading-relaxed italic bg-green-50 p-4 rounded-lg">"{rating.comment}"</p>}
  </motion.div>
);

const EmployeeRatingPage = () => {
  const [employee, setEmployee] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState({
    rating: 0,
    comment: "",
    clientName: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id: employeeId } = useParams();

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
      fetchRatings();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/staff/${employeeId}`);
      if (!response.ok) throw new Error("Employee not found");

      const data = await response.json();
      setEmployee(data);
    } catch (err) {
      setError("Failed to load employee information");
      console.error("Error fetching employee:", err);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/rating/employee/${employeeId}`);
      if (!response.ok) throw new Error("Failed to fetch ratings");

      const data = await response.json();
      setRatings(data);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRating.rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`http://localhost:5001/api/rating/${employeeId}/rate-public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          ...newRating,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit rating");

      setSuccess("Rating submitted successfully!");
      setNewRating({ rating: 0, comment: "", clientName: "" });
      fetchRatings(); // Refresh ratings

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("Failed to submit rating. Please try again.");
      console.error("Error submitting rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length : 0;

  if (loading && !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
            </div>
            <p className="text-gray-600">Loading employee information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md text-center">
            <p className="font-medium">{error}</p>
            <p className="mt-2 text-sm">Please try again later or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Employee Header */}
        {employee && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-500 h-32 relative">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 bg-gradient-to-br from-green-600 to-green-500 rounded-full border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
                  {employee?.Employee_Name?.charAt(0) || ""}
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8 px-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{employee.Employee_Name}</h1>
              <p className="text-xl text-gray-600 mb-6">{employee.Employee_Type}</p>

              <div className="flex justify-center items-center space-x-12 mt-4">
                <div className="text-center">
                  <StarRating rating={averageRating} interactive={false} size="md" />
                  <p className="text-sm text-gray-500 mt-1 font-medium">{averageRating.toFixed(1)} out of 5</p>
                </div>
                <div className="border-l border-gray-200 h-12"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{ratings.length}</p>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rate Employee Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-100 to-green-50 px-8 py-6">
            <h2 className="text-2xl font-bold text-green-800">Share Your Feedback</h2>
            <p className="text-green-600">Help others by rating this employee's performance</p>
          </div>

          <div className="p-8">
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center py-4 bg-green-50/50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-4">Your Rating *</label>
                <StarRating
                  rating={newRating.rating}
                  interactive={true}
                  onRatingChange={(rating) => setNewRating({ ...newRating, rating })}
                  size="lg"
                />
                <p className="text-sm text-gray-500 mt-2">Click on the stars to rate</p>
              </div>

              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="clientName"
                  value={newRating.clientName}
                  onChange={(e) => setNewRating({ ...newRating, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  id="comment"
                  value={newRating.comment}
                  onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows="4"
                  placeholder="Share your experience with this employee..."
                />
              </div>

              <div className="text-center pt-2">
                <motion.button
                  type="submit"
                  disabled={submitting || newRating.rating === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all ${
                    submitting || newRating.rating === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Submit Rating"
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Existing Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-100 to-green-50 px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-800">Customer Reviews</h2>
            <span className="bg-green-600 text-white rounded-full px-3 py-1 text-sm font-medium">
              {ratings.length} {ratings.length === 1 ? "Review" : "Reviews"}
            </span>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p className="text-gray-600">Loading reviews...</p>
              </div>
            ) : ratings.length === 0 ? (
              <div className="text-center py-12 bg-green-50/40 rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 text-3xl">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to rate this employee!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <RatingCard key={rating._id} rating={rating} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeRatingPage;
