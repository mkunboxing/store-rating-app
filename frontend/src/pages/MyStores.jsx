import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const RatingsModal = ({ isOpen, onClose, ratings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 z-10 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Store Ratings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4">
          {ratings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ratings.map((rating) => (
                    <tr key={rating.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rating.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rating.user_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rating.rating} ★</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No ratings found for this store.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [sorting, setSorting] = useState([]);
  const [selectedStoreRatings, setSelectedStoreRatings] = useState([]);
  const [isRatingsModalOpen, setIsRatingsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        };
        
        const response = await axios.get('http://localhost:8003/api/stores/my-stores', config);
        setStores(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch stores');
        console.error('Error fetching stores:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.token) {
      fetchStores();
    }
  }, [currentUser]);

  const fetchStoreRatings = async (storeId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      };
      
      const response = await axios.get(`http://localhost:8003/api/ratings/store/${storeId}`, config);
      setSelectedStoreRatings(response.data);
      setIsRatingsModalOpen(true);
    } catch (err) {
      console.error('Error fetching store ratings:', err);
      // You could show an error toast here
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (_, index) => index + 1,
        header: 'S.No',
        size: 60,
      },
      {
        accessorKey: 'name',
        header: 'Store Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'address',
        header: 'Address',
      },
      {
        accessorKey: 'average_rating',
        header: 'Average Rating',
        cell: ({ row }) => row.original.average_rating || 'N/A',
      },
      {
        accessorKey: 'total_ratings',
        header: 'Total Ratings',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => fetchStoreRatings(row.original.id)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            View Ratings
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: stores,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Stores</h1>
        </div>
        <h3 className="text-center underline text-lg mb-2 text-gray-700">
          Click on Table heading to sort.
        </h3>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          <span className="text-gray-400">
                            {{
                              asc: ' ↑',
                              desc: ' ↓',
                            }[header.column.getIsSorted()] ?? ''}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RatingsModal
        isOpen={isRatingsModalOpen}
        onClose={() => setIsRatingsModalOpen(false)}
        ratings={selectedStoreRatings}
      />
    </div>
  );
} 