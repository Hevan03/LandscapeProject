import React from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClipboardIcon,
  TrophyIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You must be logged in to view your profile.</p>
        </motion.div>
      </div>
    );
  }

const handleCopyReferral = async () => {
  try {
    await navigator.clipboard.writeText(user.registrationNumber || "");
    toast.success('Referral code copied to clipboard!');
  } catch (err) {
    toast.error('Failed to copy to clipboard');
  }
};

  // Calculate loyalty progress
  const loyaltyLevels = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentLevelIndex = loyaltyLevels.indexOf(user.loyaltyLevel || 'Bronze');
  const progress = ((currentLevelIndex + 1) / loyaltyLevels.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-700 to-teal-600 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-green-600 shadow-lg">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-green-100 flex items-center gap-2">
                  <EnvelopeIcon className="w-5 h-5" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            {/* Loyalty Status Card */}
            <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Loyalty Status</h3>
                </div>
                <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {user.loyaltyLevel || 'Bronze'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-teal-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <span>{user.loyaltyPoints || 0} points</span>
                <span>Next level: {loyaltyLevels[currentLevelIndex + 1] || 'Max Level'}</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <span>{user.phone || "Not provided"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <span>{user.address || "Not provided"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span>
                    {user.dateOfBirth 
                      ? new Date(user.dateOfBirth).toLocaleDateString() 
                      : "Not provided"}
                  </span>
                </div>
              </div>

              {/* Stats & Referrals */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Stats & Referrals</h3>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-5 h-5 text-gray-400" />
                    <span>Total Referrals</span>
                  </div>
                  <span className="font-semibold">{user.totalReferrals || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <span>Total Spent</span>
                  </div>
                  <span className="font-semibold">Rs. {user.totalSpent || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <StarIcon className="w-5 h-5 text-gray-400" />
                    <span>Total Services</span>
                  </div>
                  <span className="font-semibold">{user.totalServicesCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200">
                  <code className="text-green-600 font-mono">
                    {user.registrationNumber || "Not available"}
                  </code>
                </div>
                <button 
                  onClick={handleCopyReferral}
                  className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Share this code with friends and earn 100 points for each referral!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;