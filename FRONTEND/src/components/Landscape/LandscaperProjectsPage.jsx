import React, { useState, useEffect, useContext } from "react";
import { getLandscapesForLandscaper } from "../../api/landscapeApi";
import ProjectCard from "../ProjectCard";
import axios from "axios";
import { Search, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { motion } from "framer-motion";

const LandscaperProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useContext(AuthContext);
  const loggedInLandscaperId = user?.id;

  const fetchProjects = async () => {
    if (!loggedInLandscaperId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getLandscapesForLandscaper(loggedInLandscaperId);
      console.log("Fetched Projects Data:", data);
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Could not load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [loggedInLandscaperId]);

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const projectToUpdate = projects.find((p) => p._id === projectId);
      await axios.put(`http://localhost:5001/api/landscape/${projectId}`, {
        ...projectToUpdate,
        status: newStatus,
      });
      fetchProjects();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    return (
      project.name &&
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-700">Error</h3>
          </div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className=" mx-auto p-8 px-20 bg-gradient-to-b from-gray-50 to-white min-h-screen"
    >
      <div className="w-full mx-auto">
        <div className="flex flex-row items-center justify-between mb-6 w-full">
          {/* Header Section */}
          <div className="mb-0">
            <h1 className="text-4xl font-bold mb-2 text-gray-800 text-left bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
              My Projects
            </h1>
            <p className="text-gray-500">
              Manage and track all your landscape projects
            </p>
          </div>

          {/* Search Section - Aligned to right */}
          {projects.length > 0 && (
            <div className="mb-0 w-72">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                </span>
                <input
                  type="text"
                  placeholder="Search by project name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <PlusCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xl font-medium text-gray-700 mb-2">
              You haven't created any projects yet
            </p>
            <p className="text-gray-500 mb-6">
              Start by creating your first landscape project
            </p>
            <a
              href="/create-landscape"
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create New Project
            </a>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">
              No projects found matching "
              <span className="font-medium">{searchQuery}</span>"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-green-500 hover:text-green-700 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProjectCard
                  project={project}
                  onStatusUpdate={handleStatusUpdate}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LandscaperProjectsPage;
