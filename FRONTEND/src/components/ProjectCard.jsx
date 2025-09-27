import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { toast } from 'react-hot-toast';
import { Download, UploadCloud, AlertTriangle } from 'lucide-react';
import { uploadBlueprint } from '../api/landscapeApi'; 

const ProjectCard = ({ project, onStatusUpdate }) => {
  const navigate = useNavigate();
  const [blueprintFile, setBlueprintFile] = useState(null); 

  // FOR BLUEPRINT UPLOAD 
  const handleFileChange = (e) => {
      setBlueprintFile(e.target.files[0]);
  };

  const handleBlueprintUpload = async () => {
      if (!blueprintFile) {
          toast.error("Please select a blueprint file to upload.");
          return;
      }
      const formData = new FormData();
      formData.append('blueprintFile', blueprintFile); 

      const toastId = toast.loading('Uploading blueprint...');
      try {
          await uploadBlueprint(project._id, formData);
          toast.success('Blueprint uploaded successfully!', { id: toastId });
      } catch (error) {
          toast.error('Failed to upload blueprint.', { id: toastId });
      }
  };
  

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const PlaceholderImage = () => (
    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">No Images Available</p>
    </div>
  );
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  };

  return (
    <div className="card bg-base-100 shadow-xl border overflow-hidden">
      
      {project.projectImages && project.projectImages.length > 0 ? (
        <Slider {...sliderSettings}>
          {project.projectImages.map((image, index) => (
            <div key={index}>
              <img 
                src={`http://localhost:5001/${image}`} 
                alt={`Project ${index + 1}`} 
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </Slider>
      ) : (
        <PlaceholderImage />
      )}
      
      <div className="card-body">
        <h2 className="card-title">{project.name}</h2>
        <p className="text-sm text-gray-500">For: {project.customerId?.name || 'N/A'}</p>
        <p className="text-lg font-semibold text-green-600 mt-2">
            Total Cost: {formatCurrency(project.totalCost)}
        </p>
        <p className="mt-2 text-gray-600">{project.description}</p>
        
        
        {project.blueprintRequested && !project.blueprintFile && (
            <div className="p-4 bg-amber-100 border-l-4 border-amber-500 text-amber-700 mt-4 rounded-md">
                <div className="flex items-center">
                    <AlertTriangle size={20} className="mr-3" />
                    <p className="font-bold">Customer has requested a blueprint.</p>
                </div>
                <div className="mt-3">
                    <input type="file" onChange={handleFileChange} className="file-input file-input-bordered file-input-sm w-full" accept="application/pdf" />
                    <button onClick={handleBlueprintUpload} className="btn btn-sm btn-primary w-full mt-2">
                        <UploadCloud size={16} className="mr-2"/> Upload Blueprint
                    </button>
                </div>
            </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 mt-4">
            {project.sitePlan && (
                <a href={`http://localhost:5001/${project.sitePlan}`} download className="btn btn-sm btn-outline btn-info">
                    <Download size={16} className="mr-2"/> Site Plan
                </a>
            )}
            {project.quotation && (
                <a href={`http://localhost:5001/${project.quotation}`} download className="btn btn-sm btn-outline btn-info">
                    <Download size={16} className="mr-2"/> Quotation
                </a>
            )}
        </div>

        <div className="form-control w-full mt-4">
          <label className="label"><span className="label-text">Update Status</span></label>
          <select 
            className="select select-bordered"
            value={project.status}
            onChange={(e) => onStatusUpdate(project._id, e.target.value)}
          >
            <option>Advance Payment Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="card-actions justify-end mt-4">
         <button 
          onClick={() => navigate(`/addprogress/${project._id}`)}
          className="btn btn-outline btn-success"
        >
          View Progress
        </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;