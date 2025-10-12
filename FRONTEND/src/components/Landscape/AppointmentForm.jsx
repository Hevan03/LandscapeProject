import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createAppointment, updateAppointment } from "../../api/appointmentApi";
import AuthContext from "../../context/AuthContext";

//libraries for the interactive map and calendar
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import toast from "react-hot-toast";

const AppointmentForm = ({ existingAppointment = null }) => {
  const isEditMode = !!existingAppointment;
  const { landscaperId: createModeLandscaperId } = useParams();
  const landscaperId = isEditMode ? existingAppointment.landscaper._id : createModeLandscaperId;
  const User = useContext(AuthContext);
  const navigate = useNavigate();
  const [landscaper, setLandscaper] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [contactError, setContactError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    contactNumber: existingAppointment?.contactNumber || "",
    customerAddress: existingAppointment?.customerAddress || {
      street: "",
      city: "",
      district: "",
    },
    siteAddress: existingAppointment?.siteAddress || {
      street: "",
      city: "",
      district: "",
    },
    appointmentDate: existingAppointment ? new Date(existingAppointment.appointmentDate) : null,
    timeSlot: existingAppointment?.timeSlot || "",
    siteArea: existingAppointment?.siteArea || "",
    siteImages: null,
    sitePlan: null,
  });

  // State for the Google Map marker
  const [markerPosition, setMarkerPosition] = useState(existingAppointment?.siteLocation || { lat: 7.2906, lng: 80.6337 });

  // Map options for consistent styling
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  // Hook to load the Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Effect to fetch the logged-in customer's data
  useEffect(() => {
    const loggedInCustomerId = User.user.id;
    if (!isEditMode) {
      axios
        .get(`http://localhost:5001/api/customers/${loggedInCustomerId}`)
        .then((res) => setCurrentUser(res.data))
        .catch((err) => console.error("Failed to fetch current user", err));
    }
  }, [isEditMode]);

  // Effect to fetch landscaper's availability
  useEffect(() => {
    if (landscaperId) {
      axios
        .get(`http://localhost:5001/api/landscaper/profile/${landscaperId}`)
        .then((res) => setLandscaper(res.data))
        .catch((err) => console.error("Failed to fetch landscaper", err));
    }
  }, [landscaperId]);

  // Pre-populate time slots on initial load in edit mode
  useEffect(() => {
    if (isEditMode && landscaper && formData.appointmentDate) {
      handleDateChange(formData.appointmentDate, true);
    }
  }, [isEditMode, landscaper, formData.appointmentDate]);

  // Memoize available dates to prevent unnecessary recalculations
  const availableDates = useMemo(() => {
    if (!landscaper?.availability) return [];
    return landscaper.availability.map((avail) => new Date(avail.date));
  }, [landscaper]);

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setFormData((prev) => ({ ...prev, contactNumber: value }));
      if (value.length > 0 && value.length < 10) {
        setContactError("Contact number must be 10 digits.");
      } else {
        setContactError("");
      }
    }
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddressChange = (e, type) =>
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [e.target.name]: e.target.value },
    }));

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "siteImages" && files.length > 5) {
      toast.error("You can only upload a maximum of 5 images.");
      e.target.value = null;
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: files }));
  };

  const handleDateChange = (date, isInitialLoad = false) => {
    const newTimeSlot = isInitialLoad ? formData.timeSlot : "";
    setFormData((prev) => ({
      ...prev,
      appointmentDate: date,
      timeSlot: newTimeSlot,
    }));
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateString = selectedDate.toISOString().split("T")[0];
    const dayAvailability = landscaper?.availability.find((a) => {
      const dbDate = new Date(a.date);
      const dbDateString = new Date(dbDate.getFullYear(), dbDate.getMonth(), dbDate.getDate()).toISOString().split("T")[0];
      return dbDateString === selectedDateString;
    });
    setAvailableSlots(dayAvailability ? dayAvailability.slots : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contactNumber.length !== 10) {
      setContactError("Contact number must be exactly 10 digits.");
      return;
    }

    setIsSubmitting(true);

    const submissionData = new FormData();
    const customerId = isEditMode ? existingAppointment.customer._id : currentUser?._id;
    if (!customerId) {
      toast.error("Could not identify the current user. Please try again.");
      setIsSubmitting(false);
      return;
    }

    submissionData.append("customer", customerId);
    submissionData.append("landscaper", landscaperId);
    submissionData.append("appointmentDate", formData.appointmentDate.toISOString());
    submissionData.append("customerAddress", JSON.stringify(formData.customerAddress));
    submissionData.append("siteAddress", JSON.stringify(formData.siteAddress));
    submissionData.append("siteLocation", JSON.stringify(markerPosition));
    Object.keys(formData).forEach((key) => {
      if (typeof formData[key] === "string") {
        submissionData.append(key, formData[key]);
      }
    });
    if (formData.siteImages) {
      Array.from(formData.siteImages).forEach((file) => submissionData.append("siteImages", file));
    }
    if (formData.sitePlan) {
      submissionData.append("sitePlan", formData.sitePlan[0]);
    }

    try {
      if (isEditMode) {
        await updateAppointment(existingAppointment._id, submissionData);
        toast.success("Appointment Updated Successfully!");
        navigate("/customerdashboard");
      } else {
        const response = await createAppointment(submissionData);

        const appointmentId = response.data._id;
        navigate("/paymentportal", {
          state: {
            amount: 5000, // Example fixed amount
            orderId: appointmentId,
            customerId: response.data.customer,
            orderType: "appointment",
            returnUrl: "/customer",
            showSuccessAfterPayment: true,
          },
        });

        if (location.state?.showSuccessAfterPayment) {
          toast.success("Booking Successful! Payment completed.");
        }
      }
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Submission Failed. Please check all fields and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!landscaper || (!isEditMode && !currentUser)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const customerName = isEditMode ? existingAppointment.customer.name : currentUser?.name;

  return (
    <div className="bg-gradient-to-b mt-16 from-gray-50 to-gray-100 py-10 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 py-6 px-8">
          <h1 className="text-3xl font-bold text-white">{isEditMode ? "Edit Your Appointment" : "Book an Appointment"}</h1>
          <p className="text-green-100 mt-2">with {landscaper.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Customer Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Your Name</label>
                  <input
                    type="text"
                    value={customerName || ""}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>

                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    placeholder="10-digit number"
                    onChange={handleContactNumberChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      contactError ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                    maxLength="10"
                  />
                  {contactError && <p className="mt-1 text-xs text-red-500">{contactError}</p>}
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-200">Customer Address</h2>

                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Street & Number</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.customerAddress.street}
                    placeholder="Enter street and number"
                    onChange={(e) => handleAddressChange(e, "customerAddress")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.customerAddress.city}
                      placeholder="Enter city"
                      onChange={(e) => handleAddressChange(e, "customerAddress")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.customerAddress.district}
                      placeholder="Enter district"
                      onChange={(e) => handleAddressChange(e, "customerAddress")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2 pb-2 border-b border-gray-200">Landscape Site Address</h2>

                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Street & Number</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.siteAddress.street}
                    placeholder="Enter street and number"
                    onChange={(e) => handleAddressChange(e, "siteAddress")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.siteAddress.city}
                      placeholder="Enter city"
                      onChange={(e) => handleAddressChange(e, "siteAddress")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-sm text-gray-600 mb-1 block">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.siteAddress.district}
                      placeholder="Enter district"
                      onChange={(e) => handleAddressChange(e, "siteAddress")}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Appointment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control w-full">
                  <label className="text-sm text-gray-600 mb-1 block">Select Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.appointmentDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      includeDates={availableDates}
                      placeholderText="Select an available date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      dateFormat="yyyy-MM-dd"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Select Time Slot</label>
                  <div className="relative">
                    <select
                      name="timeSlot"
                      onChange={handleChange}
                      value={formData.timeSlot}
                      disabled={!formData.appointmentDate || availableSlots.length === 0}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                        !formData.appointmentDate || availableSlots.length === 0 ? "bg-gray-100 text-gray-500" : "bg-white"
                      }`}
                      required
                    >
                      <option value="" disabled>
                        {formData.appointmentDate ? (availableSlots.length > 0 ? "Select a time" : "No slots available") : "Select a date first"}
                      </option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map and Site Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Site Location & Details</h2>

              <div className="form-control mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Pin the exact location (drag marker to position)</label>
                {isLoaded ? (
                  <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm h-[300px]">
                    <GoogleMap mapContainerStyle={{ height: "100%", width: "100%" }} center={markerPosition} zoom={14} options={mapOptions}>
                      <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={(e) => {
                          setMarkerPosition({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                          });
                        }}
                      />
                    </GoogleMap>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[300px] bg-gray-100 rounded-lg border border-gray-300">
                    <div className="flex flex-col items-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
                      <span>Loading Map...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-control mb-6">
                <label className="text-sm text-gray-600 mb-1 block">Area of the Site</label>
                <input
                  type="text"
                  name="siteArea"
                  value={formData.siteArea}
                  placeholder="e.g., 1500 sq ft, 0.25 acres"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Site Documentation</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Site Images (Max 5)</label>
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
                        <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP (MAX 5)</p>
                      </div>
                      <input
                        type="file"
                        name="siteImages"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/jpeg, image/png, image/gif, image/webp"
                      />
                    </label>
                  </div>
                  {formData.siteImages && <p className="mt-2 text-xs text-gray-500">{formData.siteImages.length} file(s) selected</p>}
                </div>

                <div className="form-control">
                  <label className="text-sm text-gray-600 mb-1 block">Site Plan (Optional)</label>
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
                          <span className="font-semibold">Upload plan</span> if available
                        </p>
                        <p className="text-xs text-gray-500">PDF format only</p>
                      </div>
                      <input type="file" name="sitePlan" onChange={handleFileChange} className="hidden" accept="application/pdf" />
                    </label>
                  </div>
                  {formData.sitePlan && <p className="mt-2 text-xs text-gray-500">{formData.sitePlan[0]?.name || "File selected"}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-sm transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
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
                  Processing...
                </div>
              ) : isEditMode ? (
                "Update Appointment"
              ) : (
                "Book Now & Proceed to Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
