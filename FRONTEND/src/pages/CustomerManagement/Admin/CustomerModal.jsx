import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CogIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const CustomerModal = ({ customer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    preferences: {
      serviceTypes: [],
      communicationMethod: "email",
      specialInstructions: "",
    },
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [, /* customers */ setCustomers] = useState([]);

  const serviceTypeOptions = [
    "Lawn Care",
    "Garden Design",
    "Tree Services",
    "Irrigation",
    "Landscaping",
    "Pest Control",
    "Seasonal Cleanup",
    "Hardscaping",
  ];

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split("T")[0] : "",
        preferences: {
          serviceTypes: customer.preferences?.serviceTypes || [],
          communicationMethod: customer.preferences?.communicationMethod || "email",
          specialInstructions: customer.preferences?.specialInstructions || "",
        },
        status: customer.status || "active",
      });
    }
    fetchCustomers();
  }, [customer]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/customers?limit=1000", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setCustomers(data.data.customers.filter((c) => c._id !== customer?._id));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceTypeChange = (serviceType) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        serviceTypes: prev.preferences.serviceTypes.includes(serviceType)
          ? prev.preferences.serviceTypes.filter((type) => type !== serviceType)
          : [...prev.preferences.serviceTypes, serviceType],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = customer ? `http://localhost:5001/api/customers/${customer._id}` : "http://localhost:5001/api/customers";

      const method = customer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(customer ? "Customer updated successfully" : "Customer created successfully");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to save customer");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-5xl backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50 rounded-3xl"></div>

          {/* Header */}
          <div className="relative border-b border-gray-100/50 p-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600  rounded-2xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {customer ? "Edit Customer" : "Add New Customer"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {customer ? "Update customer information and preferences" : "Create a new customer profile"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-2xl transition-all duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.button>
            </div>
          </div>

          {/* Form Content */}
          <div className="relative p-8 max-h-[82vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-sm bg-white/60 rounded-2xl p-4 border border-white/30"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-[10px] rounded-xl border  border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-[10px] rounded-xl border  border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-[10px] rounded-xl border  border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Date of Birth</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-[10px] rounded-xl border  border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Address Information</label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-[10px] rounded-xl border  border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        placeholder="123 Main Street"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Preferences Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-white/30"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <CogIcon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Preferences & Settings</h4>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Preferred Service Types</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {serviceTypeOptions.map((serviceType) => (
                        <motion.label
                          key={serviceType}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center p-3 bg-white/50 rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all duration-200 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.preferences.serviceTypes.includes(serviceType)}
                            onChange={() => handleServiceTypeChange(serviceType)}
                            className="w-4 h-4 text-green-600 accent-emerald-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 outline-none"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">{serviceType}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Communication Method</label>
                      <div className="relative">
                        <ChatBubbleLeftRightIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="preferences.communicationMethod"
                          value={formData.preferences.communicationMethod}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-[10px] rounded-xl border border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="sms">SMS</option>
                          <option value="mail">Mail</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                      <div className="relative">
                        <ExclamationCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-[10px] rounded-xl border border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Special Instructions</label>
                    <div className="relative">
                      <DocumentTextIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <textarea
                        name="preferences.specialInstructions"
                        value={formData.preferences.specialInstructions}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full pl-12 pr-4 py-[10px] rounded-xl border border-gray-200 focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                        placeholder="Any special instructions or notes about this customer..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Form Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-end space-x-4 pt-0 border-t border-gray-100/50"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-8 py-[8px] bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-semibold rounded-2xl transition-all duration-200 backdrop-blur-sm border border-gray-200/50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white py-[8px] px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">{loading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}</span>
                  {loading && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-50"></div>}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerModal;
