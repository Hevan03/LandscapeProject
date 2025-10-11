import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
//import { useAuth } from '../context/AuthContext';
import AuthContext from "../../context/AuthContext";
import toast from "react-hot-toast";

const MaintenancePage = () => {
  const user = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: "Lawn Maintenance",
    availableTimes: {
      monday: { from: "09:00", to: "17:00", available: true },
      tuesday: { from: "09:00", to: "17:00", available: true },
      wednesday: { from: "09:00", to: "17:00", available: true },
      thursday: { from: "09:00", to: "17:00", available: true },
      friday: { from: "09:00", to: "17:00", available: true },
      saturday: { from: "10:00", to: "15:00", available: false },
      sunday: { from: "10:00", to: "15:00", available: false },
    },
    skills: ["Lawn Mowing", "Garden Maintenance", "Hedge Trimming"],
  });

  const [tasks, setTasks] = useState([
    {
      id: 1,
      customerId: "CUST000123",
      customerName: "John Doe",
      taskType: "Lawn Maintenance",
      status: "pending",
      scheduledDate: "2025-09-25",
      scheduledTime: "10:00 - 12:00",
      address: "123 Garden Avenue",
      description: "Weekly lawn mowing and edge trimming",
      priority: "medium",
    },
    {
      id: 2,
      customerId: "CUST000456",
      customerName: "Jane Smith",
      taskType: "Garden Design",
      status: "in-progress",
      scheduledDate: "2025-09-26",
      scheduledTime: "14:00 - 16:00",
      address: "456 Flower Street",
      description: "Plant new flowers in the front garden",
      priority: "high",
    },
    {
      id: 3,
      customerId: "CUST000789",
      customerName: "Robert Johnson",
      taskType: "Tree Services",
      status: "completed",
      scheduledDate: "2025-09-23",
      scheduledTime: "09:00 - 11:00",
      address: "789 Oak Road",
      description: "Trim branches hanging over the driveway",
      priority: "high",
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleAvailabilityChange = (day, field, value) => {
    setProfile({
      ...profile,
      availableTimes: {
        ...profile.availableTimes,
        [day]: {
          ...profile.availableTimes[day],
          [field]: field === "available" ? !profile.availableTimes[day].available : value,
        },
      },
    });
  };

  const handleSkillChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setProfile({
        ...profile,
        skills: [...profile.skills, value],
      });
    } else {
      setProfile({
        ...profile,
        skills: profile.skills.filter((skill) => skill !== value),
      });
    }
  };

  const handleUpdateProfile = () => {
    // In a real app, you would send this to your backend
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    toast.success(`Task status updated to ${newStatus}`);
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-center mb-8">Maintenance Staff Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <h2 className="text-xl font-bold text-white">Staff Profile</h2>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <form>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                        <select
                          name="specialization"
                          value={profile.specialization}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="Lawn Maintenance">Lawn Maintenance</option>
                          <option value="Garden Design">Garden Design</option>
                          <option value="Tree Services">Tree Services</option>
                          <option value="Irrigation">Irrigation</option>
                          <option value="Landscaping">Landscaping</option>
                          <option value="Pest Control">Pest Control</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                        <div className="space-y-2">
                          <div>
                            <input
                              type="checkbox"
                              id="skill1"
                              value="Lawn Mowing"
                              checked={profile.skills.includes("Lawn Mowing")}
                              onChange={handleSkillChange}
                              className="mr-2"
                            />
                            <label htmlFor="skill1">Lawn Mowing</label>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              id="skill2"
                              value="Garden Maintenance"
                              checked={profile.skills.includes("Garden Maintenance")}
                              onChange={handleSkillChange}
                              className="mr-2"
                            />
                            <label htmlFor="skill2">Garden Maintenance</label>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              id="skill3"
                              value="Hedge Trimming"
                              checked={profile.skills.includes("Hedge Trimming")}
                              onChange={handleSkillChange}
                              className="mr-2"
                            />
                            <label htmlFor="skill3">Hedge Trimming</label>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              id="skill4"
                              value="Irrigation Installation"
                              checked={profile.skills.includes("Irrigation Installation")}
                              onChange={handleSkillChange}
                              className="mr-2"
                            />
                            <label htmlFor="skill4">Irrigation Installation</label>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              id="skill5"
                              value="Tree Trimming"
                              checked={profile.skills.includes("Tree Trimming")}
                              onChange={handleSkillChange}
                              className="mr-2"
                            />
                            <label htmlFor="skill5">Tree Trimming</label>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                        <div className="space-y-4">
                          {Object.entries(profile.availableTimes).map(([day, times]) => (
                            <div key={day} className="flex items-center">
                              <div className="w-1/3 capitalize">{day}</div>
                              <div className="w-2/3 flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={times.available}
                                  onChange={() => handleAvailabilityChange(day, "available")}
                                  className="mr-2"
                                />
                                <input
                                  type="time"
                                  value={times.from}
                                  onChange={(e) => handleAvailabilityChange(day, "from", e.target.value)}
                                  disabled={!times.available}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                                />
                                <span>to</span>
                                <input
                                  type="time"
                                  value={times.to}
                                  onChange={(e) => handleAvailabilityChange(day, "to", e.target.value)}
                                  disabled={!times.available}
                                  className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateProfile}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-lg font-medium">{profile.name}</h3>
                        <p className="text-gray-600">{profile.email}</p>
                        <p className="text-gray-600">{profile.phone}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium mb-1">Specialization</h4>
                        <p>{profile.specialization}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium mb-1">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Availability</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(profile.availableTimes).map(([day, times]) => (
                            <div key={day} className="flex">
                              <div className="w-1/3 capitalize">{day}</div>
                              <div className="w-2/3">
                                {times.available ? (
                                  <span>
                                    {times.from} - {times.to}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Not available</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6">
                        <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <h2 className="text-xl font-bold text-white">Assigned Tasks</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{task.taskType}</h3>
                            <p className="text-sm text-gray-600">Customer: {task.customerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                        </div>
                        <div className="mb-2">
                          <div className="text-sm">
                            <span className="text-gray-600">Date: </span>
                            {task.scheduledDate}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Time: </span>
                            {task.scheduledTime}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Address: </span>
                            {task.address}
                          </div>
                        </div>
                        <div className="text-sm mb-3">
                          <p className="text-gray-800">{task.description}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <button onClick={() => handleViewTaskDetails(task)} className="text-green-600 hover:text-green-800 text-sm">
                            View Details
                          </button>
                          <div className="flex space-x-2">
                            {task.status !== "in-progress" && task.status !== "cancelled" && (
                              <button
                                onClick={() => handleTaskStatusChange(task.id, "in-progress")}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                              >
                                Start Task
                              </button>
                            )}
                            {task.status === "in-progress" && (
                              <button
                                onClick={() => handleTaskStatusChange(task.id, "completed")}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">{selectedTask.taskType} Task Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Customer:</span> {selectedTask.customerName}
              </div>
              <div>
                <span className="font-medium">Customer ID:</span> {selectedTask.customerId}
              </div>
              <div>
                <span className="font-medium">Date:</span> {selectedTask.scheduledDate}
              </div>
              <div>
                <span className="font-medium">Time:</span> {selectedTask.scheduledTime}
              </div>
              <div>
                <span className="font-medium">Address:</span> {selectedTask.address}
              </div>
              <div>
                <span className="font-medium">Description:</span> {selectedTask.description}
              </div>
              <div>
                <span className="font-medium">Priority:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedTask.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : selectedTask.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedTask.status)}`}>{selectedTask.status}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setSelectedTask(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Close
              </button>
              {selectedTask.status === "pending" && (
                <button
                  onClick={() => {
                    handleTaskStatusChange(selectedTask.id, "in-progress");
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Start Task
                </button>
              )}
              {selectedTask.status === "in-progress" && (
                <button
                  onClick={() => {
                    handleTaskStatusChange(selectedTask.id, "completed");
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
