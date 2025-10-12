import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API_BASE_URL } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  TruckIcon,
  UserGroupIcon,
  SparklesIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

const USER_TYPES = [
  {
    value: "customer",
    label: "Customer",
    icon: <UserIcon className="h-4 w-4" />,
  },
  // { value: "driver", label: "Driver", icon: <TruckIcon className="h-4 w-4" /> },
  // {
  //   value: "employee",
  //   label: "Employee",
  //   icon: <BriefcaseIcon className="h-4 w-4" />,
  // },
  // {
  //   value: "landscaper",
  //   label: "Landscaper",
  //   icon: <SparklesIcon className="h-4 w-4" />,
  // },
];

// Define fields for each user type based on backend models
const FIELDS = {
  customer: [
    {
      name: "name",
      label: "Full Name",
      icon: UserIcon,
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      icon: EnvelopeIcon,
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      icon: PhoneIcon,
      type: "tel",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      icon: MapPinIcon,
      type: "text",
      required: false,
    },
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      icon: CalendarIcon,
      type: "date",
      required: false,
    },
    {
      name: "password",
      label: "Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
    {
      name: "referralNumber",
      label: "Referral Number",
      icon: DocumentIcon,
      type: "text",
      required: false,
      placeholder: "Enter referral number (optional)",
    },
  ],
  driver: [
    {
      name: "name",
      label: "Full Name",
      icon: UserIcon,
      type: "text",
      required: true,
    },
    {
      name: "contact",
      label: "Contact Number",
      icon: PhoneIcon,
      type: "tel",
      required: true,
      pattern: "\\d{10}",
      placeholder: "Enter 10 digit number",
    },
    {
      name: "licenseNo",
      label: "License Number",
      icon: DocumentIcon,
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      icon: EnvelopeIcon,
      type: "email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
  ],
  employee: [
    {
      name: "Employee_Name",
      label: "Full Name",
      icon: UserIcon,
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      icon: EnvelopeIcon,
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      icon: PhoneIcon,
      type: "tel",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      icon: MapPinIcon,
      type: "text",
      required: false,
    },
    {
      name: "department",
      label: "Department",
      icon: BriefcaseIcon,
      type: "text",
      required: false,
    },
    {
      name: "designation",
      label: "Designation",
      icon: BriefcaseIcon,
      type: "text",
      required: false,
    },
    {
      name: "password",
      label: "Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
  ],
  managementEmployee: [
    {
      name: "name",
      label: "Full Name",
      icon: UserIcon,
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      icon: EnvelopeIcon,
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      icon: PhoneIcon,
      type: "tel",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      icon: MapPinIcon,
      type: "text",
      required: false,
    },
    {
      name: "department",
      label: "Department",
      icon: UserGroupIcon,
      type: "text",
      required: true,
    },
    {
      name: "designation",
      label: "Designation",
      icon: UserGroupIcon,
      type: "text",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
  ],
  landscaper: [
    {
      name: "serviceNum",
      label: "Service Number",
      icon: SparklesIcon,
      type: "number",
      required: true,
    },
    {
      name: "name",
      label: "Full Name",
      icon: UserIcon,
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      icon: EnvelopeIcon,
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      icon: PhoneIcon,
      type: "tel",
      required: true,
      placeholder: "Enter phone number",
    },
    {
      name: "address",
      label: "Address",
      icon: MapPinIcon,
      type: "text",
      required: false,
    },
    {
      name: "Employee_Image",
      label: "Employee Image (URL)",
      icon: DocumentIcon,
      type: "text",
      required: false,
      placeholder: "Paste image URL (optional)",
    },
    // For availability, you may want a custom component or leave as a text field for now
    {
      name: "availability",
      label: "Availability (JSON or leave blank)",
      icon: CalendarIcon,
      type: "text",
      required: false,
      placeholder: 'e.g. [{"date":"2025-10-10","timeSlots":["09:00","13:00"]}]',
    },
    {
      name: "status",
      label: "Status",
      icon: BriefcaseIcon,
      type: "select",
      required: false,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      name: "password",
      label: "Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      icon: LockClosedIcon,
      type: "password",
      required: true,
    },
  ],
};

const initialState = {
  userType: "customer",
  name: "",
  email: "",
  contact: "",
  address: "",
  dateOfBirth: "",
  department: "",
  designation: "",
  licenseNum: "",
  serviceNum: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const { loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Update form fields when userType changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleUserTypeChange = (e) => {
    setFormData({
      ...initialState,
      userType: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    // Prepare payload based on selected userType
    const { confirmPassword: _confirmPassword, ...registerData } = formData;

    // Choose API endpoint based on userType
    let endpoint = "";
    switch (formData.userType) {
      case "customer":
        endpoint = "/customers/register";
        break;
      case "driver":
        endpoint = "/staff/driver/register";
        break;
      case "employee":
        endpoint = "/staff/register";
        break;
      case "managementEmployee":
        endpoint = "/staff/management/register";
        break;
      case "landscaper":
        endpoint = "/staff/landscaper/register";
        break;
      default:
        endpoint = "/auth/register";
    }

    if (formData.specialties && typeof formData.specialties === "string") {
      registerData.specialties = formData.specialties.split(",").map((s) => s.trim());
    }
    if (formData.availability && typeof formData.availability === "string") {
      try {
        registerData.availability = JSON.parse(formData.availability);
      } catch {
        registerData.availability = [];
      }
    }

    try {
      const res = await fetch(API_BASE_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const result = await res.json();
      if (result.success) {
        navigate("/login");
      } else {
        toast.error(result.message || "Registration failed");
        console.error("Registration error:", result);
      }
    } catch (err) {
      toast.error(err + "Server error");
    }
  };

  const fields = FIELDS[formData.userType];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join our landscaping community</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
              <button type="button" onClick={clearError} className="absolute top-0 right-0 mt-3 mr-3 text-red-400 hover:text-red-600">
                ×
              </button>
            </div>
          )}

          {/* User Type Selection */}
          <div className="hidden">
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              Register as *
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleUserTypeChange}
              className="mt-1 block w-full rounded-lg py-2 pl-2 border outline-none border-gray-300  focus:border-green-500 focus:ring-green-500 sm:text-sm"
            >
              {USER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields */}
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 z-50 pl-3 flex items-center pointer-events-none">
                  <field.icon className="h-4 w-4 text-gray-400" />
                </div>

                {field.type === "password" ? (
                  <>
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword[field.name] ? "text" : "password"}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility(field.name)}
                    >
                      {showPassword[field.name] ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-500 hover:text-gray-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-500 hover:text-gray-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            </div>
          ))}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200">
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
