import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

function AddStoreForm({ onStoreAdded, onClose, isOpen }) {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [storeOwners, setStoreOwners] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      address: '',
      owner_id: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchStoreOwners();
    }
  }, [isOpen, currentUser]);

  const fetchStoreOwners = async () => {
    try {
      const response = await axios.get('http://localhost:8003/api/users/store-owners', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setStoreOwners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching store owners:', error);
      setError('Failed to load store owners. Please try again.');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8003/api/stores', data, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setSuccess('Store added successfully!');
      setError('');
      reset();
      if (onStoreAdded) onStoreAdded(response.data);
      // Close modal after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding store');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Store</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && <div className="mb-4 text-red-600 p-2 bg-red-50 rounded">{error}</div>}
        {success && <div className="mb-4 text-green-600 p-2 bg-green-50 rounded">{success}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name</label>
            <input
              type="text"
              {...register("name", {
                required: "Store name is required",
                minLength: {
                  value: 3,
                  message: "Store name must be at least 3 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Store name must be less than 100 characters",
                },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Please enter a valid email",
                },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              {...register("address", {
                required: "Address is required",
                maxLength: {
                  value: 400,
                  message: "Address must be less than 400 characters",
                },
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Owner</label>
            {storeOwners.length > 0 ? (
              <select
                {...register("owner_id", {
                  required: "Store owner is required",
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a store owner</option>
                {storeOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email}) - Current stores: {owner.total_stores}
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Loading store owners...
              </div>
            )}
            {errors.owner_id && <p className="text-red-500 text-xs mt-1">{errors.owner_id.message}</p>}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Store...
                </div>
              ) : 'Add Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStoreForm; 