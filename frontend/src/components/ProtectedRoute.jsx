// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, auth, requiredRole }) => {
//   if (!auth.token) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requiredRole && auth.userRole !== requiredRole) {
//     // Redirect to appropriate dashboard if wrong role
//     const redirectPath = auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
//     return <Navigate to={redirectPath} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;



import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const dashboardByRole = {
  admin: '/admin/dashboard',
  driver: '/driver/dashboard',
  rider: '/rider/dashboard'
};

const ProtectedRoute = ({ children, auth, requiredRole }) => {
  const location = useLocation();

  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && auth.userRole !== requiredRole) {
    return <Navigate to={dashboardByRole[auth.userRole] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
