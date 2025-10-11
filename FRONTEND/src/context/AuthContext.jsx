import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// API Configuration
export const API_BASE_URL = "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  AUTH_START: "AUTH_START",
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_FAILURE: "AUTH_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_USER: "SET_USER",
};

const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case actionTypes.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: actionTypes.SET_USER,
          payload: parsedUser,
        });
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // API Helper function
  const handleApiCall = async (apiCall, successMessage, failureMessage) => {
    dispatch({ type: actionTypes.AUTH_START });

    try {
      const response = await apiCall();

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.customer));

        dispatch({
          type: actionTypes.AUTH_SUCCESS,
          payload: {
            user: response.data.data.customer,
            token: response.data.data.token,
          },
        });

        if (successMessage) {
          toast.success(successMessage);
        }
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || failureMessage || "Operation failed";
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    return await handleApiCall(
      () => api.post("/customers/register", userData),
      "Registration successful! Welcome to our community!",
      "Registration failed"
    );
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.token) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        dispatch({
          type: actionTypes.AUTH_SUCCESS,
          payload: { user: response.data.user, token: response.data.token },
        });
        toast.success("Login successful! Welcome back!");
        return { success: true, data: response.data.user };
      } else {
        dispatch({
          type: actionTypes.AUTH_FAILURE,
          payload: response.data.message || "Login failed",
        });
        toast.error(response.data.message || "Login failed");
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: actionTypes.LOGOUT });
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // Get token
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Get current user
  const getCurrentUser = () => {
    return state.user;
  };

  // Update user profile (for future use)
  const updateProfile = async (profileData) => {
    dispatch({ type: actionTypes.AUTH_START });

    try {
      const response = await api.put("/customers/profile", profileData);

      if (response.data.success) {
        const updatedUser = response.data.data.customer;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch({
          type: actionTypes.AUTH_SUCCESS,
          payload: {
            user: updatedUser,
            token: getToken(),
          },
        });

        toast.success("Profile updated successfully!");
        return { success: true, data: updatedUser };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Profile update failed";
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password (for future use)
  const forgotPassword = async (email) => {
    dispatch({ type: actionTypes.AUTH_START });

    try {
      const response = await api.post("/customers/forgot-password", { email });

      if (response.data.success) {
        dispatch({ type: actionTypes.CLEAR_ERROR });
        toast.success("Password reset instructions sent to your email!");
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send reset instructions";
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password (for future use)
  const resetPassword = async (token, newPassword) => {
    dispatch({ type: actionTypes.AUTH_START });

    try {
      const response = await api.post("/customers/reset-password", {
        token,
        password: newPassword,
      });

      if (response.data.success) {
        dispatch({ type: actionTypes.CLEAR_ERROR });
        toast.success("Password reset successfully!");
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Password reset failed";
      dispatch({
        type: actionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Provide context value
  const value = {
    user: state.user,
    isAuthenticated: !!state.user && !!localStorage.getItem("token"), // Boolean value
    loading: state.loading,
    error: state.error,

    login,
    register,
    logout,
    clearError,
    getToken,
    hasRole,
    getCurrentUser,
    updateProfile,
    forgotPassword,
    resetPassword,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
