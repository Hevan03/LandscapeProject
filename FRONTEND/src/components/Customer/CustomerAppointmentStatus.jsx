import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import axios from "axios";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-50 text-green-800 border-green-200",
    completed: "bg-blue-50 text-blue-800 border-blue-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
    rescheduled: "bg-purple-50 text-purple-800 border-purple-200",
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CustomerAppointmentStatus = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5001/api/appointments/customer/${user.id}`);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Could not load your appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      appointment.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.landscaper?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(appointment.appointmentDate), "MMM dd, yyyy").toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by tab
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);

    if (activeTab === "upcoming") {
      return matchesSearch && appointmentDate >= today && appointment.status !== "cancelled";
    } else if (activeTab === "past") {
      return matchesSearch && (appointmentDate < today || appointment.status === "completed");
    } else if (activeTab === "cancelled") {
      return matchesSearch && appointment.status === "cancelled";
    }

    return matchesSearch;
  });

  // Animation variants for cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm  mt-24 mx-20 border min-h-screen h-full border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Your Landscape Appointments</h2>
        <p className="mt-1 text-sm text-gray-500">View and manage your scheduled landscaping services</p>
      </div>

      <div className="border-b border-gray-100 h-full">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "upcoming" ? "text-green-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Pending
            {activeTab === "upcoming" && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />}
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "past" ? "text-green-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Past
            {activeTab === "past" && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />}
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "cancelled" ? "text-green-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cancelled
            {activeTab === "cancelled" && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700" />}
          </button>
        </div>
      </div>

      <div className="p-4 h-full">
        <div className="max-w-md mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-green-500 animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500">Loading your appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                variants={item}
                className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow transition-all"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{appointment.serviceType || "Landscape Service"}</h3>
                      <p className="text-sm text-gray-500">{appointment.landscaper?.name || "Assigned Landscaper"}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{appointment.timeSlot}</span>
                    </div>

                    {appointment.siteAddress && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">
                          {typeof appointment.siteAddress === "object" ? appointment.siteAddress.street : appointment.siteAddress}
                        </span>
                      </div>
                    )}

                    {appointment.paymentStatus && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className={appointment.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}>
                          {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Link className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center">
                      View Details
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-gray-700 font-medium">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-md">
              {activeTab === "upcoming"
                ? "You don't have any upcoming appointments scheduled."
                : activeTab === "past"
                ? "You don't have any past appointments."
                : "You don't have any cancelled appointments."}
            </p>
            <Link
              to="/book"
              className="mt-6 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Schedule an Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointmentStatus;
