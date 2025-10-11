import React from 'react';
import { format } from 'date-fns';

const AppointmentDetailsModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  const renderAddress = (address) => `${address.street}, ${address.city}, ${address.district}`;
  
  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-2xl mb-4">Appointment with {appointment.customer.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><strong>Date:</strong> {format(new Date(appointment.appointmentDate), 'yyyy-MM-dd')}</p>
            <p><strong>Time Slot:</strong> {appointment.timeSlot}</p>
            <p><strong>Contact:</strong> {appointment.contactNumber}</p>
            <p><strong>Status:</strong> <span className="badge badge-success text-white">{appointment.status}</span></p>
            <p className="md:col-span-2"><strong>Customer Address:</strong> {renderAddress(appointment.customerAddress)}</p>
            <p className="md:col-span-2"><strong>Site Address:</strong> {renderAddress(appointment.siteAddress)}</p>
            <p><strong>Site Area:</strong> {appointment.siteArea || 'N/A'}</p>
        </div>

        <div className="divider">Site Media</div>

        <div>
            <h4 className="font-semibold mb-2">Site Images:</h4>
            <div className="flex flex-wrap gap-4">
                {appointment.siteImages.length > 0 ? appointment.siteImages.map((img, index) => (
                    <a key={index} href={`http://localhost:5001/${img}`} download>
                        <img 
                            src={`http://localhost:5001/${img}`} 
                            alt={`Site ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-lg shadow cursor-pointer transition-transform duration-200 hover:scale-105"
                            title="Click to download"
                        />
                    </a>
                )) : <p>No images provided.</p>}
            </div>
        </div>

        <div className="mt-4">
            <h4 className="font-semibold mb-2">Site Plan:</h4>
            {appointment.sitePlan ? (
                
                <a 
                    href={`http://localhost:5001/${appointment.sitePlan}`} 
                    download
                    className="btn btn-outline btn-success"
                    // Open in new tab is a fallback if download isn't supported
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    Download Site Plan (PDF)
                </a>
            ) : <p>No plan provided.</p>}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;