import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgressById, updateProgress } from '../api/progressApi';
import toast from 'react-hot-toast';
import { User, TreePine, HardHat, Plus, Trash2, Upload } from 'lucide-react';

const UpdateProgressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for the form data
  const [postName, setPostName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [images, setImages] = useState([]);
  const [staticDetails, setStaticDetails] = useState(null);
  
  // State for managing UI
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const fileInputRefs = useRef([]);

  // Fetch existing post data on component mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getProgressById(id);
        setPostName(data.name);
        setDescription(data.description || '');
        setTasks(data.tasks);
        setImages(data.images.map(img => ({ path: img, file: null, preview: getImageUrl(img) })));
        setStaticDetails({
          landscapeName: data.landscapeId.name,
          customerName: data.customerId.name,
          landscaperName: data.landscaperId.name,
        });
      } catch (err) {
        toast.error('Failed to fetch post details.');
        navigate(`/landscaperprogress/${id}`); // Go back if fetch fails
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const getImageUrl = (imagePath) => `http://localhost:5001/${imagePath.replace(/\\/g, '/')}`;

  //Task Management Handlers
  const handleAddTask = () => {
    if (newTaskName.trim() === '') {
      toast.error('Task name cannot be empty.');
      return;
    }
    setTasks([...tasks, { name: newTaskName, completed: false }]);
    setNewTaskName(''); // Reset input
  };

  const handleDeleteTask = (indexToDelete) => {
    setTasks(tasks.filter((_, index) => index !== indexToDelete));
    toast.success('Task removed');
  };

  const handleToggleTask = (indexToToggle) => {
    const updatedTasks = tasks.map((task, index) => 
      index === indexToToggle ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  //  Image Management Handlers 
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedImages = [...images];
      updatedImages[index] = { 
        ...updatedImages[index], 
        file: file, 
        preview: URL.createObjectURL(file) 
      };
      setImages(updatedImages);
      toast.success('Image ready for update.');
    }
  };

  const triggerImageInput = (index) => {
    fileInputRefs.current[index].click();
  };

  //  Form Submission Handler 
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const updateData = {
      description,
      tasks,
      images: images.map(img => img.file).filter(file => file !== null), // Only send new files
    };

    try {
      await updateProgress(id, updateData);
      toast.success('Post updated successfully!');
      navigate(`/landscaperprogress/${id}`); // Navigate back to the detail page
    } catch (error) {
      toast.error('Failed to update post. Please try again.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading form...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-24 pb-12 px-4">
      <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        
        {/* --- Header --- */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">{postName}</h1>
          <p className="text-md text-gray-500 mt-1">Update the details for this progress post.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center"><TreePine size={16} className="mr-2 text-green-600" /><span>{staticDetails.landscapeName}</span></div>
            <div className="flex items-center"><User size={16} className="mr-2 text-green-600" /><span>{staticDetails.customerName}</span></div>
            <div className="flex items-center"><HardHat size={16} className="mr-2 text-green-600" /><span>{staticDetails.landscaperName}</span></div>
          </div>
        </div>

        {/* --- Description --- */}
        <div className="p-6">
          <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            placeholder="Provide a general summary of the progress..."
          ></textarea>
        </div>

        {/* --- Image Management --- */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Images</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Current Image</th>
                  <th className="py-2 px-4 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b"><img src={image.preview} alt={`Upload preview ${index + 1}`} className="w-24 h-24 object-cover rounded"/></td>
                    <td className="py-2 px-4 border-b text-center">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        ref={el => fileInputRefs.current[index] = el}
                        onChange={(e) => handleImageChange(e, index)} 
                      />
                      <button type="button" onClick={() => triggerImageInput(index)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center mx-auto">
                        <Upload size={16} className="mr-2"/> Replace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Task Management --- */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Tasks <span className="text-red-500">*</span></h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Task Name</th>
                  <th className="py-2 px-4 border-b text-center">Completed</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{task.name}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(index)} className="h-5 w-5 rounded text-green-600 focus:ring-green-500" />
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button type="button" onClick={() => handleDeleteTask(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center mt-4">
            <input 
              type="text" 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter new task name"
              className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-green-500"
            />
            <button type="button" onClick={handleAddTask} className="bg-gray-800 text-white p-2 rounded-r-md hover:bg-black flex items-center">
              <Plus size={20} className="mr-1"/> Add Task
            </button>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="p-6 bg-gray-50 border-t">
          <button 
            type="submit" 
            disabled={isUpdating}
            className="w-full py-3 px-4 bg-gray-800 text-white font-bold rounded-lg shadow-md hover:bg-black transition-colors disabled:bg-gray-400"
          >
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default UpdateProgressPage;
