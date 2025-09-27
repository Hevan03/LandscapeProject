import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CustomerAppointmentStatus from '../components/CustomerAppointmentStatus';

const LandscaperCard = ({ landscaper }) => {
  const navigate = useNavigate();
  return (
    <div className="card w-96 bg-base-100 shadow-xl border">
      <div className="card-body">
        <h2 className="card-title text-2xl text-green-700">{landscaper.name}</h2>
        <p className="text-gray-600">Contact: {landscaper.contact}</p>
        <div className="my-2">
          <h3 className="font-semibold">Specialties:</h3>
          <div className="flex flex-wrap gap-2 mt-1">
             {Array.isArray(landscaper.specialties) && landscaper.specialties.map((specialty, index) => (
              <div key={index} className="badge badge-outline badge-success">{specialty}</div>
            ))}
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button onClick={() => navigate(`/book/${landscaper._id}`)} className="btn bg-green-600 hover:bg-green-700 text-white">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const [landscapers, setLandscapers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  const loggedInCustomerId = '68cde49582b5164ab85a89da'; // Replace with actual logged-in customer ID retrieval logic

  useEffect(() => {
    // Fetch the essential customer data first
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/customer/${loggedInCustomerId}`);
        setCustomer(res.data);
      } catch (error) {
        console.error("Failed to fetch customer data", error);
      }
    };

    // Fetch the list of all landscapers
    const fetchLandscapers = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/landscaper');
        setLandscapers(res.data);
      } catch (error) {
        console.error("Failed to fetch landscapers", error);
      }
    };

    // Run both fetches and update the loading state when they are all complete
    const fetchAllData = async () => {
      await Promise.all([fetchCustomer(), fetchLandscapers()]);
      setLoading(false);
    };

    fetchAllData();
  }, [loggedInCustomerId]);

  if (loading) {
    return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (!customer) {
    return <div className="text-center p-10 text-red-500">Could not load your customer data. Please check the ID and ensure the server is running.</div>;
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome, {customer.name}!</h1>
          <p className="mt-1 text-lg text-gray-600">Here's a look at your recent activity.</p>
          <button 
            onClick={() => navigate('/customer/my-projects')}
            className="btn btn-primary"
          >
            Your Projects
          </button>
      </div>

      <CustomerAppointmentStatus customerId={loggedInCustomerId} />
      
      <div className="divider my-10"></div>

      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Book a Professional</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {landscapers.map((landscaper) => (
          <LandscaperCard key={landscaper._id} landscaper={landscaper} />
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;