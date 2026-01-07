

// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import io from 'socket.io-client';

// // Pages
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import RiderDashboard from './pages/RiderDashboard';
// import CreateRideRequest from './pages/CreateRideRequest';
// import ViewBids from './pages/ViewBids';
// import DriverRequests from './pages/DriverRequests';
// import SubmitBid from './pages/SubmitBid';
// import {RideRatingPage} from './pages/RideRatingPage';
// import ProfilePage from './pages/ProfilePage';
// import DriverDashboard from "./pages/DriverDashboard"
// // Components
// import BottomNav from './components/BottomNav';
// import ProtectedRoute from './components/ProtectedRoute';

// // Utils
// import { getAuthFromCookies, saveAuthToCookies, clearAuthData } from './utils/cookieUtils';

// // Styles
// import './App.css';
// import ActiveRide from './pages/ActiveRideDriver';

// // Socket connection
// let socket = null;

// function App() {
//   const [auth, setAuth] = useState(() => {
//     // Initialize auth from cookies on app load
//     return getAuthFromCookies() || {
//       token: null,
//       refreshToken: null,
//       userId: null,
//       userRole: null,
//       driverId: null
//     };
//   });

//   // Initialize socket connection when authenticated
//   useEffect(() => {
//     if (auth.token && auth.userId) {
//       // Initialize socket connection
//       socket = io('http://localhost:5000', {
//         auth: {
//           token: auth.token
//         }
//       });

//       socket.on('connect', () => {
//         console.log('✅ Socket connected');
//         // Authenticate with server
//         socket.emit('authenticate', {
//           userId: auth.userId,
//           role: auth.userRole,
//           driverId: auth.driverId
//         });
//       });

//       socket.on('disconnect', () => {
//         console.log('❌ Socket disconnected');
//       });

//       socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//       });

//       // Cleanup on unmount
//       return () => {
//         if (socket) {
//           socket.disconnect();
//           socket = null;
//         }
//       };
//     }
//   }, [auth.token, auth.userId, auth.userRole, auth.driverId]);

//   const handleLogin = (data) => {
//     console.log('handleLogin called with:', data);

//     const authData = {
//       token: data.token || data.accessToken,
//       refreshToken: data.refreshToken,
//       userId: data.userId,
//       userRole: data.role,
//       driverId: data.driverId
//     };

//     // Save to cookies and localStorage
//     saveAuthToCookies(authData);

//     // Update state
//     setAuth(authData);

//     console.log('Auth state updated:', authData);
//   };

//   const handleLogout = () => {
//     console.log('Logging out...');

//     // Disconnect socket
//     if (socket) {
//       socket.disconnect();
//       socket = null;
//     }

//     // Clear all auth data
//     clearAuthData();

//     // Reset state
//     setAuth({
//       token: null,
//       refreshToken: null,
//       userId: null,
//       userRole: null,
//       driverId: null
//     });

//     console.log('Logout complete');
//   };

//   // Debug: Log auth state changes
//   useEffect(() => {
//     console.log('Auth state changed:', auth);
//   }, [auth]);

//   return (
//     <div className="app-container">
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<HomePage />} />

//         <Route 
//           path="/login" 
//           element={
//             auth.token ? (
//               <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
//             ) : (
//               <LoginPage onLogin={handleLogin} />
//             )
//           } 
//         />

//         <Route 
//           path="/register" 
//           element={
//             auth.token ? (
//               <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
//             ) : (
//               <RegisterPage onRegister={handleLogin} />
//             )
//           } 
//         />

//         {/* Protected Rider Routes */}
//         <Route 
//           path="/rider/dashboard" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="rider">
//               <RiderDashboard auth={auth} onLogout={handleLogout} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/rider/create-ride" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="rider">
//               <CreateRideRequest auth={auth} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/rider/view-bids/:requestId" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="rider">
//               <ViewBids auth={auth} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/rider/profile" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="rider">
//               <ProfilePage auth={auth} onLogout={handleLogout} />
//             </ProtectedRoute>
//           } 
//         />
//         <Route path="/driver/active-ride/:rideId" element={<ActiveRide auth={auth} />} />


