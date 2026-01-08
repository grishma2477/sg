import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RiderDashboard from './pages/RiderDashboard';
import CreateRideRequest from './pages/CreateRideRequest';
import ViewBids from './pages/ViewBids';
import DriverRequests from './pages/DriverRequests';
import SubmitBid from './pages/SubmitBid';
import {RideRatingPage} from './pages/RideRatingPage';
import ProfilePage from './pages/ProfilePage';
import DriverDashboard from "./pages/DriverDashboard";
import ActiveRide from './pages/ActiveRideDriver';
import RiderActiveRide from './pages/RiderActiveRide';

// Components
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

// Utils
import { getAuthFromCookies, saveAuthToCookies, clearAuthData } from './utils/CookieUtils';

// Styles
import './App.css';

function App() {
  const socketRef = useRef(null);
  const [auth, setAuth] = useState(() => {
    return getAuthFromCookies() || {
      token: null,
      refreshToken: null,
      userId: null,
      userRole: null,
      driverId: null
    };
  });

  // Socket connection - STABLE, doesn't recreate
  useEffect(() => {
    // Only create if authenticated and doesn't exist
    if (auth.token && auth.userId && !socketRef.current) {
      console.log('🔌 App: Creating socket connection...');
      console.log('Auth data:', {
        userId: auth.userId,
        role: auth.userRole,
        driverId: auth.driverId
      });

      const socket = io('http://localhost:5000', {
        auth: { token: auth.token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ App: Socket connected:', socket.id);
        
        socket.emit('authenticate', {
          userId: auth.userId,
          role: auth.userRole,
          driverId: auth.driverId
        });
        
        console.log('📤 App: Authentication sent');
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ App: Socket disconnected:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ App: Socket connection error:', error);
      });

      // CRITICAL: Listen for bid acceptance at app level
      socket.on('ride:bid:accepted', (data) => {
        console.log('');
        console.log('═══════════════════════════════════════════');
        console.log('🎉🎉🎉 APP: BID ACCEPTED EVENT! 🎉🎉🎉');
        console.log('═══════════════════════════════════════════');
        console.log('Ride ID:', data.rideId);
        console.log('Fare:', data.fare_amount);
        console.log('Pickup:', data.pickup_address);
        console.log('═══════════════════════════════════════════');
        console.log('');
        
        alert(`🎉 YOUR BID WAS ACCEPTED!\n\nFare: ₹${data.fare_amount}\n\nRedirecting to ride page...`);
        
        // Force navigation using window.location to ensure it works
        window.location.href = `/driver/active-ride/${data.rideId}`;
      });

      // Debug: Listen to all events
      socket.onAny((eventName, ...args) => {
        console.log('📨 App socket event:', eventName);
      });
    }

    // Cleanup ONLY when component unmounts (app closes)
    return () => {
      if (socketRef.current) {
        console.log('🧹 App: Unmounting, cleaning up socket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // EMPTY array - only run ONCE on mount

  // Update socket authentication if auth changes (but don't recreate socket)
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && auth.userId) {
      console.log('🔄 App: Re-authenticating socket with new auth data');
      socketRef.current.emit('authenticate', {
        userId: auth.userId,
        role: auth.userRole,
        driverId: auth.driverId
      });
    }
  }, [auth.userId, auth.userRole, auth.driverId]);

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
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
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
// import DriverDashboard from "./pages/DriverDashboard";
// import ActiveRide from './pages/ActiveRideDriver';
// import RiderActiveRide from './pages/RiderActiveRide';

// // Components
// import BottomNav from './components/BottomNav';
// import ProtectedRoute from './components/ProtectedRoute';

// // Utils
// import { getAuthFromCookies, saveAuthToCookies, clearAuthData } from '../src/utils/CookieUtils';
// //
// // Styles
// import './App.css';

// // Socket connection
// let socket = null;

// function App() {
//   const [auth, setAuth] = useState(() => {
//     return getAuthFromCookies() || {
//       token: null,
//       refreshToken: null,
//       userId: null,
//       userRole: null,
//       driverId: null
//     };
//   });

//   useEffect(() => {
//     if (auth.token && auth.userId) {
//       socket = io('http://localhost:5000', {
//         auth: { token: auth.token }
//       });

//       socket.on('connect', () => {
//         console.log('✅ Socket connected');
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
    
//     saveAuthToCookies(authData);
//     setAuth(authData);
//     console.log('Auth state updated:', authData);
//   };

//   const handleLogout = () => {
//     console.log('Logging out...');
    
//     if (socket) {
//       socket.disconnect();
//       socket = null;
//     }

//     clearAuthData();
    
//     setAuth({
//       token: null,
//       refreshToken: null,
//       userId: null,
//       userRole: null,
//       driverId: null
//     });

//     console.log('Logout complete');
//   };

//   useEffect(() => {
//     console.log('Auth state changed:', auth);
//   }, [auth]);

//   return (
//     <div className="app-container">
//       <Routes>
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

//         {/* Rider Routes */}
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
//           path="/rider/active-ride/:rideId" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="rider">
//               <RiderActiveRide auth={auth} />
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

//         {/* Driver Routes */}
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
//           path="/driver/active-ride/:rideId" 
//           element={
//             <ProtectedRoute auth={auth} requiredRole="driver">
//               <ActiveRide auth={auth} />
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

//         <Route 
//           path="/rating/:rideId" 
//           element={
//             <ProtectedRoute auth={auth}>
//               <RideRatingPage auth={auth} />
//             </ProtectedRoute>
//           } 
//         />

//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>

//       {auth.token && <BottomNav userRole={auth.userRole} />}
//     </div>
//   );
// }

// export default App;