import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomerAppointmentStatus from "../../components/Customer/CustomerAppointmentStatus";
import { StarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const LandscaperCard = ({ landscaper }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 w-full max-w-sm transition-transform duration-300 hover:scale-105">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-2">{landscaper.name}</h2>
        <p className="text-gray-600 mb-2">Contact: {landscaper.contact}</p>
        <div className="mb-3">
          <h3 className="font-semibold text-gray-700">Specialties:</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {Array.isArray(landscaper.specialties) &&
              landscaper.specialties.map((specialty, index) => (
                <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                  {specialty}
                </span>
              ))}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => navigate(`/book/${landscaper._id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold shadow hover:from-green-700 hover:to-green-600 transition-all duration-200"
          >
            Book Now <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const testimonials = [
  {
    name: "Ava Thompson",
    role: "Customer",
    quote: "LeafSphere made booking a landscaper so easy! My garden looks amazing and the process was seamless.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "James Lee",
    role: "Customer",
    quote: "Professional service and great communication. Highly recommend for anyone needing landscaping work.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sophia Patel",
    role: "Customer",
    quote: "I loved the variety of specialists available. Booking and project tracking was super simple.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const CustomerDashboard = () => {
  const [landscapers, setLandscapers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const loggedInCustomerId = user?._id || user?.id;

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/customers/${loggedInCustomerId}`);
        setCustomer(res.data);
      } catch (error) {
        console.error("Failed to fetch customer data", error);
      }
    };

    const fetchLandscapers = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/landscaper");
        setLandscapers(res.data);
      } catch (error) {
        console.error("Failed to fetch landscapers", error);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([fetchCustomer(), fetchLandscapers()]);
      setLoading(false);
    };

    fetchAllData();
  }, [loggedInCustomerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <span className="loading loading-spinner loading-lg text-green-500"></span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="text-center text-red-500 text-lg font-semibold">
          Could not load your customer data. Please check the ID and ensure the server is running.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white px-20 py-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-500 mb-2">
          Welcome, {customer.name}!
        </h1>
        <p className="text-lg text-gray-600 mb-4">Here’s a look at your recent activity and options to book a professional.</p>
        <button
          onClick={() => navigate("/customer/my-projects")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow hover:from-green-700 hover:to-green-600 transition-all duration-200"
        >
          Your Projects <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Appointment Status */}
      <div className="max-w-5xl mx-auto mb-16">
        <CustomerAppointmentStatus customerId={loggedInCustomerId} />
      </div>

      {/* Book a Professional */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Book a Professional</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {landscapers.map((landscaper) => (
            <LandscaperCard key={landscaper._id} landscaper={landscaper} />
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 flex flex-col items-center">
              <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mb-4" />
              <h4 className="text-lg font-bold text-green-700">{testimonial.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{testimonial.role}</p>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <p className="text-gray-700 italic text-center">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto mt-16 bg-white rounded-2xl shadow-lg p-8 border border-green-100 text-center">
        <h3 className="text-xl font-bold text-green-700 mb-4">Need Help or Have Questions?</h3>
        <p className="text-gray-600 mb-6">Our support team is here to assist you with bookings, appointments, and more.</p>
        <button
          onClick={() => navigate("/resources")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-700 to-green-500 text-white font-semibold rounded-xl shadow hover:from-green-800 hover:to-green-600 transition-all duration-200"
        >
          Visit Resources <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
