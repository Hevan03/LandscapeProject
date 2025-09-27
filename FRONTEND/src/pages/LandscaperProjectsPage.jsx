import React, { useState, useEffect } from 'react';
import { getLandscapesForLandscaper } from '../api/landscapeApi';
import ProjectCard from '../components/ProjectCard';
import axios from 'axios';
import { Search } from 'lucide-react';

const LandscaperProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loggedInLandscaperId = '68ccee4973939e3301c5a23d';

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLandscapesForLandscaper(loggedInLandscaperId);
      console.log('Fetched Projects Data:', data);
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError('Could not load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const projectToUpdate = projects.find(p => p._id === projectId);
      await axios.put(`http://localhost:5001/api/landscape/${projectId}`, {
        ...projectToUpdate,
        status: newStatus
      });
      fetchProjects();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };
  
  const filteredProjects = projects.filter(project => {
    return project.name && project.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">My Projects</h1>
      
      {projects.length > 0 && (
        <div className="mb-8 max-w-lg mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search by project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}
      
      {projects.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-500">You haven't created any projects yet.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-500">No projects found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LandscaperProjectsPage;