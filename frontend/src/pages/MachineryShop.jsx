import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../component/Navbar'; 
import MachineryCard from './MachineryCard';
import MachineryDetailModal from './MachineryDetailModal';

function MachineryShop() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5001/api/machinery/machines');
        setMachines(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load machinery list.');
      }
    };
    fetchMachines();
  }, []);

  const handleSeeMore = (machine) => {
    setSelectedMachine(machine);
  };

  const handleCloseModal = () => {
    setSelectedMachine(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading machinery...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-600">
        Error loading machinery: {error}
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Available Machinery for Rent</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {machines.length > 0 ? (
            machines.map((machine) => (
              <MachineryCard
                key={machine._id}
                machine={machine}
                onSeeMore={() => handleSeeMore(machine)}
              />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">No machinery is currently available.</p>
          )}
        </div>
      </div>
      {selectedMachine && (
        <MachineryDetailModal
          machine={selectedMachine}
          onClose={handleCloseModal}
        />
      )}
      <Toaster />
    </div>
  );
}

export default MachineryShop;