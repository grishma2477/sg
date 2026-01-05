import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, auth, requiredRole }) => {
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.userRole !== requiredRole) {
    // Redirect to appropriate dashboard if wrong role
    const redirectPath = auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
