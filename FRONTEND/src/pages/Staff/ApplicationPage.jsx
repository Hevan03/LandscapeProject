import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const ApplicationPage = () => {
  const [formData, setFormData] = useState({
    Employee_Name: "",
    Employee_Email: "",
    Employee_Contact_Num: "",
    Employee_Adress: "",
    Employee_Type: "",
    Avilability: "",
    License_Num: "",
    Employee_CV: null,
  });

  const fileInputRef = React.useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));

    // Show toast for file upload
    if (type === "file" && files[0]) {
      toast.success(`File "${files[0].name}" selected`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Submitting your application...");

    const submitData = new FormData();

    // Generate unique Service_Num (timestamp + random number)
    const serviceNum = Date.now() + Math.floor(Math.random() * 1000);
    submitData.append("Service_Num", serviceNum);

    // Add Created_By field
    submitData.append("Created_By", "Online Application");

    Object.keys(formData).forEach((key) => {
      if (key === "Employee_CV" && formData[key]) {
        submitData.append("cv", formData[key]);
      } else if (key !== "Employee_CV") {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5001/api/staff/employee", {
        method: "POST",
        body: submitData,
      });

      toast.dismiss(); // Remove loading toast

      if (response.ok) {
        toast.success("Application submitted successfully! Your application is now under admin review.");
        setFormData({
          Employee_Name: "",
          Employee_Email: "",
          Employee_Contact_Num: "",
          Employee_Adress: "",
          Employee_Type: "",
          Avilability: "",
          License_Num: "",
          Employee_CV: null,
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorData = await response.json();
        console.error("Application submission error:", errorData);
        toast.error(errorData.message || "Failed to submit application. Please check all required fields.");
      }
    } catch (error) {
      toast.dismiss(); // Remove loading toast
      console.error("Network error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen py-12 px-20">
      <div className="max-w-4xl mx-auto relative">
        {/* Back Button */}
        <Link to="/" className="absolute -top-10 flex items-center text-green-700 hover:text-green-900 font-medium transition-all duration-200">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        {/* Header Section with Brand Colors */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-700 to-green-500 rounded-t-2xl p-10 text-white shadow-lg">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold tracking-wide mb-2">Join Our Team</h1>
            <p className="text-xl text-green-100 max-w-xl">Become part of LeafSphere's mission to connect nature, people, and sustainability</p>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        </div>

        {/* Form Section */}
        <div className="bg-white shadow-2xl rounded-b-2xl p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-green-100">
                <span className="text-green-600 text-2xl bg-green-50 p-2 rounded-full">👤</span>
                <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="Employee_Name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="Employee_Name"
                      name="Employee_Name"
                      value={formData.Employee_Name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="input input-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="Employee_Email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="Employee_Email"
                      name="Employee_Email"
                      value={formData.Employee_Email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      className="input input-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="Employee_Contact_Num" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="Employee_Contact_Num"
                      name="Employee_Contact_Num"
                      value={formData.Employee_Contact_Num}
                      onChange={handleChange}
                      placeholder="+94 (XX) XXX XXXX"
                      required
                      className="input input-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="Employee_Adress" className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <textarea
                      id="Employee_Adress"
                      name="Employee_Adress"
                      value={formData.Employee_Adress}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      rows="3"
                      required
                      className="textarea textarea-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center space-x-2 pb-2 border-b-2 border-green-100">
                <span className="text-green-600 text-2xl bg-green-50 p-2 rounded-full">🌱</span>
                <h2 className="text-xl font-semibold text-gray-700">Job Details</h2>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="Employee_Type" className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <div className="relative">
                    <select
                      id="Employee_Type"
                      name="Employee_Type"
                      value={formData.Employee_Type}
                      onChange={(e) => {
                        handleChange(e);
                        toast.success(`Selected position: ${e.target.value}`);
                      }}
                      required
                      className="select select-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                    >
                      <option value="">Select Position</option>
                      <option value="General Employee">General Employee</option>
                      <option value="Landscaper">Landscaper</option>
                      <option value="Driver">Driver</option>
                      <option value="Maintenance Worker">Maintenance Worker</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="Avilability" className="block text-sm font-medium text-gray-700 mb-1">
                    Availability *
                  </label>
                  <div className="relative">
                    <select
                      id="Avilability"
                      name="Avilability"
                      value={formData.Avilability}
                      onChange={(e) => {
                        handleChange(e);
                        toast.success(`Selected availability: ${e.target.value}`);
                      }}
                      required
                      className="select select-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                    >
                      <option value="">Select Availability</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>

                {formData.Employee_Type === "Driver" && (
                  <div className="sm:col-span-2">
                    <label htmlFor="License_Num" className="block text-sm font-medium text-gray-700 mb-1">
                      Driver's License Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="License_Num"
                        name="License_Num"
                        value={formData.License_Num}
                        onChange={handleChange}
                        placeholder="Enter your license number"
                        required
                        className="input input-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100"
                      />
                    </div>
                    <p className="mt-1 text-sm text-green-600">Your license will be verified before employment</p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="Employee_CV" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Resume (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="file"
                      id="Employee_CV"
                      name="Employee_CV"
                      ref={fileInputRef}
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                      className="file-input file-input-bordered w-full focus:ring-green-500 focus:border-green-500 rounded-lg bg-green-50 border-green-100 file:bg-green-500 file:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      PDF, DOC, or DOCX format. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => !isSubmitting && toast.success("Preparing to submit...")}
                className="btn w-full bg-gradient-to-r from-green-700 to-green-500 text-white hover:from-green-800 hover:to-green-600 rounded-xl py-4 px-4 shadow-lg transform transition duration-200 hover:scale-[1.02] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Application...
                  </span>
                ) : (
                  <span className="flex items-center justify-center text-lg">
                    <span className="mr-2">📝</span>
                    Submit Application
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 text-sm text-gray-600 bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium">Thank you for your interest in joining LeafSphere.</p>
          <p className="mt-1">Our team will review your application and get back to you within 5-7 business days.</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
