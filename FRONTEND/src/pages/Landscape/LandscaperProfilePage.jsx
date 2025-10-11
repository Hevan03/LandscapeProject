import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import AuthContext from "../../context/AuthContext";

const LandscaperProfilePage = () => {
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    specialties: [],
    availability: [],
  });

  // New specialty input state
  const [newSpecialty, setNewSpecialty] = useState("");

  // New availability inputs
  const [newAvailability, setNewAvailability] = useState({
    date: "",
    slots: [],
  });
  const [newTimeSlot, setNewTimeSlot] = useState("");

  // Common time slots for quick selection
  const commonTimeSlots = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

  useEffect(() => {
    const fetchLandscaperProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5001/api/landscaper/profile/${auth.user.id}`);
        const data = await response.json();
        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          specialties: data.specialties || [],
          availability: data.availability || [],
        });

        // Set image preview if exists
        if (data.Employee_Image) {
          setImagePreview(`http://localhost:5001/${data.Employee_Image}`);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (auth.user?.id) {
      fetchLandscaperProfile();
    }
  }, [auth.user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() !== "") {
      if (!profile.specialties.includes(newSpecialty.trim())) {
        setProfile((prev) => ({
          ...prev,
          specialties: [...prev.specialties, newSpecialty.trim()],
        }));
        setNewSpecialty("");
      } else {
        toast.error("This specialty is already in your list");
      }
    }
  };

  const removeSpecialty = (index) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const addTimeSlot = () => {
    if (newTimeSlot && !newAvailability.slots.includes(newTimeSlot)) {
      setNewAvailability((prev) => ({
        ...prev,
        slots: [...prev.slots, newTimeSlot],
      }));
      setNewTimeSlot("");
    }
  };

  const removeTimeSlot = (slot) => {
    setNewAvailability((prev) => ({
      ...prev,
      slots: prev.slots.filter((s) => s !== slot),
    }));
  };

  const addAvailability = () => {
    if (newAvailability.date && newAvailability.slots.length > 0) {
      // Check if this date already exists
      const existingDateIndex = profile.availability.findIndex(
        (a) => new Date(a.date).toDateString() === new Date(newAvailability.date).toDateString()
      );

      if (existingDateIndex >= 0) {
        // Update existing date's slots
        const updatedAvailability = [...profile.availability];
        const existingSlots = updatedAvailability[existingDateIndex].slots;
        const newSlots = newAvailability.slots.filter((slot) => !existingSlots.includes(slot));
        updatedAvailability[existingDateIndex].slots = [...existingSlots, ...newSlots];

        setProfile((prev) => ({
          ...prev,
          availability: updatedAvailability,
        }));
      } else {
        // Add new date
        setProfile((prev) => ({
          ...prev,
          availability: [
            ...prev.availability,
            {
              date: newAvailability.date,
              slots: newAvailability.slots,
            },
          ],
        }));
      }

      // Reset new availability form
      setNewAvailability({
        date: "",
        slots: [],
      });
    } else {
      toast.error("Please select a date and at least one time slot");
    }
  };

  const removeAvailability = (index) => {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      formData.append("email", profile.email);
      formData.append("address", profile.address);
      formData.append("specialties", JSON.stringify(profile.specialties));
      formData.append("availability", JSON.stringify(profile.availability));

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch(`http://localhost:5001/api/landscaper/update-profile/${auth.user.id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // Do NOT set Content-Type for FormData; browser will set it automatically
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800">Landscaper Profile</h1>
          <p className="text-gray-600 mt-2">Update your profile information and availability schedule</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image */}
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-green-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-4 flex-grow">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    disabled
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    disabled
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    disabled
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specialties Section */}
          <div className="border-t border-b py-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Specialties</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.specialties.map((specialty, index) => (
                <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                  <span>{specialty}</span>
                  <button type="button" onClick={() => removeSpecialty(index)} className="ml-2 text-green-600 hover:text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {profile.specialties.length === 0 && <p className="text-gray-500 text-sm">Add your specialties below</p>}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="New specialty (e.g., Lawn Care)"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">Examples: Lawn Care, Garden Design, Tree Pruning, Irrigation, Hardscaping</p>
          </div>

          {/* Availability Calendar */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Availability</h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Current Availability</h3>

              {profile.availability.length > 0 ? (
                <div className="space-y-4">
                  {profile.availability.map((day, index) => (
                    <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-800">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </h4>
                        <button type="button" onClick={() => removeAvailability(index)} className="text-red-500 hover:text-red-700">
                          Remove Day
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {day.slots.map((slot, slotIndex) => (
                          <span key={slotIndex} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No availability added yet. Add your available days and time slots below.</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Add New Availability</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newAvailability.date}
                    onChange={(e) => setNewAvailability((prev) => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slots</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {newAvailability.slots.map((slot) => (
                      <div key={slot} className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center text-sm">
                        <span>{slot}</span>
                        <button type="button" onClick={() => removeTimeSlot(slot)} className="ml-1 text-green-600 hover:text-green-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {newAvailability.slots.length === 0 && <p className="text-gray-400 text-sm">No time slots added</p>}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <select
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select a time slot</option>
                      {commonTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      disabled={!newTimeSlot}
                    >
                      Add Slot
                    </button>
                  </div>
                  {/* Quick Insert Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      className="px-3 py-2 bg-green-200 text-green-800 rounded hover:bg-green-300 transition-colors"
                      onClick={() =>
                        setNewAvailability((prev) => ({
                          ...prev,
                          slots: [...commonTimeSlots],
                        }))
                      }
                      disabled={!newAvailability.date}
                    >
                      Full Day Availability
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 bg-green-200 text-green-800 rounded hover:bg-green-300 transition-colors"
                      onClick={() => {
                        // Add full week availability (Mon–Sun) for selected slots
                        if (newAvailability.slots.length === 0) {
                          toast.error("Select at least one time slot before adding week availability");
                          return;
                        }
                        const today = new Date(newAvailability.date);
                        const weekDays = Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(today);
                          d.setDate(today.getDate() + i);
                          return d.toISOString().split("T")[0];
                        });
                        setProfile((prev) => ({
                          ...prev,
                          availability: [
                            ...prev.availability,
                            ...weekDays.map((date) => ({
                              date,
                              slots: [...newAvailability.slots],
                            })),
                          ],
                        }));
                        setNewAvailability({ date: "", slots: [] });
                      }}
                      disabled={!newAvailability.date || newAvailability.slots.length === 0}
                    >
                      Full Week Availability
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addAvailability}
                    className="w-full mt-2 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                    disabled={!newAvailability.date || newAvailability.slots.length === 0}
                  >
                    Add Day to Availability
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LandscaperProfilePage;
