import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import AddUserForm from '../components/AddUserForm';
import AddStoreForm from '../components/AddStoreForm';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ total_users: 0, total_stores: 0, total_ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [usersSorting, setUsersSorting] = useState([]);
  const [storesSorting, setStoresSorting] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    fetchStores();
  }, [currentUser]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:8003/api/users/stats/dashboard', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setStats(response.data[0] || { total_users: 0, total_stores: 0, total_ratings: 0 });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({ total_users: 0, total_stores: 0, total_ratings: 0 });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8003/api/users', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get('http://localhost:8003/api/stores', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      // Handle nested data structure
      const storesData = response.data?.data || [];
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
    fetchDashboardStats();
  };

  const handleStoreAdded = () => {
    fetchStores();
    fetchDashboardStats();
  };

  const openAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const openAddStoreModal = () => {
    setIsAddStoreModalOpen(true);
  };

  const closeAddStoreModal = () => {
    setIsAddStoreModalOpen(false);
  };

  // Table Columns
  const userColumns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: info => {
          const role = info.getValue();
          return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                role === 'store_owner' ? 'bg-green-100 text-green-800' : 
                'bg-blue-100 text-blue-800'}`}>
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: 'average_rating',
        header: 'Rating',
        cell: info => {
          const user = info.row.original;
          return user.role === 'store_owner' && user.average_rating ? 
            `${parseFloat(user.average_rating).toFixed(1)} ⭐` : '-';
        },
      },
    ],
    []
  );

  const storeColumns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'overall_rating',
        header: 'Rating',
        cell: info => {
          const rating = info.getValue();
          return rating ? `${parseFloat(rating).toFixed(1)} ⭐` : '-';
        },
      },
    ],
    []
  );

  // React Table instances
  const usersTable = useReactTable({
    data: users,
    columns: userColumns,
    state: {
      sorting: usersSorting,
    },
    onSortingChange: setUsersSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const storesTable = useReactTable({
    data: stores,
    columns: storeColumns,
    state: {
      sorting: storesSorting,
    },
    onSortingChange: setStoresSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          
        </div>
      </header>
      <main>
        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800">Total Users</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_users}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800">Total Stores</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_stores}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800">Total Ratings</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.total_ratings}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex flex-wrap gap-4">
            <button
              onClick={openAddUserModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New User
            </button>

            <button
              onClick={openAddStoreModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Store
            </button>
          </div>

          {/* Add User Modal */}
          <AddUserForm 
            isOpen={isAddUserModalOpen} 
            onClose={closeAddUserModal} 
            onUserAdded={handleUserAdded} 
          />

          {/* Add Store Modal */}
          <AddStoreForm 
            isOpen={isAddStoreModalOpen} 
            onClose={closeAddStoreModal} 
            onStoreAdded={handleStoreAdded} 
          />

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <p className="text-lg text-gray-700">
              click on Table heading to sort.
            </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {usersTable.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          scope="col"
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
                  {usersTable.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => usersTable.previousPage()}
                  disabled={!usersTable.getCanPreviousPage()}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => usersTable.nextPage()}
                  disabled={!usersTable.getCanNextPage()}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {usersTable.getState().pagination.pageIndex * usersTable.getState().pagination.pageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(
                        (usersTable.getState().pagination.pageIndex + 1) * usersTable.getState().pagination.pageSize,
                        users.length
                      )}
                    </span>{' '}
                    of <span className="font-medium">{users.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => usersTable.previousPage()}
                      disabled={!usersTable.getCanPreviousPage()}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => usersTable.nextPage()}
                      disabled={!usersTable.getCanNextPage()}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Stores Table */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4">All Stores</h2>
            <p className="text-lg text-gray-700">
              click on Table heading to sort.
            </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {storesTable.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          scope="col"
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
                  {storesTable.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => storesTable.previousPage()}
                  disabled={!storesTable.getCanPreviousPage()}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => storesTable.nextPage()}
                  disabled={!storesTable.getCanNextPage()}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {storesTable.getState().pagination.pageIndex * storesTable.getState().pagination.pageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(
                        (storesTable.getState().pagination.pageIndex + 1) * storesTable.getState().pagination.pageSize,
                        stores.length
                      )}
                    </span>{' '}
                    of <span className="font-medium">{stores.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => storesTable.previousPage()}
                      disabled={!storesTable.getCanPreviousPage()}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => storesTable.nextPage()}
                      disabled={!storesTable.getCanNextPage()}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 