import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerProjectCard from '../components/CustomerProjectCard';

const CustomerProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real app, this would come from your authentication context
  const loggedInCustomerId = '68cde49582b5164ab85a89da';

  // Function to re-fetch projects, can be passed to child components
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5001/api/landscape/customer/${loggedInCustomerId}`);
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch customer projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My Landscape Projects</h1>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <CustomerProjectCard 
                key={project._id} 
                project={project}
                onUpdate={fetchProjects} // Pass the fetch function so cards can trigger a refresh
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">You do not have any active projects yet.</p>
      )}
    </div>
  );
};

export default CustomerProjectsPage;