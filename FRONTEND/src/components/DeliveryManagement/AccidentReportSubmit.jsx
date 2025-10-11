// src/pages/DriverAccidentReport.jsx

import React, { useState } from "react";
import { BsFileText, BsUpload } from "react-icons/bs";
import { FaUser, FaCar, FaClipboardList } from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";
import toast from "react-hot-toast";

// Import the API function
import { createAccidentReport } from "../../api/accidentReportApi";

const AccidentReportSubmit = () => {
  // State to handle form data
  const [formData, setFormData] = useState({
    driverId: "",
    vehicleNo: "",
    deliveryId: "",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file changes from the input
  const handleFileChange = (e) => {
    if (files.length + e.target.files.length > 6) {
      toast.error("You can upload a maximum of 6 photos.");
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
  };

  // Handle changes to text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // The updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real app, you would upload files to a service like Cloudinary or S3
      // For now, we'll send the form data and a placeholder for the photos
      const reportData = {
        ...formData,
        photos:
          files.length > 0
            ? files.map((file) => ({ name: file.name, url: "placeholder-url" }))
            : [],
        time: new Date(),
        status: "Reported",
      };

      await createAccidentReport(reportData); // This sends data to your backend!

      toast.success(
        "Accident report submitted successfully! An admin has been notified."
      );

      // Reset form after submission
      setFormData({
        driverId: "",
        vehicleNo: "",
        deliveryId: "",
        description: "",
      });
      setFiles([]);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <BsFileText className="mr-3 text-green-700" />
          Accident Report
        </h1>
        <p className="text-gray-500 mb-8">
          Please fill out this form to report an accident. This information will
          be sent directly to the administration team.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Form Fields - START */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Driver ID */}
            <div>
              <label className="label">
                <span className="label-text flex items-center">
                  <FaUser className="mr-2" /> Driver ID
                </span>
              </label>
              <input
                type="text"
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                placeholder="e.g., DRV-001"
                className="input input-bordered w-full rounded-lg"
                required
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="label">
                <span className="label-text flex items-center">
                  <FaCar className="mr-2" /> Vehicle Number
                </span>
              </label>
              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleInputChange}
                placeholder="e.g., LKA-1234"
                className="input input-bordered w-full rounded-lg"
                required
              />
            </div>

            {/* Delivery ID */}
            <div className="col-span-1">
              <label className="label">
                <span className="label-text flex items-center">
                  <FaClipboardList className="mr-2" /> Delivery ID (Optional)
                </span>
              </label>
              <input
                type="text"
                name="deliveryId"
                value={formData.deliveryId}
                onChange={handleInputChange}
                placeholder="e.g., ORD-001"
                className="input input-bordered w-full rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="label">
                <span className="label-text flex items-center">
                  <MdDescription className="mr-2" /> Description of the Accident
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full rounded-lg h-32"
                placeholder="Provide a detailed description of what happened..."
                required
              ></textarea>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="border border-dashed border-gray-400 p-6 rounded-lg text-center mb-6">
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-gray-500 hover:text-green-700 transition-colors duration-200"
            >
              <div className="flex flex-col items-center">
                <BiImageAdd size={40} className="text-gray-400" />
                <span className="mt-2 font-semibold">
                  Upload up to 6 Photos
                </span>
                <span className="text-sm">
                  Click to browse or drag and drop files
                </span>
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="badge badge-lg badge-outline gap-2"
                  >
                    <BsUpload /> {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Form Fields - END */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              <BsFileText className="mr-2" /> Report Accident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccidentReportSubmit;
