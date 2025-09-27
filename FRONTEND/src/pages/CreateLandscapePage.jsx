import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createLandscape } from '../api/landscapeApi';

const CreateLandscapePage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [landscaper, setLandscaper] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerId: '',
    totalCost: '',
    projectImages: null,
    sitePlan: null,
    quotation: null,
  });

  const loggedInLandscaperId = '68ccee4973939e3301c5a23d';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const landscaperRes = await axios.get(`http://localhost:5001/api/landscaper/${loggedInLandscaperId}`);
        setLandscaper(landscaperRes.data);
        const customersRes = await axios.get('http://localhost:5001/api/customer');
        setCustomers(customersRes.data);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchData();
  }, [loggedInLandscaperId]);

  // CHANGE 1: Modify the handleChange function to prevent negative costs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Add a special check for the totalCost field
    if (name === 'totalCost') {
      // If the value is negative, do not update the state.
      // The Number() conversion handles empty strings correctly.
      if (Number(value) < 0) {
        return; 
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'projectImages' && files.length > 10) {
      alert('You can only upload a maximum of 10 images.');
      e.target.value = null;
      return;
    }
    setFormData({ ...formData, [name]: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.totalCost) {
      alert('Please select a customer and enter the total cost.');
      return;
    }

    const submissionData = new FormData();
    
    submissionData.append('name', formData.name);
    submissionData.append('description', formData.description);
    submissionData.append('customerId', formData.customerId);
    submissionData.append('landscaperId', loggedInLandscaperId);
    submissionData.append('totalCost', formData.totalCost);

    if (formData.projectImages) {
      Array.from(formData.projectImages).forEach(file => {
        submissionData.append('projectImages', file);
      });
    }
    if (formData.sitePlan) {
      submissionData.append('sitePlan', formData.sitePlan[0]);
    }
    if (formData.quotation) {
      submissionData.append('quotation', formData.quotation[0]);
    }
    
    try {
      await createLandscape(submissionData);
      alert('Project created successfully!');
      navigate('/landscaper/home');
    } catch (error) {
      console.error('Failed to create project', error);
      alert('Failed to create project. Please try again.');
    }
  };

  if (!landscaper || customers.length === 0) {
    return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="bg-gray-100 p-4 md:p-10">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-700">Create New Landscape Project</h1>
        <h2 className="text-lg font-semibold mb-6 text-center text-gray-500">For: {landscaper.name}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label"><span className="label-text">Project Name</span></label>
            <input type="text" name="name" onChange={handleChange} placeholder="e.g., Modern Garden Overhaul" className="input input-bordered" required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Select Customer</span></label>
            <select name="customerId" onChange={handleChange} className="select select-bordered" required defaultValue="">
              <option value="" disabled>-- Choose a customer --</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea name="description" onChange={handleChange} className="textarea textarea-bordered h-24" placeholder="Briefly describe the project goals..."></textarea>
          </div>
          
          <div className="form-control">
            <label className="label"><span className="label-text">Total Cost (LKR)</span></label>
            <input 
              type="number" 
              name="totalCost"
              value={formData.totalCost} // Ensure value is controlled
              onChange={handleChange} 
              placeholder="e.g., 150000" 
              className="input input-bordered" 
              required
              min="0" // CHANGE 2: Add min attribute to the input
            />
          </div>
          
          <div className="form-control">
            <label className="label">Quotation (PDF Only)</label>
            <input 
              type="file" 
              name="quotation" 
              onChange={handleFileChange} 
              className="file-input file-input-bordered" 
              accept="application/pdf"
            />
          </div>

          <div className="form-control">
            <label className="label">Project Images (Max 10)</label>
            <input type="file" name="projectImages" multiple onChange={handleFileChange} className="file-input file-input-bordered" accept="image/*"/>
          </div>

          <div className="form-control">
            <label className="label">Site Plan (PDF Only)</label>
            <input type="file" name="sitePlan" onChange={handleFileChange} className="file-input file-input-bordered" accept="application/pdf" />
          </div>

          <button type="submit" className="btn btn-primary bg-green-600 hover:bg-green-800 text-white w-full text-lg">Create Project</button>
        </form>
      </div>
    </div>
  );
};

export default CreateLandscapePage;