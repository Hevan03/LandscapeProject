import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaEnvelope,
  FaArrowLeft,
  FaShieldAlt,
  FaUserFriends,
  FaAward,
  FaCheckCircle,
} from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Email validation
    if (!email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would make the actual API call to your backend
      // const response = await api.post('/auth/forgot-password', { email });

      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  if (isSubmitted) {
    return (
      <div className="h-screen bg-white flex overflow-hidden">
        {/* Left Side - Features */}
        <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-700/70" />

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col justify-center items-start p-16 text-white"
          >
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <FaLeaf className="w-6 h-6 text-green-300" />
                </div>
                <span className="text-2xl font-bold">EcoScape Hub</span>
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Check Your
                <span className="block text-green-300">Email</span>
              </h1>

              <p className="text-xl text-green-100 mb-12 leading-relaxed">
                We've sent password reset instructions to your email address.
                Follow the link to create a new password.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/30">
                    <FaCheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Email Sent
                    </h3>
                    <p className="text-green-200 text-sm">
                      Check your inbox and spam folder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Success Message */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>

              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700">
                  <strong>Didn't receive the email?</strong> Check your spam
                  folder or wait a few minutes for delivery.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Resend Email
                </button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full text-gray-600 hover:text-gray-800 py-2 transition-colors duration-200"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left Side - Features */}
      <div className="hidden lg:flex flex-4 relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-700/70" />

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col justify-center items-start p-16 text-white"
        >
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <FaLeaf className="w-6 h-6 text-green-300" />
              </div>
              <span className="text-2xl font-bold">EcoScape Hub</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Reset Your
              <span className="block text-green-300">Password</span>
            </h1>

            <p className="text-xl text-green-100 mb-12 leading-relaxed">
              Don't worry, it happens to the best of us. Enter your email and
              we'll send you a link to reset your password.
            </p>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/30">
                  <FaShieldAlt className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Secure Process
                  </h3>
                  <p className="text-green-200 text-sm">
                    Your account security is our top priority
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/30">
                  <FaUserFriends className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Quick Support
                  </h3>
                  <p className="text-green-200 text-sm">
                    Need help? Our support team is here 24/7
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/30">
                  <FaAward className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Trusted Platform
                  </h3>
                  <p className="text-green-200 text-sm">
                    Join thousands of satisfied eco-gardeners
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-green-100 mb-4 italic">
                "The password reset process was quick and secure. I was back to
                planning my garden in no time!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center">
                  <span className="text-green-800 font-bold text-sm">MR</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Mike Roberts</div>
                  <div className="text-green-200 text-sm">Seattle, WA</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="flex-2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaLeaf className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                No worries, we'll help you reset it
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <FaEnvelope className="absolute left-4 top-12 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-12 pr-4 py-[10px] rounded-xl border border-gray-200 focus:ring-1 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-[8px] px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-500 font-semibold transition-colors duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 text-center leading-relaxed">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Sign in here
                </Link>
                <br />
                Need help?{" "}
                <Link
                  to="/contact"
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
