import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal'; 
import { Download} from 'lucide-react';
import { generateAppointmentsReport } from '../utils/reportGenerator';

const LandscaperAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loggedInLandscaperId = '68ccee4973939e3301c5a23d'; // Replace this code with actual auth logic

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5001/api/appointments/landscaper/${loggedInLandscaperId}`);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/appointments/${appointmentId}/status`, { status: newStatus });
      // Refresh the list
      fetchAppointments(); 
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

    const handleGenerateReport = () => {
    if (appointments.length === 0) {
        alert("No appointments to generate a report for.");
        return;
    }
    generateAppointmentsReport(appointments);
  };

  if (loading) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
       <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Appointments</h1>
        <button 
            onClick={handleGenerateReport}
            className="btn btn-primary"
        >
            <Download size={18} className="mr-2"/>
            Download Report
        </button>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Date & Time</th>
              <th>Site City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app) => (
              <tr key={app._id} className="hover">
                <td>{app.customer?.name || 'N/A'}</td>
                <td>
                  {app.appointmentDate ? format(new Date(app.appointmentDate), 'yyyy-MM-dd') : 'No Date'}
                  {' at '}
                  {app.timeSlot || 'N/A'}
                </td>
                <td>{app.siteAddress?.city || 'N/A'}</td>
                <td>
                  <select 
                    className="select select-bordered select-sm"
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  >
                    <option>Payment Pending</option>
                    <option>Confirmed</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline btn-success"
                    onClick={() => setSelectedAppointment(app)}
                  >
                    See More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal 
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default LandscaperAppointments;