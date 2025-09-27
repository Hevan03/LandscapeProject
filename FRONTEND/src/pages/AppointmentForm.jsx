import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createAppointment, updateAppointment } from '../api/appointmentApi';

//libraries for the interactive map and calendar
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const AppointmentForm = ({ existingAppointment = null }) => {
  const isEditMode = !!existingAppointment;
  const { landscaperId: createModeLandscaperId } = useParams();
  const landscaperId = isEditMode ? existingAppointment.landscaper._id : createModeLandscaperId;

  const navigate = useNavigate();
  const [landscaper, setLandscaper] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // CHANGE 1: Add state for the contact number error
  const [contactError, setContactError] = useState('');

  // State for form fields
  const [formData, setFormData] = useState({
    contactNumber: existingAppointment?.contactNumber || '',
    customerAddress: existingAppointment?.customerAddress || { street: '', city: '', district: '' },
    siteAddress: existingAppointment?.siteAddress || { street: '', city: '', district: '' },
    appointmentDate: existingAppointment ? new Date(existingAppointment.appointmentDate) : null,
    timeSlot: existingAppointment?.timeSlot || '',
    siteArea: existingAppointment?.siteArea || '',
    siteImages: null,
    sitePlan: null,
  });

  // State for the Google Map marker
  const [markerPosition, setMarkerPosition] = useState(
    existingAppointment?.siteLocation || { lat: 7.2906, lng: 80.6337 } 
  );

  // Hook to load the Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // api key
  });

  // Effect to fetch the logged-in customer's data
  useEffect(() => {
    const loggedInCustomerId = '68cde49582b5164ab85a89da'; 
    if (!isEditMode) {
      axios.get(`http://localhost:5001/api/customer/${loggedInCustomerId}`)
        .then(res => setCurrentUser(res.data))
        .catch(err => console.error("Failed to fetch current user", err));
    }
  }, [isEditMode]);

  // Effect to fetch landscaper's availability
  useEffect(() => {
    if (landscaperId) {
      axios.get(`http://localhost:5001/api/landscaper/${landscaperId}`)
        .then(res => setLandscaper(res.data))
        .catch(err => console.error("Failed to fetch landscaper", err));
    }
  }, [landscaperId]);

  // Pre-populate time slots on initial load in edit mode
  useEffect(() => {
    if (isEditMode && landscaper && formData.appointmentDate) {
      handleDateChange(formData.appointmentDate, true);
    }
  }, [isEditMode, landscaper, formData.appointmentDate]);
  
  // Memoize available dates to prevent unnecessary recalculations
  const availableDates = useMemo(() => {
    if (!landscaper?.availability) return [];
    return landscaper.availability.map(avail => new Date(avail.date));
  }, [landscaper]);

  // CHANGE 2: Create a specific handler for the contact number
  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 characters
    if (/^\d*$/.test(value) && value.length <= 10) {
      setFormData(prev => ({ ...prev, contactNumber: value }));
      
      // Check for length and set error message
      if (value.length > 0 && value.length < 10) {
        setContactError('Contact number must be 10 digits.');
      } else {
        setContactError(''); // Clear error if valid
      }
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddressChange = (e, type) => setFormData(prev => ({ ...prev, [type]: { ...prev[type], [e.target.name]: e.target.value }}));
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'siteImages' && files.length > 5) {
      alert('You can only upload a maximum of 5 images.');
      e.target.value = null; 
      return;
    }
    setFormData(prev => ({ ...prev, [name]: files }));
  };
  
  const handleDateChange = (date, isInitialLoad = false) => {
    const newTimeSlot = isInitialLoad ? formData.timeSlot : '';
    setFormData(prev => ({ ...prev, appointmentDate: date, timeSlot: newTimeSlot }));
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const dayAvailability = landscaper?.availability.find(a => {
        const dbDate = new Date(a.date);
        const dbDateString = new Date(dbDate.getFullYear(), dbDate.getMonth(), dbDate.getDate()).toISOString().split('T')[0];
        return dbDateString === selectedDateString;
    });
    setAvailableSlots(dayAvailability ? dayAvailability.slots : []);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // CHANGE 3: Prevent form submission if the contact number is invalid
    if (formData.contactNumber.length !== 10) {
      setContactError('Contact number must be exactly 10 digits.');
      return;
    }

    const submissionData = new FormData();
    const customerId = isEditMode ? existingAppointment.customer._id : currentUser?._id;
    if (!customerId) {
        alert("Could not identify the current user. Please try again.");
        return;
    }

    submissionData.append('customer', customerId);
    submissionData.append('landscaper', landscaperId);
    submissionData.append('appointmentDate', formData.appointmentDate.toISOString());
    submissionData.append('customerAddress', JSON.stringify(formData.customerAddress));
    submissionData.append('siteAddress', JSON.stringify(formData.siteAddress));
    submissionData.append('siteLocation', JSON.stringify(markerPosition));
    Object.keys(formData).forEach(key => { if (typeof formData[key] === 'string') { submissionData.append(key, formData[key]); }});
    if (formData.siteImages) { Array.from(formData.siteImages).forEach(file => submissionData.append('siteImages', file)); }
    if (formData.sitePlan) { submissionData.append('sitePlan', formData.sitePlan[0]); }
    
    try {
      if (isEditMode) {
        await updateAppointment(existingAppointment._id, submissionData);
        alert('Appointment Updated Successfully!');
        navigate('/customerdashboard');
      } else {
        await createAppointment(submissionData);
        alert('Booking Successful!');
        navigate('/payment');
      }
    } catch (error) {
      console.error('Submission failed', error);
      alert('Submission Failed. Please check all fields and try again.');
    }
  };

  if (!landscaper || (!isEditMode && !currentUser)) {
    return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  const customerName = isEditMode ? existingAppointment.customer.name : currentUser?.name;

  return (
    <div className="bg-gray-100 p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center text-green-700">{isEditMode ? 'Edit Your Appointment' : 'Book an Appointment'}</h1>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-600">with {landscaper.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" value={customerName || ''} placeholder="Loading customer..." disabled className="input input-bordered w-full" />
            {/* CHANGE 4: Update the contact number input and add error display */}
            <div className="form-control">
              <input 
                type="tel" // Use type="tel" for contact numbers
                name="contactNumber" 
                value={formData.contactNumber} 
                placeholder="Contact Number (10 digits)" 
                onChange={handleContactNumberChange} 
                required 
                className={`input input-bordered w-full ${contactError ? 'input-error' : ''}`}
                maxLength="10" // Add maxLength attribute
              />
              {contactError && <label className="label"><span className="label-text-alt text-red-500">{contactError}</span></label>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-semibold">Customer Address</h3>
              <input type="text" name="street" value={formData.customerAddress.street} placeholder="No & Street" onChange={(e) => handleAddressChange(e, 'customerAddress')} className="input input-bordered w-full" required/>
              <input type="text" name="city" value={formData.customerAddress.city} placeholder="City" onChange={(e) => handleAddressChange(e, 'customerAddress')} className="input input-bordered w-full" required/>
              <input type="text" name="district" value={formData.customerAddress.district} placeholder="District" onChange={(e) => handleAddressChange(e, 'customerAddress')} className="input input-bordered w-full" required/>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Landscape Site Address</h3>
               <input type="text" name="street" value={formData.siteAddress.street} placeholder="No & Street" onChange={(e) => handleAddressChange(e, 'siteAddress')} className="input input-bordered w-full" required/>
               <input type="text" name="city" value={formData.siteAddress.city} placeholder="City" onChange={(e) => handleAddressChange(e, 'siteAddress')} className="input input-bordered w-full" required/>
               <input type="text" name="district" value={formData.siteAddress.district} placeholder="District" onChange={(e) => handleAddressChange(e, 'siteAddress')} className="input input-bordered w-full" required/>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="form-control">
              <label className="label"><span className="label-text">Select Date</span></label>
              <DatePicker 
                selected={formData.appointmentDate} 
                onChange={handleDateChange} 
                minDate={new Date()}
                includeDates={availableDates}
                placeholderText="Select an available date"
                className="input input-bordered w-full" 
                dateFormat="yyyy-MM-dd" 
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Select Time Slot</span></label>
              <select name="timeSlot" onChange={handleChange} value={formData.timeSlot} disabled={!formData.appointmentDate || availableSlots.length === 0} className="select select-bordered w-full" required>
                <option value="" disabled>{formData.appointmentDate ? (availableSlots.length > 0 ? "Select a time" : "No slots on this day") : "Select a date first"}</option>
                {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-control">
            <label className="label font-semibold">Site Location (Drag marker)</label>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ height: '300px', width: '100%' }}
                center={markerPosition}
                zoom={10}
              >
                <Marker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={(e) => setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                />
              </GoogleMap>
            ) : <div>Loading Map...</div>}
          </div>
          <input type="text" name="siteArea" value={formData.siteArea} placeholder="Area of the site (e.g., 1500 sq ft)" onChange={handleChange} className="input input-bordered w-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="form-control">
                <label className="label">Images of the site (Max 5)</label>
                <input type="file" name="siteImages" multiple onChange={handleFileChange} className="file-input file-input-bordered w-full" accept="image/jpeg, image/png, image/gif, image/webp"/>
             </div>
             <div className="form-control">
                <label className="label">Plan of the site (if any)</label>
                <input type="file" name="sitePlan" onChange={handleFileChange} className="file-input file-input-bordered w-full" accept="application/pdf" />
             </div>
          </div>

          <button type="submit" className="btn btn-primary bg-green-600 hover:bg-green-800 text-white w-full text-lg">{isEditMode ? 'Update Appointment' : 'Book Now & Proceed to Payment'}</button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;