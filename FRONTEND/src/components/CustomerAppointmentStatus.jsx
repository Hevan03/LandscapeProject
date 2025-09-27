import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

// accepts `customerId` as a prop
const CustomerAppointmentStatus = ({ customerId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) {
        setLoading(false);
        return;
    }

    const fetchAppointments = async () => {
      try {
        //dynamic `customerId` from props in the API call
        const { data } = await axios.get(`http://localhost:5001/api/appointments/customer/${customerId}`);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch customer appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [customerId]); //The effect depends on the customerId prop
  
  const getStatusColor = (status) => {
    switch(status) {
        case 'Confirmed': return 'badge-info';
        case 'In Progress': return 'badge-warning';
        case 'Completed': return 'badge-success';
        case 'Cancelled': return 'badge-error';
        default: return 'badge-ghost';
    }
  }

  if (loading) return <p>Loading appointment status...</p>;
  

  if (appointments.length === 0) return null;

  return (
    <div className="mb-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">My Appointment Status</h2>
        <div className="space-y-4">
            {appointments.slice(0, 3).map(app => (
                <div key={app._id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold">With: {app.landscaper.name}</p>
                        <p className="text-sm text-gray-500">Date: {format(new Date(app.appointmentDate), 'yyyy-MM-dd')}</p>
                    </div>
                    <div className={`badge ${getStatusColor(app.status)} text-white`}>{app.status}</div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default CustomerAppointmentStatus;