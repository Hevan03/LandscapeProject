import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PencilIcon,
  StarIcon,
  HeartIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const CustomerDetails = ({ customer, onClose, onEdit }) => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (customer) {
      fetchMaintenanceRequests();
    }
  }, [customer]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/maintenance?customerId=${customer._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMaintenanceRequests(data.data.requests);
      }
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      toast.error("Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getLoyaltyBadgeColor = (status) => {
    switch (status) {
      case "bronze":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200";
      case "silver":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200";
      case "gold":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200";
      case "platinum":
        return "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200";
      case "inactive":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200";
      case "completed":
        return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200";
      case "cancelled":
        return "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200";
      case "in-progress":
        return "bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700 border border-orange-200";
      case "scheduled":
        return "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (!customer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h3>
                <p className="text-gray-500 font-medium">
                  #{customer.registrationNumber}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadgeColor(
                      customer.status
                    )}`}
                  >
                    {customer.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getLoyaltyBadgeColor(
                      customer.loyaltyStatus
                    )}`}
                  >
                    {customer.loyaltyStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 bg-white">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: UserIcon },
                { id: "services", label: "Service History", icon: ClockIcon },
                {
                  id: "referrals",
                  label: "Loyalty & Referrals",
                  icon: StarIcon,
                },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl p-5 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                      Personal Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <PhoneIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {customer.dateOfBirth
                            ? `${formatDate(
                                customer.dateOfBirth
                              )} (Age: ${calculateAge(customer.dateOfBirth)})`
                            : "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5">
                          <MapPinIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="text-gray-900 font-medium">
                          {customer.address?.street && (
                            <div>{customer.address.street}</div>
                          )}
                          {(customer.address?.city ||
                            customer.address?.state ||
                            customer.address?.zipCode) && (
                            <div>
                              {customer.address.city && customer.address.city}
                              {customer.address.city &&
                                customer.address.state &&
                                ", "}
                              {customer.address.state && customer.address.state}
                              {customer.address.zipCode &&
                                ` ${customer.address.zipCode}`}
                            </div>
                          )}
                          {customer.address?.country &&
                            customer.address.country !== "USA" && (
                              <div>{customer.address.country}</div>
                            )}
                          {!customer.address?.street &&
                            !customer.address?.city && (
                              <span className="text-gray-500">
                                No address provided
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Statistics */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-5 border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2 text-green-500" />
                      Customer Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {customer.totalServicesCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Total Services
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(customer.totalSpent || 0)}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Total Spent
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {customer.loyaltyPoints || 0}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Loyalty Points
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {customer.referralCount || 0}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          Referrals Made
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Customer since:</span>
                          <span className="font-medium">
                            {formatDate(customer.createdAt)}
                          </span>
                        </div>
                        {customer.lastServiceDate && (
                          <div className="flex items-center justify-between">
                            <span>Last service:</span>
                            <span className="font-medium">
                              {formatDate(customer.lastServiceDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-xl p-5 border border-gray-100 lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Preferences & Notes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          Preferred Services
                        </h5>
                        {customer.preferences?.serviceTypes?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {customer.preferences.serviceTypes.map(
                              (service, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200"
                                >
                                  {service}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No preferences set
                          </span>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">
                          Communication Method
                        </h5>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200">
                          {customer.preferences?.communicationMethod || "Email"}
                        </span>
                      </div>
                      {customer.preferences?.specialInstructions && (
                        <div className="md:col-span-2">
                          <h5 className="font-medium text-gray-900 mb-3">
                            Special Instructions
                          </h5>
                          <p className="text-gray-700 text-sm bg-white/70 p-4 rounded-lg border border-gray-200">
                            {customer.preferences.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "services" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
                      Service History
                    </h4>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                      {maintenanceRequests.length} total requests
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 font-medium">
                        Loading service history...
                      </span>
                    </div>
                  ) : maintenanceRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ClockIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p>No service requests found for this customer.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {maintenanceRequests.map((request) => (
                        <div
                          key={request._id}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <h5 className="font-semibold text-gray-900">
                                {request.serviceType}
                              </h5>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadgeColor(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-3">
                            {request.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Priority:{" "}
                              <span className="font-medium">
                                {request.priority}
                              </span>
                            </span>
                            {request.estimatedCost && (
                              <span className="text-green-600 font-semibold">
                                Estimated:{" "}
                                {formatCurrency(request.estimatedCost)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "referrals" && (
                <motion.div
                  key="referrals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {/* Loyalty Information */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50/50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <StarIcon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Loyalty Program
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Current Status
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getLoyaltyBadgeColor(
                              customer.loyaltyStatus
                            )}`}
                          >
                            {customer.loyaltyStatus}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Current Points
                          </span>
                          <span className="font-bold text-gray-900">
                            {customer.loyaltyPoints || 0}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Points to Next Level
                          </span>
                          <span className="font-bold text-gray-900">
                            {customer.loyaltyStatus === "platinum"
                              ? "Max Level"
                              : customer.loyaltyStatus === "gold"
                              ? 5000 - (customer.loyaltyPoints || 0)
                              : customer.loyaltyStatus === "silver"
                              ? 1000 - (customer.loyaltyPoints || 0)
                              : 500 - (customer.loyaltyPoints || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Referral Program
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Referrals
                          </span>
                          <span className="font-bold text-gray-900">
                            {customer.referralCount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Referral Discount Used
                          </span>
                          <span className="font-bold text-gray-900">
                            {customer.referralDiscountUsed ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      {customer.referredBy && (
                        <div className="bg-white/70 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Referred By
                            </span>
                            <span className="font-bold text-gray-900">
                              {customer.referredBy}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerDetails;
