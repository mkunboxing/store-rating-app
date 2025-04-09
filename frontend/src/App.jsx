import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import MyStores from './pages/MyStores';

// Wrapper component to check authentication status
function AppContent() {
  const { currentUser } = useAuth();

  // Helper function to determine the default route
  const getDefaultRoute = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === 'admin') return "/dashboard";
    return currentUser.role === 'user' ? "/stores" : "/my-stores";
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={getDefaultRoute()} />} />
        <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to={getDefaultRoute()} />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/stores" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path="/my-stores" element={
          <ProtectedRoute allowedRoles={['admin', 'store_owner']}>
            <MyStores />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
