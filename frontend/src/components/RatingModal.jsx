import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function RatingModal({ isOpen, onClose, storeId, onRatingSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const handleRatingClick = async (selectedRating) => {
    try {
      setSubmitting(true);
      setError('');
      
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      };

      
      await axios.post(`${backendURL}/ratings/${storeId}`, {
        rating: selectedRating
      }, config);
      
      setRating(selectedRating);
      onRatingSuccess(selectedRating);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
      console.error('Error submitting rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Rate this store</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 p-3 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={submitting}
              className="p-1 focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRatingClick(star)}
            >
              <svg 
                className={`h-10 w-10 ${
                  star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                } ${submitting ? 'opacity-50' : 'hover:scale-110'} transition-all duration-150`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        
        <div className="text-center">
          {submitting ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {hoveredRating || rating
                ? `${hoveredRating || rating} out of 5 stars`
                : 'Click to rate'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 