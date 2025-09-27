import React, { useState } from 'react';

const ApplicationPage = () => {
  const [formData, setFormData] = useState({
    Employee_Name: '',
    Employee_Email: '',
    Employee_Contact_Num: '',
    Employee_Adress: '', // Fixed typo to match backend
    Employee_Type: '',
    Avilability: '', // Fixed typo to match backend  
    License_Num: '',
    Employee_CV: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    const submitData = new FormData();
    
    // Generate unique Service_Num (timestamp + random number)
    const serviceNum = Date.now() + Math.floor(Math.random() * 1000);
    submitData.append('Service_Num', serviceNum);
    
    // Add Created_By field (could be 'System' or user input)
    submitData.append('Created_By', 'Online Application');
    
    Object.keys(formData).forEach(key => {
      if (key === 'Employee_CV' && formData[key]) {
        submitData.append('cv', formData[key]);
      } else if (key !== 'Employee_CV') {
        submitData.append(key, formData[key]);
      }
    });

    try {
      console.log('Submitting application data:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        body: submitData,
      });
      
      if (response.ok) {
        setMessage('✅ Application submitted successfully! Your application is now under admin review.');
        setFormData({
          Employee_Name: '',
          Employee_Email: '',
          Employee_Contact_Num: '',
          Employee_Adress: '',
          Employee_Type: '',
          Avilability: '',
          License_Num: '',
          Employee_CV: null
        });
      } else {
        const errorData = await response.json();
        console.error('Application submission error:', errorData);
        setMessage(`❌ ${errorData.message || 'Failed to submit application. Please check all required fields.'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-page">
      <div className="container">
        <div className="application-form-wrapper">
          <h1 className="form-title">Job Application</h1>
          <p className="form-subtitle">Join our landscaping team</p>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="simple-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h2 className="section-title">Personal Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Employee_Name">Full Name *</label>
                  <input
                    type="text"
                    id="Employee_Name"
                    name="Employee_Name"
                    value={formData.Employee_Name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Employee_Email">Email Address *</label>
                  <input
                    type="email"
                    id="Employee_Email"
                    name="Employee_Email"
                    value={formData.Employee_Email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Employee_Contact_Num">Phone Number *</label>
                  <input
                    type="tel"
                    id="Employee_Contact_Num"
                    name="Employee_Contact_Num"
                    value={formData.Employee_Contact_Num}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Employee_Adress">Address *</label>
                  <textarea
                    id="Employee_Adress"
                    name="Employee_Adress"
                    value={formData.Employee_Adress}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                  />
                </div>
              </div>


            </div>

            {/* Job Details Section */}
            <div className="form-section">
              <h2 className="section-title">Job Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Employee_Type">Position *</label>
                  <select
                    id="Employee_Type"
                    name="Employee_Type"
                    value={formData.Employee_Type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="General Employee">General Employee</option>
                    <option value="Landscaper">Landscaper</option>
                    <option value="Driver">Driver</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="Avilability">Availability *</label>
                  <select
                    id="Avilability"
                    name="Avilability"
                    value={formData.Avilability}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Availability</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              {formData.Employee_Type === 'Driver' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="License_Num">Driver's License Number *</label>
                    <input
                      type="text"
                      id="License_Num"
                      name="License_Num"
                      value={formData.License_Num}
                      onChange={handleChange}
                      placeholder="Enter your license number"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Employee_CV">Upload Resume (Optional)</label>
                  <input
                    type="file"
                    id="Employee_CV"
                    name="Employee_CV"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
                    className="file-input"
                  />
                  <p className="help-text">PDF, DOC, or DOCX format. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting...' : '📝 Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;