import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createLandscape } from "../../api/landscapeApi";
import AuthContext from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const CreateLandscapePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [landscaper, setLandscaper] = useState(null);
  const { user } = useContext(AuthContext);
  const loggedInLandscaperId = user?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadCounts, setUploadCounts] = useState({
    projectImages: 0,
    sitePlan: 0,
    quotation: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customerId: "",
    totalCost: "",
    projectImages: null,
    sitePlan: null,
    quotation: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const landscaperRes = await axios.get(`http://localhost:5001/api/landscaper/profile/${loggedInLandscaperId}`);
        setLandscaper(landscaperRes.data);
        const customersRes = await axios.get("http://localhost:5001/api/customers");
        setCustomers(customersRes.data.data.customers);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast.error("Failed to load necessary data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [loggedInLandscaperId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Add a special check for the totalCost field
    if (name === "totalCost") {
      // If the value is negative, do not update the state.
      if (Number(value) < 0) {
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "projectImages" && files.length > 10) {
      toast.error("You can only upload a maximum of 10 images.");
      e.target.value = null;
      return;
    }
    setFormData({ ...formData, [name]: files });
    setUploadCounts({ ...uploadCounts, [name]: files ? files.length : 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.totalCost) {
      toast.error("Please select a customer and enter the total cost.");
      return;
    }

    setIsSubmitting(true);
    const submissionData = new FormData();

    submissionData.append("name", formData.name);
    submissionData.append("description", formData.description);
    submissionData.append("customerId", formData.customerId);
    submissionData.append("landscaperId", loggedInLandscaperId);
    submissionData.append("totalCost", formData.totalCost);

    if (formData.projectImages) {
      Array.from(formData.projectImages).forEach((file) => {
        submissionData.append("projectImages", file);
      });
    }
    if (formData.sitePlan) {
      submissionData.append("sitePlan", formData.sitePlan[0]);
    }
    if (formData.quotation) {
      submissionData.append("quotation", formData.quotation[0]);
    }

    try {
      await createLandscape(submissionData);
      toast.success("Project created successfully!");
      navigate("/landscaper/home");
    } catch (error) {
      console.error("Failed to create project", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 py-6 px-8">
            <h1 className="text-3xl font-bold text-white">Create New Landscape Project</h1>
            <p className="text-green-100 mt-2">Designing for: {landscaper?.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Project Details Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Project Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Modern Garden Overhaul"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">Select Customer</label>
                    <div className="relative">
                      <select
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        required
                      >
                        <option value="" disabled>
                          -- Choose a customer --
                        </option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-gray-600 mb-1 block">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Briefly describe the project goals, scope, and specific requirements..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-gray-600 mb-1 block">Total Cost (LKR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">LKR</span>
                    <input
                      type="number"
                      name="totalCost"
                      value={formData.totalCost}
                      onChange={handleChange}
                      placeholder="e.g., 150000"
                      className="w-full px-4 py-2.5 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Project Documents</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">Quotation (PDF Only)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-2 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF files only</p>
                        </div>
                        <input type="file" name="quotation" onChange={handleFileChange} className="hidden" accept="application/pdf" />
                      </label>
                    </div>
                    {uploadCounts.quotation > 0 && <p className="mt-2 text-xs text-green-600">{formData.quotation[0].name} selected</p>}
                  </div>

                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">Site Plan (PDF Only)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-2 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF files only</p>
                        </div>
                        <input type="file" name="sitePlan" onChange={handleFileChange} className="hidden" accept="application/pdf" />
                      </label>
                    </div>
                    {uploadCounts.sitePlan > 0 && <p className="mt-2 text-xs text-green-600">{formData.sitePlan[0].name} selected</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-gray-600 mb-1 block">Project Images (Max 10)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-2 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX 10)</p>
                      </div>
                      <input type="file" name="projectImages" onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                    </label>
                  </div>
                  {uploadCounts.projectImages > 0 && (
                    <p className="mt-2 text-xs text-green-600">
                      {uploadCounts.projectImages} image{uploadCounts.projectImages > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-sm transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Project...
                    </div>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLandscapePage;