//         {/* Protected Driver Routes */}
//         <Route 
//           path="/driver/dashboard" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="driver">
//               <DriverDashboard auth={auth} onLogout={handleLogout} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/driver/requests" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="driver">
//               <DriverRequests auth={auth} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/driver/submit-bid/:requestId" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="driver">
//               <SubmitBid auth={auth} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/driver/profile" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="driver">
//               <ProfilePage auth={auth} onLogout={handleLogout} />
//             </ProtectedRoute>
//           } 
//         />

//         {/* Shared Protected Routes */}
//         <Route 
//           path="/rating/:rideId" 
//           element={
//             <ProtectedRoute auth={auth}>
//               <RideRatingPage auth={auth} />
//             </ProtectedRoute>
//           } 
//         />

//         {/* Catch all - redirect to home */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>

//       {/* Bottom Navigation for authenticated users */}
//       {auth.token && <BottomNav userRole={auth.userRole} />}
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RiderDashboard from './pages/RiderDashboard';
import CreateRideRequest from './pages/CreateRideRequest';
import ViewBids from './pages/ViewBids';
import DriverRequests from './pages/DriverRequests';
import SubmitBid from './pages/SubmitBid';
import { RideRatingPage } from './pages/RideRatingPage';
import ProfilePage from './pages/ProfilePage';
import DriverDashboard from "./pages/DriverDashboard";
import ActiveRide from './pages/ActiveRideDriver';
import RiderActiveRide from './pages/RiderActiveRide';

// Components
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

// Utils
import { getAuthFromCookies, saveAuthToCookies, clearAuthData } from './utils/CookieUtils.js';

// Styles
import './App.css';

// Socket connection
let socket = null;

function App() {
  const [auth, setAuth] = useState(() => {
    return getAuthFromCookies() || {
      token: null,
      refreshToken: null,
      userId: null,
      userRole: null,
      driverId: null
    };
  });

  useEffect(() => {
    if (auth.token && auth.userId) {
      socket = io('http://localhost:5000', {
        auth: { token: auth.token }
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected');
        socket.emit('authenticate', {
          userId: auth.userId,
          role: auth.userRole,
          driverId: auth.driverId
        });
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      };
    }
  }, [auth.token, auth.userId, auth.userRole, auth.driverId]);

  const handleLogin = (data) => {
    console.log('handleLogin called with:', data);

    const authData = {
      token: data.token || data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.userId,
      userRole: data.role,
      driverId: data.driverId
    };

    saveAuthToCookies(authData);
    setAuth(authData);
    console.log('Auth state updated:', authData);
  };

  const handleLogout = () => {
    console.log('Logging out...');

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    clearAuthData();

    setAuth({
      token: null,
      refreshToken: null,
      userId: null,
      userRole: null,
      driverId: null
    });

    console.log('Logout complete');
  };

  useEffect(() => {
    console.log('Auth state changed:', auth);
  }, [auth]);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={
            auth.token ? (
              <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            auth.token ? (
              <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
            ) : (
              <RegisterPage onRegister={handleLogin} />
            )
          }
        />

        {/* Rider Routes */}
        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute auth={auth} requiredRole="rider">
              <RiderDashboard auth={auth} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider/create-ride"
          element={
            <ProtectedRoute auth={auth} requiredRole="rider">
              <CreateRideRequest auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider/view-bids/:requestId"
          element={
            <ProtectedRoute auth={auth} requiredRole="rider">
              <ViewBids auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider/active-ride/:rideId"
          element={
            <ProtectedRoute auth={auth} requiredRole="rider">
              <RiderActiveRide auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rider/profile"
          element={
            <ProtectedRoute auth={auth} requiredRole="rider">
              <ProfilePage auth={auth} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute auth={auth} requiredRole="driver">
              <DriverDashboard auth={auth} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/requests"
          element={
            <ProtectedRoute auth={auth} requiredRole="driver">
              <DriverRequests auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/submit-bid/:requestId"
          element={
            <ProtectedRoute auth={auth} requiredRole="driver">
              <SubmitBid auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/active-ride/:rideId"
          element={
            <ProtectedRoute auth={auth} requiredRole="driver">
              <ActiveRide auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver/profile"
          element={
            <ProtectedRoute auth={auth} requiredRole="driver">
              <ProfilePage auth={auth} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rating/:rideId"
          element={
            <ProtectedRoute auth={auth}>
              <RideRatingPage auth={auth} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {auth.token && <BottomNav userRole={auth.userRole} />}
    </div>
  );
}

export default App;