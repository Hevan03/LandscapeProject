import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CustomerProjectCard from "./CustomerProjectCard";
import CustomerLayout from "../Layout/CustomerLayout";
import AuthContext from "../../context/AuthContext";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const CustomerProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const user = useContext(AuthContext);

  const loggedInCustomerId = user?.user?._id;

  const navigate = useNavigate();
  const location = useLocation();
  const statusOptions = [
    { value: "all", label: "All Projects" },
    { value: "Advance Payment Pending", label: "Pending Payment" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const getFilterLabel = (filter) => {
    const option = statusOptions.find((opt) => opt.value === filter);
    return option ? option.label : filter;
  };
  useEffect(() => {
    try {
      if (location.state?.paymentSuccess && location.state?.projectId) {
        window.history.replaceState({}, document.title);

        const id = location.state.projectId;
        const status = location.state.projectStatus;

        // Update project status based on previous status
        if (status === "Advance Payment Pending") {
          axios.put(`http://localhost:5001/api/landscape/status/${id}`, { status: "In Progress" });
        } else if (status === "In Progress") {
          axios.put(`http://localhost:5001/api/landscape/status/${id}`, { status: "Completed" });
        }
        toast.success("Payment successful!");

        fetchProjects();
      }
    } catch (error) {
      console.error("Error updating project status after payment:", error);
      toast.error("Failed to update project status after payment.");
    }
  }, [location.state]);

  // Function to re-fetch projects, can be passed to child components
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5001/api/landscape/customer/${loggedInCustomerId}`);
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch customer projects", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Pay Advance button
  const handlePayAdvance = async (project) => {
    setProjectToUpdate(project);
    console.log("Initiating advance payment for project:", projectToUpdate);
    navigate("/paymentportal", {
      state: {
        amount: project.blueprintRequested ? project.totalCost * 0.1 + 5000 : project.totalCost * 0.1,
        orderId: project._id,
        customerId: loggedInCustomerId,
        orderType: "advance",
        returnUrl: "/my-projects",
        showSuccessAfterPayment: true,
        projectId: project._id,
        projectStatus: project.status,
      },
    });
  };

  useEffect(() => {
    fetchProjects();
  }, [loggedInCustomerId]);

  const filteredProjects = filter === "all" ? projects : projects.filter((project) => project.status === filter);

  return (
    <CustomerLayout>
      <div className="bg-white min-h-screen">
        {/* Filter Controls */}
        <div className="max-w-fit mx-auto px-6 lg:px-20 pt-24 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 flex overflow-x-auto space-x-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  filter === option.value ? "bg-green-600 text-white font-medium" : "hover:bg-green-50 text-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-20 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
                <div
                  className="w-12 h-12 absolute top-4 left-4 rounded-full border-4 border-green-200 border-b-green-400 animate-spin"
                  style={{ animationDirection: "reverse" }}
                ></div>
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <CustomerProjectCard project={project} onUpdate={fetchProjects} onPayAdvance={() => handlePayAdvance(project)} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-16 w-16 text-green-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">No projects found</h3>
              <p className="text-gray-200 mb-8">
                {filter === "all" ? "You don't have any landscape projects yet." : `You don't have any ${getFilterLabel(filter)} projects.`}
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Book Your First Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProjectsPage;
