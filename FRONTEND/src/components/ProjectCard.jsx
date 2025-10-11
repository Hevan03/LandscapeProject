import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-hot-toast";
import {
  Download,
  UploadCloud,
  AlertTriangle,
  Clock,
  FileText,
  ArrowRight,
  Landmark,
} from "lucide-react";
import { uploadBlueprint } from "../api/landscapeApi";

const ProjectCard = ({ project, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [blueprintFile, setBlueprintFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // FOR BLUEPRINT UPLOAD
  const handleFileChange = (e) => {
    setBlueprintFile(e.target.files[0]);
  };

  const handleBlueprintUpload = async () => {
    if (!blueprintFile) {
      toast.error("Please select a blueprint file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("blueprintFile", blueprintFile);

    const toastId = toast.loading("Uploading blueprint...");
    try {
      await uploadBlueprint(project._id, formData);
      toast.success("Blueprint uploaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload blueprint.", { id: toastId });
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    dotsClass: "slick-dots custom-dots",
  };

  const PlaceholderImage = () => (
    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
      <Landmark size={32} className="text-gray-400 mb-2" />
      <p className="text-gray-500 font-medium">No Images Available</p>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Advance Payment Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className="overflow-hidden bg-white rounded-2xl shadow-md max-w-[450px] hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {project.projectImages && project.projectImages.length > 0 ? (
          <Slider {...sliderSettings} className="project-slider">
            {project.projectImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={`http://localhost:5001/${image}`}
                  alt={`Project ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </Slider>
        ) : (
          <PlaceholderImage />
        )}

        <div
          className={`absolute top-4 right-4 px-3 py-1 rounded-full ${getStatusColor(
            project.status
          )} text-xs font-medium`}
        >
          {project.status}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock size={14} className="mr-1" />
          <span>For: {project.customerId?.name || "N/A"}</span>
        </div>

        <div className="bg-green-50 px-4 py-3 rounded-lg mb-4">
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(project.totalCost)}
          </p>
          <p className="text-xs text-green-600">Total Project Cost</p>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {project.description}
        </p>

        {project.blueprintRequested && !project.blueprintFile && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 mt-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle size={18} className="mr-2 text-amber-500" />
              <p className="font-semibold">Blueprint Request</p>
            </div>
            <p className="text-sm mb-3">
              The customer has requested a blueprint for this project.
            </p>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0 file:text-sm file:font-semibold
                             file:bg-green-50 file:text-green-700 hover:file:bg-green-100
                             cursor-pointer focus:outline-none"
                  accept="application/pdf"
                />
              </div>
              <button
                onClick={handleBlueprintUpload}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-colors flex items-center justify-center text-sm font-medium"
              >
                <UploadCloud size={16} className="mr-2" /> Upload Blueprint
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          {project.sitePlan && (
            <a
              href={`http://localhost:5001/${project.sitePlan}`}
              download
              className="flex items-center justify-center px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <Download size={15} className="mr-2" /> Site Plan
            </a>
          )}
          {project.quotation && (
            <a
              href={`http://localhost:5001/${project.quotation}`}
              download
              className="flex items-center justify-center px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <FileText size={15} className="mr-2" /> Quotation
            </a>
          )}
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Status
          </label>
          <select
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={project.status}
            onChange={(e) => onStatusUpdate(project._id, e.target.value)}
          >
            <option>Advance Payment Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <button
          onClick={() => navigate(`/addprogress/${project._id}`)}
          className="w-full mt-5 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center justify-center font-medium group"
        >
          View Progress
          <ArrowRight
            size={18}
            className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
