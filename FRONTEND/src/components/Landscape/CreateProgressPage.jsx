import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProgress } from "../../api/progressApi";
import { getLandscapeById } from "../../api/landscapeApi";
import toast from "react-hot-toast";
import { User, TreePine, HardHat, Plus, Trash2 } from "lucide-react";

const CreateProgressPage = () => {
  // Get the specific landscape project ID from the URL
  const { landscapeId } = useParams();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [images, setImages] = useState(null);

  // UI State
  const [projectDetails, setProjectDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch project details automatically when the component loads
  useEffect(() => {
    if (landscapeId) {
      toast.promise(
        getLandscapeById(landscapeId).then((data) => {
          setProjectDetails({
            landscapeName: data.name,
            customerName: data.customerId.name,
            landscaperName: data.landscaperId.name,
          });
        }),
        {
          loading: "Loading project details...",
          success: "Project details loaded!",
          error: "Could not load project details.",
        }
      );
    }
  }, [landscapeId]);

  // --- Handlers for tasks and images (no changes needed here) ---
  const handleAddTask = () => {
    if (newTaskName.trim() === "") return;
    setTasks([...tasks, { name: newTaskName, completed: false }]);
    setNewTaskName("");
  };

  const handleDeleteTask = (indexToDelete) => {
    setTasks(tasks.filter((_, index) => index !== indexToDelete));
  };

  const handleToggleTask = (indexToToggle) => {
    const updatedTasks = tasks.map((task, index) =>
      index === indexToToggle ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files.length !== 5) {
      toast.error("You must select exactly 5 images.");
      e.target.value = null;
      setImages(null);
      setImagePreviews([]);
      return;
    }
    setImages(files);
    const previewUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImagePreviews(previewUrls);
  };

  // --- Updated Form Submission Handler ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !projectDetails || tasks.length === 0 || !images) {
      toast.error("Please fill out all required fields and upload 5 images.");
      return;
    }

    setIsSubmitting(true);
    // The landscapeId now comes directly from the URL params
    const progressData = { name, landscapeId, description, tasks, images };

    try {
      await createProgress(progressData);
      toast.success("Progress post created successfully!");
      // Navigate back to the progress feed for this specific project
      navigate(`/addprogress/${landscapeId}`);
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequiredLabel = ({ label }) => (
    <label className="block text-lg font-semibold text-gray-800 mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12 px-4">
      <form
        onSubmit={handleFormSubmit}
        className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Progress Post
          </h1>
          {/* Display the fetched project details automatically */}
          {projectDetails ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-green-50 p-4 rounded-md border border-green-200">
              <div className="flex items-center">
                <TreePine size={16} className="mr-2 text-green-700" />
                <span>{projectDetails.landscapeName}</span>
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-2 text-green-700" />
                <span>{projectDetails.customerName}</span>
              </div>
              <div className="flex items-center">
                <HardHat size={16} className="mr-2 text-green-700" />
                <span>{projectDetails.landscaperName}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              Loading project details...
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <RequiredLabel label="Post Name" />
          <input
            id="postName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Week 1 - Foundation Work"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* The manual Project ID input has been removed */}

        <div className="p-6 border-t">
          <label
            htmlFor="description"
            className="block text-lg font-semibold text-gray-800 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-green-500"
            placeholder="Provide a summary of the progress..."
          ></textarea>
        </div>

        <div className="p-6 border-t">
          <RequiredLabel label="Tasks Checklist" />
          <div className="space-y-3 mb-4">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(index)}
                    className="h-5 w-5 rounded text-green-600 focus:ring-green-500"
                  />
                  <span
                    className={`ml-3 ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.name}
                  </span>
                </div>
                <button type="button" onClick={() => handleDeleteTask(index)}>
                  <Trash2
                    size={20}
                    className="text-red-500 hover:text-red-700"
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter new task name"
              className="flex-grow p-2 border rounded-l-md focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="bg-gray-800 text-white p-2 rounded-r-md hover:bg-black"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 border-t">
          <RequiredLabel label="Upload Images (Exactly 5)" />
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            multiple
            accept="image/*"
            required
          />
          <div className="mt-4 grid grid-cols-5 gap-2">
            {imagePreviews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Creating Post..." : "Create Progress Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProgressPage;
