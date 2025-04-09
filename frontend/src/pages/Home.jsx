import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RatingModal from '../components/RatingModal';
import Toast from '../components/Toast';

// Star rating component for visual display of ratings
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = rating && (rating % 1) >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function Home() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // Rating modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedStoreName, setSelectedStoreName] = useState('');
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
        // Set up authorization header with bearer token if user is logged in
        const config = {
          headers: { }
        };
        
        if (currentUser && currentUser.token) {
          config.headers.Authorization = `Bearer ${currentUser.token}`;
        }
        
        const response = await axios.get('http://localhost:8003/api/stores', config);
        setStores(response.data.data);
        setFilteredStores(response.data.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch stores');
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = stores.filter(
        store => 
          store.name.toLowerCase().includes(lowercasedSearch) || 
          (store.address && store.address.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchTerm, stores]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const openRatingModal = (store) => {
    setSelectedStoreId(store.id);
    setSelectedStoreName(store.name);
    setIsRatingModalOpen(true);
  };
  
  const closeRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedStoreId(null);
  };
  
  const handleRatingSuccess = (rating) => {
    // Update the store's rating in the UI
    const updatedStores = stores.map(store => {
      if (store.id === selectedStoreId) {
        // For simplicity, we're just setting user_rating here
        // In a real app, you might want to refetch the store data to get an updated overall_rating
        return { ...store, user_rating: rating.toString() };
      }
      return store;
    });
    
    setStores(updatedStores);
    setFilteredStores(updatedStores);
    
    // Show success toast
    setToast({
      show: true,
      message: `Your ${rating}-star rating for ${selectedStoreName} has been submitted!`,
      type: 'success'
    });
  };
  
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="mt-2">Please make sure your API server is running at http://localhost:8003</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
      
      <RatingModal 
        isOpen={isRatingModalOpen} 
        onClose={closeRatingModal} 
        storeId={selectedStoreId}
        onRatingSuccess={handleRatingSuccess}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
        </div>
        
        <div className="mt-6">
          <div className="relative rounded-md shadow-sm max-w-md">
            <input
              type="text"
              placeholder="Search by store name or address..."
              value={searchTerm}
              onChange={handleSearch}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-3 sm:text-sm border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div key={store.id} className="bg-white overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-lg">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{store.name}</h3>
                    <div className="flex items-center">
                      {store.overall_rating ? (
                        <div className="flex items-center">
                          <StarRating rating={parseFloat(store.overall_rating)} />
                          <span className="ml-1 text-sm text-gray-600">
                            {parseFloat(store.overall_rating).toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No ratings</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-start">
                    <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-500">{store.address}</p>
                  </div>
                  
                  {store.user_rating && (
                    <div className="mt-3 flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Your rating:</span>
                      <div className="flex items-center">
                        <StarRating rating={parseFloat(store.user_rating)} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => openRatingModal(store)}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      <svg className="mr-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {store.user_rating ? 'Update Rating' : 'Rate This Store'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 