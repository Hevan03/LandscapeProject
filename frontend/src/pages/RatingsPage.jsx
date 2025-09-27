import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../api';

const RatingsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ratingData, setRatingData] = useState({
    rating: 5,
    comment: '',
    raterName: ''
  });

  // Fetch approved employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch approved employees and users with ratings
      const [employeeData, ratingData] = await Promise.all([
        employeeAPI.getApprovedEmployees(),
        fetch('http://localhost:5000/api/rating/all').then(res => res.json())
      ]);
      
      // Only get approved employees
      const approvedEmployees = employeeData.filter(emp => emp.Employee_Status === 'Approve');
      
      // Map employees with their rating data from users
      const employeesWithRatings = approvedEmployees.map(emp => {
        // Find corresponding user by service number
        const user = ratingData.users ? ratingData.users.find(u => u.serviceNum === emp.Service_Num.toString()) : null;
        
        const rating = user ? user.rating : 0;
        const ratingCount = user ? user.ratingCount : 0;
        
        return {
          ...emp,
          userId: user ? user._id : null,
          averageRating: rating,
          totalRatings: ratingCount,
          ratingPercentage: calculateRatingPercentage(rating, ratingCount)
        };
      });

      setEmployees(employeesWithRatings);
      setFilteredEmployees(employeesWithRatings);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate rating percentage distribution (simplified for backend rating system)
  const calculateRatingPercentage = (averageRating, totalRatings) => {
    if (!totalRatings || totalRatings === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    // Since backend only stores average rating, we'll create a simple distribution
    // This is a simplified approach - in a real system you'd store individual ratings
    const rounded = Math.round(averageRating);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // Simple distribution based on average rating
    if (averageRating >= 4.5) {
      distribution[5] = 70;
      distribution[4] = 30;
    } else if (averageRating >= 3.5) {
      distribution[4] = 60;
      distribution[3] = 25;
      distribution[5] = 15;
    } else if (averageRating >= 2.5) {
      distribution[3] = 50;
      distribution[2] = 30;
      distribution[4] = 20;
    } else if (averageRating >= 1.5) {
      distribution[2] = 50;
      distribution[1] = 30;
      distribution[3] = 20;
    } else {
      distribution[1] = 70;
      distribution[2] = 30;
    }

    return distribution;
  };

  // Filter employees by type
  const filterEmployees = (type) => {
    setActiveFilter(type);
    if (type === 'all') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => emp.Employee_Type.toLowerCase() === type.toLowerCase());
      setFilteredEmployees(filtered);
    }
  };

  // Handle rating submission
  const handleRateEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingData.raterName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!selectedEmployee.userId) {
      alert('Unable to submit rating. Employee not found in rating system.');
      return;
    }

    try {
      // Submit rating to backend using public endpoint
      const response = await fetch(`http://localhost:5000/api/rating/${selectedEmployee.userId}/rate-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: ratingData.rating,
          comment: ratingData.comment,
          raterName: ratingData.raterName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const result = await response.json();

      // Update local state with new rating data
      const updatedEmployees = employees.map(emp => {
        if (emp.Service_Num === selectedEmployee.Service_Num) {
          const newRating = result.user.rating;
          const newCount = result.user.ratingCount;
          return {
            ...emp,
            averageRating: newRating,
            totalRatings: newCount,
            ratingPercentage: calculateRatingPercentage(newRating, newCount)
          };
        }
        return emp;
      });

      setEmployees(updatedEmployees);
      filterEmployees(activeFilter); // Refresh filtered list

      // Reset form and close modal
      setRatingData({ rating: 5, comment: '', raterName: '' });
      setShowRatingModal(false);
      setSelectedEmployee(null);
      
      alert('Thank you for your rating! Your feedback helps us improve our services.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Star rating component for display
  const StarDisplay = ({ rating, size = 'md' }) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-2xl'
    };

    return (
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Interactive star rating for modal
  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-3xl transition-colors ${
              star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-lg font-medium">{rating}/5</span>
      </div>
    );
  };

  // Rating percentage bars
  const RatingBars = ({ percentages }) => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="flex items-center space-x-2">
            <span className="text-sm font-medium w-8">{star}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentages[star] || 0}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 w-12">{percentages[star] || 0}%</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E8FFD7 0%, #93DA97 50%, #5E936C 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p style={{ color: '#5E936C', fontSize: '1.1rem', fontWeight: '600' }}>Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8FFD7 0%, #93DA97 50%, #5E936C 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#2D5A37',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            Employee Ratings & Reviews
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#5E936C',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Rate and review our landscaping team members. Your feedback helps us maintain excellent service quality.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'All Employees', icon: '👥' },
            { key: 'Landscaper', label: 'Landscapers', icon: '🌳' },
            { key: 'General Employee', label: 'General Employees', icon: '🌱' },
            { key: 'Driver', label: 'Drivers', icon: '🚗' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => filterEmployees(filter.key)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeFilter === filter.key ? '#2D5A37' : 'white',
                color: activeFilter === filter.key ? 'white' : '#2D5A37',
                border: '2px solid #2D5A37',
                borderRadius: '25px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Employees Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {filteredEmployees.map(employee => (
            <div
              key={employee.Service_Num}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {/* Top Rated Badge */}
              {employee.averageRating >= 4.5 && employee.totalRatings >= 3 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: '#FFD700',
                  color: '#8B4513',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  ⭐ Top Rated
                </div>
              )}

              {/* Employee Info */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#2D5A37',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {employee.Employee_Name.charAt(0)}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2D5A37',
                  marginBottom: '0.5rem'
                }}>
                  {employee.Employee_Name}
                </h3>
                <p style={{
                  color: '#5E936C',
                  fontSize: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  {employee.Employee_Type}
                </p>
                <p style={{
                  color: '#93DA97',
                  fontSize: '0.9rem'
                }}>
                  Service #{employee.Service_Num}
                </p>
              </div>

              {/* Rating Display */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <StarDisplay rating={employee.averageRating} size="lg" />
                  <span style={{
                    marginLeft: '1rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#2D5A37'
                  }}>
                    {employee.averageRating.toFixed(1)}/5
                  </span>
                </div>
                <p style={{
                  textAlign: 'center',
                  color: '#5E936C',
                  marginBottom: '1rem'
                }}>
                  Based on {employee.totalRatings} review{employee.totalRatings !== 1 ? 's' : ''}
                </p>

                {/* Rating Percentage Bars */}
                {employee.totalRatings > 0 && (
                  <RatingBars percentages={employee.ratingPercentage} />
                )}
              </div>

              {/* Rate Button */}
              <button
                onClick={() => handleRateEmployee(employee)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2D5A37',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1F3D28'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2D5A37'}
              >
                ⭐ Rate This Employee
              </button>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#2D5A37', marginBottom: '1rem' }}>
              No employees found
            </h3>
            <p style={{ color: '#5E936C' }}>
              No {activeFilter === 'all' ? '' : activeFilter.toLowerCase()} employees are currently available for rating.
            </p>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedEmployee && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#2D5A37',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Rate {selectedEmployee.Employee_Name}
              </h2>
              
              <div style={{
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#2D5A37',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {selectedEmployee.Employee_Name.charAt(0)}
                </div>
                <p style={{ color: '#5E936C' }}>{selectedEmployee.Employee_Type}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#2D5A37'
                }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  value={ratingData.raterName}
                  onChange={(e) => setRatingData({...ratingData, raterName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #93DA97',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter your name"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '1rem',
                  fontWeight: '600',
                  color: '#2D5A37'
                }}>
                  Your Rating *
                </label>
                <div style={{ textAlign: 'center' }}>
                  <StarRating 
                    rating={ratingData.rating}
                    onRatingChange={(rating) => setRatingData({...ratingData, rating})}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#2D5A37'
                }}>
                  Comment (Optional)
                </label>
                <textarea
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #93DA97',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Share your experience..."
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedEmployee(null);
                    setRatingData({ rating: 5, comment: '', raterName: '' });
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ccc',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2D5A37',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;