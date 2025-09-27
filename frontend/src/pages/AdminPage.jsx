import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../api';
import AdminHeader from '../components/AdminHeader';

function AdminPage() {
  const [applications, setApplications] = useState([]);
  const [approvedEmployees, setApprovedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeView, setActiveView] = useState('all');
  const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'approved'
  const [approvedEmployeeFilter, setApprovedEmployeeFilter] = useState('all'); // 'all', 'landscaper', 'General Employee', 'driver'
  const [approvedBy, setApprovedBy] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await employeeAPI.getPendingApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedEmployees = async () => {
    try {
      const data = await employeeAPI.getApprovedEmployees();
      // Filter only approved employees
      const approved = data.filter(emp => emp.Employee_Status === 'Approve');
      setApprovedEmployees(approved);
    } catch (error) {
      console.error('Error fetching approved employees:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchApprovedEmployees();
  }, []);

  const handleApprove = (application) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
  };

  const handleReject = (application) => {
    setSelectedApplication(application);
    setShowRejectionModal(true);
  };

  const confirmApprove = async () => {
    if (!approvedBy.trim()) {
      alert('Please enter who approved this application');
      return;
    }

    setProcessing(true);
    try {
      await employeeAPI.approveEmployee(selectedApplication.Service_Num, approvedBy);
      await fetchApplications();
      await fetchApprovedEmployees(); // Refresh approved employees count
      setShowApprovalModal(false);
      setSelectedApplication(null);
      setApprovedBy('');
      alert('Application approved successfully! WhatsApp notification with login credentials sent to employee.');
    } catch (error) {
      console.error('Error approving application:', error);
      let errorMessage = 'Failed to approve application. ';
      if (error.message.includes('500')) {
        errorMessage += 'Server error - please check if backend is running and database is connected.';
      } else if (error.message.includes('404')) {
        errorMessage += 'Application not found or already processed.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    setProcessing(true);
    try {
      await employeeAPI.rejectEmployee(selectedApplication.Service_Num, rejectionNote);
      await fetchApplications();
      await fetchApprovedEmployees(); // Refresh approved employees count
      setShowRejectionModal(false);
      setSelectedApplication(null);
      setRejectionNote('');
      alert('Application rejected successfully! WhatsApp notification sent to employee.');
    } catch (error) {
      console.error('Error rejecting application:', error);
      let errorMessage = 'Failed to reject application. ';
      if (error.message.includes('500')) {
        errorMessage += 'Server error - please check if backend is running and database is connected.';
      } else if (error.message.includes('404')) {
        errorMessage += 'Application not found or already processed.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Filtered applications based on active view
  const filteredApplications = applications.filter(app => {
    if (activeView === 'all') return true;
    if (activeView === 'landscaper') return app.Employee_Type === 'Landscaper';
    if (activeView === 'general employee') return app.Employee_Type === 'General Employee';
    if (activeView === 'driver') return app.Employee_Type === 'Driver';
    return true;
  });

  const sidebarItems = [
    { id: 'all', label: 'Pending Applications', icon: '📋', count: applications.length, type: 'pending' },
    { id: 'landscaper', label: 'Pending Landscapers', icon: '🌳', count: applications.filter(app => app.Employee_Type === 'Landscaper').length, type: 'pending' },
    { id: 'general employee', label: 'Pending General Employees', icon: '🌱', count: applications.filter(app => app.Employee_Type === 'General Employee').length, type: 'pending' },
    { id: 'driver', label: 'Pending Drivers', icon: '🚗', count: applications.filter(app => app.Employee_Type === 'Driver').length, type: 'pending' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8FFD7 0%, #93DA97 50%, #5E936C 100%)',
      color: '#3E5F44'
    }}>
      {/* Admin Header Component */}
      <AdminHeader />

      {/* Main Content with Sidebar */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(147, 218, 151, 0.3)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#3E5F44',
            marginBottom: '24px'
          }}>Employee Management</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setViewMode('pending');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: (viewMode === 'pending' && activeView === item.id) ? 'rgba(62, 95, 68, 0.1)' : 'rgba(147, 218, 151, 0.1)',
                  border: `1px solid ${(viewMode === 'pending' && activeView === item.id) ? 'rgba(62, 95, 68, 0.3)' : 'rgba(147, 218, 151, 0.3)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: (viewMode === 'pending' && activeView === item.id) ? 'bold' : 'normal',
                  color: (viewMode === 'pending' && activeView === item.id) ? '#3E5F44' : '#5E936C'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span style={{
                  backgroundColor: activeView === item.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(62, 95, 68, 0.2)',
                  color: activeView === item.id ? 'white' : '#3E5F44',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '12px',
              background: 'linear-gradient(135deg, #3E5F44, #5E936C)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(62, 95, 68, 0.3)'
            }}
          >
            <span>🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '24px' }}>
          {/* Statistics Boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Total Pending Applications */}
            <div 
              onClick={() => {
                setViewMode('pending');
                setActiveView('all');
              }}
              style={{
                backgroundColor: viewMode === 'pending' && activeView === 'all' ? '#fef2f2' : 'white',
                border: viewMode === 'pending' && activeView === 'all' ? '2px solid #dc3545' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: viewMode === 'pending' && activeView === 'all' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#666',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Pending Applications</h3>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#dc3545',
                margin: '0'
              }}>{applications.length}</p>
            </div>

            {/* Total Workers */}
            <div 
              onClick={() => {
                setViewMode('approved');
                setApprovedEmployeeFilter('all');
              }}
              style={{
                backgroundColor: viewMode === 'approved' && approvedEmployeeFilter === 'all' ? '#e8f5e8' : 'white',
                border: viewMode === 'approved' && approvedEmployeeFilter === 'all' ? '2px solid #28a745' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: viewMode === 'approved' && approvedEmployeeFilter === 'all' ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#666',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Total Workers</h3>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#28a745',
                margin: '0'
              }}>{approvedEmployees.length}</p>
              <p style={{
                fontSize: '0.8rem',
                color: '#888',
                margin: '4px 0 0 0'
              }}>Approved Employees</p>
            </div>

            {/* Landscapers */}
            <div 
              onClick={() => {
                setViewMode('approved');
                setApprovedEmployeeFilter('landscaper');
              }}
              style={{
                backgroundColor: viewMode === 'approved' && approvedEmployeeFilter === 'landscaper' ? '#e8f5e8' : 'white',
                border: viewMode === 'approved' && approvedEmployeeFilter === 'landscaper' ? '2px solid #28a745' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: viewMode === 'approved' && approvedEmployeeFilter === 'landscaper' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#666',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Landscapers</h3>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#28a745',
                margin: '0'
              }}>{approvedEmployees.filter(emp => emp.Employee_Type === 'Landscaper').length}</p>
            </div>

            {/* General Employees */}
            <div 
              onClick={() => {
                setViewMode('approved');
                setApprovedEmployeeFilter('General Employee');
              }}
              style={{
                backgroundColor: viewMode === 'approved' && approvedEmployeeFilter === 'General Employee' ? '#e8f0f8' : 'white',
                border: viewMode === 'approved' && approvedEmployeeFilter === 'General Employee' ? '2px solid #17a2b8' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: viewMode === 'approved' && approvedEmployeeFilter === 'General Employee' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#666',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>General Employees</h3>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#17a2b8',
                margin: '0'
              }}>{approvedEmployees.filter(emp => emp.Employee_Type === 'General Employee').length}</p>
            </div>

            {/* Drivers */}
            <div 
              onClick={() => {
                setViewMode('approved');
                setApprovedEmployeeFilter('driver');
              }}
              style={{
                backgroundColor: viewMode === 'approved' && approvedEmployeeFilter === 'driver' ? '#f3e8ff' : 'white',
                border: viewMode === 'approved' && approvedEmployeeFilter === 'driver' ? '2px solid #6f42c1' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: viewMode === 'approved' && approvedEmployeeFilter === 'driver' ? 'scale(1.02)' : 'scale(1)'
              }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#666',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Drivers</h3>
              <p style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#6f42c1',
                margin: '0'
              }}>{approvedEmployees.filter(emp => emp.Employee_Type === 'Driver').length}</p>
            </div>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(62, 95, 68, 0.2)',
                borderTop: '4px solid #3E5F44',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{
                color: '#5E936C',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>Loading {viewMode === 'pending' ? 'applications' : 'employees'}...</p>
            </div>
          ) : viewMode === 'pending' ? (
            // Pending Applications Table
            filteredApplications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px',
                border: '1px solid rgba(147, 218, 151, 0.3)'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#3E5F44',
                  marginBottom: '16px'
                }}>No pending applications</h3>
                <p style={{
                  color: '#5E936C',
                  fontSize: '1.125rem',
                  margin: 0
                }}>All applications have been processed.</p>
              </div>
            ) : (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '60px 2fr 1fr 1fr 1.5fr 2fr',
                gap: '16px',
                alignItems: 'center',
                color: '#333',
                fontWeight: '600',
                fontSize: '0.875rem',
                borderBottom: '1px solid #ddd'
              }}>
                <span></span>
                <span>Employee</span>
                <span style={{ textAlign: 'center' }}>Type</span>
                <span style={{ textAlign: 'center' }}>Service #</span>
                <span style={{ textAlign: 'center' }}>Date Applied</span>
                <span style={{ textAlign: 'center' }}>Actions</span>
              </div>

              {/* Table Body */}
              <div>
                {filteredApplications.map((application, index) => (
                  <div
                    key={application._id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 2fr 1fr 1fr 1.5fr 2fr',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: index < filteredApplications.length - 1 ? '1px solid #eee' : 'none',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#3E5F44',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {application.Employee_Name.charAt(0)}
                    </div>

                    {/* Employee Info */}
                    <div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#3E5F44',
                        marginBottom: '4px',
                        cursor: 'pointer'
                      }} onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailsModal(true);
                      }}>
                        {application.Employee_Name}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#5E936C',
                        marginBottom: '2px'
                      }}>
                        📧 {application.Employee_Email}
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#5E936C'
                      }}>
                        📞 {application.Employee_Contact_Num}
                      </p>
                    </div>

                    {/* Employee Type */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: '#e8f5e8',
                        color: '#3E5F44',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textAlign: 'center',
                        display: 'inline-block'
                      }}>
                        {application.Employee_Type}
                      </span>
                    </div>

                    {/* Service Number */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        color: '#5E936C',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        #{application.Service_Num}
                      </span>
                    </div>

                    {/* Date */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        color: '#3E5F44',
                        fontSize: '0.875rem'
                      }}>
                        {formatDate(application.Created_Dtm)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowDetailsModal(true);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: '500'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleApprove(application)}
                        disabled={processing}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: processing ? '#ccc' : '#28a745',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: processing ? 'not-allowed' : 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: '500'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(application)}
                        disabled={processing}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: processing ? '#ccc' : '#dc3545',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: processing ? 'not-allowed' : 'pointer',
                          fontSize: '0.7rem',
                          fontWeight: '500'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          ) : (
            // Approved Employees Table
            (() => {
              const filteredApprovedEmployees = approvedEmployees.filter(emp => {
                if (approvedEmployeeFilter === 'all') return true;
                if (approvedEmployeeFilter === 'landscaper') return emp.Employee_Type === 'Landscaper';
                if (approvedEmployeeFilter === 'General Employee') return emp.Employee_Type === 'General Employee';
                if (approvedEmployeeFilter === 'driver') return emp.Employee_Type === 'Driver';
                return true;
              });

              return filteredApprovedEmployees.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '24px',
                  border: '1px solid rgba(147, 218, 151, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#3E5F44',
                    marginBottom: '16px'
                  }}>No approved employees</h3>
                  <p style={{
                    color: '#5E936C',
                    fontSize: '1.125rem',
                    margin: 0
                  }}>No employees have been approved yet.</p>
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {/* Approved Employees Table Header */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '12px 16px',
                    display: 'grid',
                    gridTemplateColumns: '60px 2fr 1fr 1fr 1.5fr 1fr 120px',
                    gap: '16px',
                    alignItems: 'center',
                    color: '#333',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #ddd'
                  }}>
                    <span></span>
                    <span>Employee</span>
                    <span style={{ textAlign: 'center' }}>Type</span>
                    <span style={{ textAlign: 'center' }}>Service #</span>
                    <span style={{ textAlign: 'center' }}>Approved Date</span>
                    <span style={{ textAlign: 'center' }}>Status</span>
                    <span style={{ textAlign: 'center' }}>Actions</span>
                  </div>

                  {/* Approved Employees Table Body */}
                  <div>
                    {filteredApprovedEmployees.map((employee, index) => (
                      <div
                        key={employee._id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '60px 2fr 1fr 1fr 1.5fr 1fr 120px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderBottom: index < filteredApprovedEmployees.length - 1 ? '1px solid #eee' : 'none',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: '#28a745',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          {employee.Employee_Name.charAt(0)}
                        </div>

                        {/* Employee Info */}
                        <div>
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: '#28a745',
                            marginBottom: '4px'
                          }}>
                            {employee.Employee_Name}
                          </h3>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#5E936C',
                            marginBottom: '2px'
                          }}>
                            📧 {employee.Employee_Email}
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#5E936C'
                          }}>
                            📞 {employee.Employee_Contact_Num}
                          </p>
                        </div>

                        {/* Employee Type */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}>
                            {employee.Employee_Type}
                          </span>
                        </div>

                        {/* Service Number */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            color: '#28a745',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            #{employee.Service_Num}
                          </span>
                        </div>

                        {/* Approved Date */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            color: '#28a745',
                            fontSize: '0.875rem'
                          }}>
                            {employee.Approve_Dtm ? formatDate(employee.Approve_Dtm) : 'N/A'}
                          </span>
                        </div>

                        {/* Status */}
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Active
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              setSelectedApplication(employee);
                              setShowDetailsModal(true);
                            }}
                            style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Approve Application</h3>
                <p className="text-sm text-gray-500">{selectedApplication.Employee_Name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved By *
                </label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={processing || !approvedBy.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Approve'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">❌</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
                <p className="text-sm text-gray-500">{selectedApplication.Employee_Name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Note (Optional)
                </label>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #ccc',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#f8f9fa',
              color: '#333',
              padding: '16px 20px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#3E5F44',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {selectedApplication.Employee_Name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#333' }}>
                    {selectedApplication.Employee_Name}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                    Employee Application Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  backgroundColor: '#e9ecef',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  color: '#333',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: '1rem'
                }}
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {/* Contact Information */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  padding: '16px',
                  border: '1px solid #ddd'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                  }}>Contact Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Email:</strong> {selectedApplication.Employee_Email}
                    </p>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Phone:</strong> {selectedApplication.Employee_Contact_Num}
                    </p>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Address:</strong> {selectedApplication.Employee_Adress}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  padding: '16px',
                  border: '1px solid #ddd'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                  }}>Application Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Service #:</strong> {selectedApplication.Service_Num}
                    </p>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Type:</strong> {selectedApplication.Employee_Type}
                    </p>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Availability:</strong> {selectedApplication.Avilability}
                    </p>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Created by:</strong> {selectedApplication.Created_By}
                    </p>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                      <strong>Applied:</strong> {formatDate(selectedApplication.Created_Dtm)}
                    </p>
                    {selectedApplication.License_Num && (
                      <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
                        <strong>License:</strong> {selectedApplication.License_Num}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CV Section */}
              {selectedApplication.Employee_CV && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  padding: '16px',
                  border: '1px solid #ddd',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                  }}>CV Document</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: '1'
                    }}>
                      <span style={{
                        fontSize: '1.2rem'
                      }}>📄</span>
                      <span style={{
                        color: '#555',
                        fontSize: '0.9rem'
                      }}>
                        {selectedApplication.Employee_CV.split('/').pop()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`http://localhost:5000/${selectedApplication.Employee_CV}`);
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = selectedApplication.Employee_CV.split('/').pop();
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } else {
                              alert('Failed to download CV. Please try again.');
                            }
                          } catch (error) {
                            console.error('Download error:', error);
                            alert('Error downloading CV. Please try again.');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                      >
                        📥 Download CV
                      </button>
                      <button
                        onClick={() => window.open(`http://localhost:5000/${selectedApplication.Employee_CV}`, '_blank')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                      >
                        👁️ View CV
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                borderTop: '1px solid #ddd',
                paddingTop: '16px'
              }}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: '1px solid #5a6268',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleApprove(selectedApplication);
                  }}
                  disabled={processing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: processing ? '#ccc' : '#28a745',
                    color: 'white',
                    border: processing ? '1px solid #ccc' : '1px solid #1e7e34',
                    borderRadius: '4px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleReject(selectedApplication);
                  }}
                  disabled={processing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: processing ? '#ccc' : '#dc3545',
                    color: 'white',
                    border: processing ? '1px solid #ccc' : '1px solid #bd2130',
                    borderRadius: '4px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;