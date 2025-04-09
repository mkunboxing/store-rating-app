import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Check if the user's role is in the allowed roles list
  // If allowedRoles is empty, allow access to anyone who is authenticated
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to the appropriate page based on user role
    if (currentUser.role === 'admin') {
      return <Navigate to="/dashboard" />;
    } else if (currentUser.role === 'user') {
      return <Navigate to="/stores" />;
    } else if (currentUser.role === 'store_owner') {
      return <Navigate to="/my-stores" />;
    }
    // Default fallback
    return <Navigate to="/" />;
  }
  
  return children;
} 