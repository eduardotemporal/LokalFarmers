import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the custom hook

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    // Optional: Show a loading spinner or skeleton screen
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }

  // Role-based access control (optional)
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // User is authenticated but does not have the required role
    // Redirect to an unauthorized page or back to home page
    // For now, redirecting to home, but an '/unauthorized' page might be better
    console.warn(`User role ${user?.role} not authorized for this route.`);
    return <Navigate to="/" replace />; // Or to an unauthorized page
  }

  // If authenticated (and authorized, if roles are checked), render the child components
  return <Outlet />;
};

export default ProtectedRoute;
