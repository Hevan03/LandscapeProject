import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { toast } from "react-hot-toast";
import { ArrowRightIcon, DocumentArrowDownIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { requestBlueprint } from "../../api/landscapeApi";
import { motion } from "framer-motion";

const CustomerProjectCard = ({ project, onUpdate, onPayAdvance }) => {
  const navigate = useNavigate();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const handleRequestBlueprint = async () => {
    if (window.confirm("Are you sure you want to request a blueprint? This will add LKR 5,000 to your advance payment.")) {
      try {
        await requestBlueprint(project._id);
        toast.success("Blueprint requested! Your landscaper has been notified.");
        onUpdate();
      } catch {
        toast.error("Failed to request blueprint.");
      }
    }
  };

  // CALCULATIONS FOR PAYMENTS
  const advancePercentage = 0.1;
  const balancePercentage = 0.9;
  const blueprintCost = 5000;

  const advanceAmount = project.totalCost * advancePercentage;
  const totalAdvance = project.blueprintRequested ? advanceAmount + blueprintCost : advanceAmount;
  const balanceAmount = project.totalCost * balancePercentage;

  // Status badge color mapping
  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-emerald-100 text-emerald-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      "Advance Payment Pending": "bg-green-100 text-green-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full backdrop-blur-sm backdrop-saturate-150"
    >
      {/* Image Slider */}
      <div className="relative">
        {project.projectImages && project.projectImages.length > 0 ? (
          <Slider {...sliderSettings} className="project-slider">
            {project.projectImages.map((image, index) => (
              <div key={index} className="relative">
                <img src={`http://localhost:5001/${image}`} alt={`Project ${index + 1}`} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
            <p className="text-gray-400 font-medium">No Images Available</p>
          </div>
        )}

        {/* Status Badge - Positioned on the image */}
        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h2>

        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-lg font-bold text-green-600">{formatCurrency(project.totalCost)}</span>
          <span className="text-sm text-gray-500 ml-2">Total Cost</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6 line-clamp-3">{project.description}</p>

        {/* Blueprint Section */}
        <div className="rounded-xl bg-green-50/50 p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-6 bg-green-500 rounded-full mr-2 inline-block"></span>
            Blueprint
          </h3>

          {!project.blueprintFile && !project.blueprintRequested && (
            <button
              onClick={handleRequestBlueprint}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow"
            >
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
              Request Blueprint (LKR 5,000)
            </button>
          )}

          {!project.blueprintFile && project.blueprintRequested && (
            <div className="py-2.5 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg text-center">
              <p className="text-green-700 font-medium">
                Blueprint request sent
                <span className="block text-sm text-green-600 mt-1">Awaiting landscaper response...</span>
              </p>
            </div>
          )}

          {project.blueprintFile && (
            <a
              href={`http://localhost:5001/${project.blueprintFile}`}
              download
              className="w-full py-2.5 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download Blueprint
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50/50 flex justify-between items-center">
        {/* Payment Buttons */}
        <div>
          {project.status === "Advance Payment Pending" && (
            <button
              onClick={onPayAdvance}
              className="py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-300 hover:from-green-700 hover:to-green-600"
            >
              <span>Pay Advance</span>
              <span className="inline-block ml-2">{formatCurrency(totalAdvance)}</span>
              {project.blueprintRequested && <span className="text-xs ml-1 opacity-90">(incl. blueprint)</span>}
            </button>
          )}

          {project.status === "In Progress" && (
            <button
              onClick={onPayAdvance}
              className="py-2 px-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-300 hover:from-green-800 hover:to-green-700"
            >
              <span>Pay Balance</span>
              <span className="inline-block ml-2">{formatCurrency(balanceAmount)}</span>
            </button>
          )}
        </div>

        {/* View Progress Button */}
        <button
          onClick={() => navigate(`/customer/progress/${project._id}`)}
          className="py-2 px-4 text-green-700 hover:text-green-800 bg-white/60 hover:bg-white/90 rounded-lg flex items-center font-medium transition-colors duration-300"
        >
          View Progress
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default CustomerProjectCard;
