import React, { useState, useEffect } from 'react';

const StarRating = ({ rating, interactive = false, onRatingChange, size = 'lg' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`transition-all duration-200 ${
            interactive 
              ? 'hover:scale-110 cursor-pointer' 
              : 'cursor-default'
          } ${
            star <= (interactive ? hoverRating || rating : rating)
              ? 'text-yellow-400' 
              : 'text-gray-300'
          }`}
          onClick={interactive ? () => onRatingChange(star) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const RatingCard = ({ rating }) => (
  <div className="card p-6 mb-4">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold mr-3">
            {rating.clientName ? rating.clientName.charAt(0) : 'A'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">
              {rating.clientName || 'Anonymous'}
            </h4>
            <p className="text-sm text-gray-500">
              {new Date(rating.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <StarRating rating={rating.rating} interactive={false} size="sm" />
    </div>
    
    {rating.comment && (
      <p className="text-gray-700 leading-relaxed italic">
        "{rating.comment}"
      </p>
    )}
  </div>
);

const EmployeeRatingPage = () => {
  const [employee, setEmployee] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState({
    rating: 0,
    comment: '',
    clientName: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get employee ID from URL
  const employeeId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
      fetchRatings();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) throw new Error('Employee not found');
      
      const data = await response.json();
      setEmployee(data);
    } catch (err) {
      setError('Failed to load employee information');
      console.error('Error fetching employee:', err);
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ratings/employee/${employeeId}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      
      const data = await response.json();
      setRatings(data);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRating.rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          ...newRating
        }),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      setSuccess('Rating submitted successfully!');
      setNewRating({ rating: 0, comment: '', clientName: '' });
      fetchRatings(); // Refresh ratings
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      console.error('Error submitting rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  if (loading && !employee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee information...</p>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Employee Header */}
      {employee && (
        <div className="card p-8 mb-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
            {employee.Employee_Name.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {employee.Employee_Name}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{employee.Employee_Type}</p>
          
          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <StarRating rating={averageRating} interactive={false} size="md" />
              <p className="text-sm text-gray-500 mt-1">
                Average Rating
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{ratings.length}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Employee Form */}
      <div className="card p-8 mb-8">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Rate This Employee
        </h2>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Your Rating *
            </label>
            <StarRating
              rating={newRating.rating}
              interactive={true}
              onRatingChange={(rating) => setNewRating({...newRating, rating})}
              size="lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              Click on the stars to rate
            </p>
          </div>

          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="clientName"
              value={newRating.clientName}
              onChange={(e) => setNewRating({...newRating, clientName: e.target.value})}
              className="input"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              value={newRating.comment}
              onChange={(e) => setNewRating({...newRating, comment: e.target.value})}
              className="input"
              rows="4"
              placeholder="Share your experience with this employee..."
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={submitting || newRating.rating === 0}
              className="btn btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Ratings */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Customer Reviews ({ratings.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to rate this employee!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <RatingCard key={rating._id} rating={rating} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeRatingPage;