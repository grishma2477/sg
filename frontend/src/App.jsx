// // import React, { useState, useEffect, useRef } from 'react';
// // import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// // import { io } from 'socket.io-client';

// // // Pages
// // import HomePage from './pages/HomePage';
// // import LoginPage from './pages/LoginPage';
// // import RegisterPage from './pages/RegisterPage';
// // import RiderDashboard from './pages/RiderDashboard';
// // import CreateRideRequest from './pages/CreateRideRequest';
// // import ViewBids from './pages/ViewBids';
// // import DriverRequests from './pages/DriverRequests';
// // import SubmitBid from './pages/SubmitBid';
// // import { RideRatingPage } from './pages/RideRatingPage';
// // import ProfilePage from './pages/ProfilePage';
// // import DriverDashboard from "./pages/DriverDashboard";
// // import ActiveRide from './pages/ActiveRideDriver';
// // import RiderActiveRide from './pages/RiderActiveRide';

// // // Components
// // import BottomNav from './components/BottomNav';
// // import ProtectedRoute from './components/ProtectedRoute';

// // // Utils
// // import { getAuthFromCookies, saveAuthToCookies, clearAuthData } from './utils/CookieUtils.js';

// // // Styles
// // import './App.css';

// // function App() {
// //   const socketRef = useRef(null);
// //   const [auth, setAuth] = useState(() => {
// //     return getAuthFromCookies() || {
// //       token: null,
// //       refreshToken: null,
// //       userId: null,
// //       userRole: null,
// //       driverId: null
// //     };
// //   });

// //   // Socket connection - STABLE, doesn't recreate
// //   useEffect(() => {
// //     // Only create if authenticated and doesn't exist
// //     if (auth.token && auth.userId && !socketRef.current) {
// //       console.log('🔌 App: Creating socket connection...');
// //       console.log('Auth data:', {
// //         userId: auth.userId,
// //         role: auth.userRole,
// //         driverId: auth.driverId
// //       });

// //       const socket = io('http://localhost:5000', {
// //         auth: { token: auth.token },
// //         transports: ['websocket'],
// //         reconnection: true,
// //         reconnectionDelay: 1000,
// //         reconnectionAttempts: 10
// //       });

// //       socketRef.current = socket;

// //       socket.on('connect', () => {
// //         console.log('✅ App: Socket connected:', socket.id);

// //         socket.emit('authenticate', {
// //           userId: auth.userId,
// //           role: auth.userRole,
// //           driverId: auth.driverId
// //         });

// //         console.log('📤 App: Authentication sent');
// //       });

// //       socket.on('disconnect', (reason) => {
// //         console.log('❌ App: Socket disconnected:', reason);
// //       });

// //       socket.on('connect_error', (error) => {
// //         console.error('❌ App: Socket connection error:', error);
// //       });

// //       // CRITICAL: Listen for bid acceptance at app level
// //       socket.on('ride:bid:accepted', (data) => {
// //         console.log('');
// //         console.log('═══════════════════════════════════════════');
// //         console.log('🎉🎉🎉 APP: BID ACCEPTED EVENT! 🎉🎉🎉');
// //         console.log('═══════════════════════════════════════════');
// //         console.log('Ride ID:', data.rideId);
// //         console.log('Fare:', data.fare_amount);
// //         console.log('Pickup:', data.pickup_address);
// //         console.log('═══════════════════════════════════════════');
// //         console.log('');

// //         alert(`🎉 YOUR BID WAS ACCEPTED!\n\nFare: ₹${data.fare_amount}\n\nRedirecting to ride page...`);

// //         // Force navigation using window.location to ensure it works
// //         window.location.href = `/driver/active-ride/${data.rideId}`;
// //       });

// //       // Debug: Listen to all events
// //       socket.onAny((eventName, ...args) => {
// //         console.log('📨 App socket event:', eventName);
// //       });
// //     }

// //     // Cleanup ONLY when component unmounts (app closes)
// //     return () => {
// //       if (socketRef.current) {
// //         console.log('🧹 App: Unmounting, cleaning up socket');
// //         socketRef.current.disconnect();
// //         socketRef.current = null;
// //       }
// //     };
// //   }, []); // EMPTY array - only run ONCE on mount

// //   // Update socket authentication if auth changes (but don't recreate socket)
// //   useEffect(() => {
// //     if (socketRef.current && socketRef.current.connected && auth.userId) {
// //       console.log('🔄 App: Re-authenticating socket with new auth data');
// //       socketRef.current.emit('authenticate', {
// //         userId: auth.userId,
// //         role: auth.userRole,
// //         driverId: auth.driverId
// //       });
// //     }
// //   }, [auth.userId, auth.userRole, auth.driverId]);

// //   const handleLogin = (data) => {
// //     console.log('handleLogin called with:', data);

// //     const authData = {
// //       token: data.token || data.accessToken,
// //       refreshToken: data.refreshToken,
// //       userId: data.userId,
// //       userRole: data.role,
// //       driverId: data.driverId
// //     };

// //     saveAuthToCookies(authData);
// //     setAuth(authData);

// //     console.log('Auth state updated:', authData);
// //   };

// //   const handleLogout = () => {
// //     console.log('Logging out...');

// //     if (socket) {
// //       socket.disconnect();
// //       socket = null;
// //     }

// //     clearAuthData();

// //     setAuth({
// //       token: null,
// //       refreshToken: null,
// //       userId: null,
// //       userRole: null,
// //       driverId: null
// //     });

// //     console.log('Logout complete');
// //   };

// //   return (
// //     <div className="app-container">
// //       <Routes>
// //         <Route path="/" element={<HomePage />} />

// //         <Route
// //           path="/login"
// //           element={
// //             auth.token ? (
// //               <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
// //             ) : (
// //               <LoginPage onLogin={handleLogin} />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/register"
// //           element={
// //             auth.token ? (
// //               <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
// //             ) : (
// //               <RegisterPage onRegister={handleLogin} />
// //             )
// //           }
// //         />

// //         {/* Rider Routes */}
// //         <Route
// //           path="/rider/dashboard"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="rider">
// //               <RiderDashboard auth={auth} onLogout={handleLogout} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/rider/create-ride"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="rider">
// //               <CreateRideRequest auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/rider/view-bids/:requestId"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="rider">
// //               <ViewBids auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/rider/active-ride/:rideId"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="rider">
// //               <RiderActiveRide auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/rider/profile"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="rider">
// //               <ProfilePage auth={auth} onLogout={handleLogout} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         {/* Driver Routes */}
// //         <Route
// //           path="/driver/dashboard"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="driver">
// //               <DriverDashboard auth={auth} onLogout={handleLogout} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/driver/requests"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="driver">
// //               <DriverRequests auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/driver/submit-bid/:requestId"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="driver">
// //               <SubmitBid auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/driver/active-ride/:rideId"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="driver">
// //               <ActiveRide auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/driver/profile"
// //           element={
// //             <ProtectedRoute auth={auth} requiredRole="driver">
// //               <ProfilePage auth={auth} onLogout={handleLogout} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route
// //           path="/rating/:rideId"
// //           element={
// //             <ProtectedRoute auth={auth}>
// //               <RideRatingPage auth={auth} />
// //             </ProtectedRoute>
// //           }
// //         />

// //         <Route path="*" element={<Navigate to="/" replace />} />
// //       </Routes>

// //       {auth.token && <BottomNav userRole={auth.userRole} />}
// //     </div>
// //   );
// // }

// // export default App;

// // // import React, { useState, useEffect } from 'react';
// // // import { Routes, Route, Navigate } from 'react-router-dom';
// // // import io from 'socket.io-client';

// // // // Pages
// // // import HomePage from './pages/HomePage';
// // // import LoginPage from './pages/LoginPage';
// // // import RegisterPage from './pages/RegisterPage';
// // // import RiderDashboard from './pages/RiderDashboard';
// // // import CreateRideRequest from './pages/CreateRideRequest';
// // // import ViewBids from './pages/ViewBids';
// // // import DriverRequests from './pages/DriverRequests';
// // // import SubmitBid from './pages/SubmitBid';
// // // import {RideRatingPage} from './pages/RideRatingPage';
// // // import ProfilePage from './pages/ProfilePage';
// // // import DriverDashboard from "./pages/DriverDashboard";
// // // import ActiveRide from './pages/ActiveRideDriver';
// // // import RiderActiveRide from './pages/RiderActiveRide';

// // // // Components
// // // import BottomNav from './components/BottomNav';
// // // import ProtectedRoute from './components/ProtectedRoute';

// // // // Utils
// // // import { getAuthFromCookies, saveAuthToCookies, clearAuthData } from '../src/utils/CookieUtils';
// // // //
// // // // Styles
// // // import './App.css';

// // // // Socket connection
// // // let socket = null;

// // // function App() {
// // //   const [auth, setAuth] = useState(() => {
// // //     return getAuthFromCookies() || {
// // //       token: null,
// // //       refreshToken: null,
// // //       userId: null,
// // //       userRole: null,
// // //       driverId: null
// // //     };
// // //   });

// // //   useEffect(() => {
// // //     if (auth.token && auth.userId) {
// // //       socket = io('http://localhost:5000', {
// // //         auth: { token: auth.token }
// // //       });

// // //       socket.on('connect', () => {
// // //         console.log('✅ Socket connected');
// // //         socket.emit('authenticate', {
// // //           userId: auth.userId,
// // //           role: auth.userRole,
// // //           driverId: auth.driverId
// // //         });
// // //       });

// // //       socket.on('disconnect', () => {
// // //         console.log('❌ Socket disconnected');
// // //       });

// // //       socket.on('connect_error', (error) => {
// // //         console.error('Socket connection error:', error);
// // //       });

// // //       return () => {
// // //         if (socket) {
// // //           socket.disconnect();
// // //           socket = null;
// // //         }
// // //       };
// // //     }
// // //   }, [auth.token, auth.userId, auth.userRole, auth.driverId]);

// // //   const handleLogin = (data) => {
// // //     console.log('handleLogin called with:', data);

// // //     const authData = {
// // //       token: data.token || data.accessToken,
// // //       refreshToken: data.refreshToken,
// // //       userId: data.userId,
// // //       userRole: data.role,
// // //       driverId: data.driverId
// // //     };

// // //     saveAuthToCookies(authData);
// // //     setAuth(authData);
// // //     console.log('Auth state updated:', authData);
// // //   };

// // //   const handleLogout = () => {
// // //     console.log('Logging out...');

// // //     if (socket) {
// // //       socket.disconnect();
// // //       socket = null;
// // //     }

// // //     clearAuthData();

// // //     setAuth({
// // //       token: null,
// // //       refreshToken: null,
// // //       userId: null,
// // //       userRole: null,
// // //       driverId: null
// // //     });

// // //     console.log('Logout complete');
// // //   };

// // //   useEffect(() => {
// // //     console.log('Auth state changed:', auth);
// // //   }, [auth]);

// // //   return (
// // //     <div className="app-container">
// // //       <Routes>
// // //         <Route path="/" element={<HomePage />} />

// // //         <Route
// // //           path="/login"
// // //           element={
// // //             auth.token ? (
// // //               <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
// // //             ) : (
// // //               <LoginPage onLogin={handleLogin} />
// // //             )
// // //           }
// // //         />

// // //         <Route
// // //           path="/register"
// // //           element={
// // //             auth.token ? (
// // //               <Navigate to={auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard'} replace />
// // //             ) : (
// // //               <RegisterPage onRegister={handleLogin} />
// // //             )
// // //           }
// // //         />

// // //         {/* Rider Routes */}
// // //         <Route
// // //           path="/rider/dashboard"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="rider">
// // //               <RiderDashboard auth={auth} onLogout={handleLogout} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/rider/create-ride"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="rider">
// // //               <CreateRideRequest auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/rider/view-bids/:requestId"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="rider">
// // //               <ViewBids auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/rider/active-ride/:rideId"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="rider">
// // //               <RiderActiveRide auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/rider/profile"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="rider">
// // //               <ProfilePage auth={auth} onLogout={handleLogout} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         {/* Driver Routes */}
// // //         <Route
// // //           path="/driver/dashboard"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="driver">
// // //               <DriverDashboard auth={auth} onLogout={handleLogout} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/driver/requests"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="driver">
// // //               <DriverRequests auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/driver/submit-bid/:requestId"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="driver">
// // //               <SubmitBid auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/driver/active-ride/:rideId"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="driver">
// // //               <ActiveRide auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/driver/profile"
// // //           element={
// // //             <ProtectedRoute auth={auth} requiredRole="driver">
// // //               <ProfilePage auth={auth} onLogout={handleLogout} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route
// // //           path="/rating/:rideId"
// // //           element={
// // //             <ProtectedRoute auth={auth}>
// // //               <RideRatingPage auth={auth} />
// // //             </ProtectedRoute>
// // //           }
// // //         />

// // //         <Route path="*" element={<Navigate to="/" replace />} />
// // //       </Routes>

// // //       {auth.token && <BottomNav userRole={auth.userRole} />}
// // //     </div>
// // //   );
// // // }

// // // export default App;

// import React, { useState } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// // Context
// import { SocketProvider } from "./context/SocketContext";

// // Pages
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import RiderDashboard from "./pages/RiderDashboard";
// import CreateRideRequest from "./pages/CreateRideRequest";
// import ViewBids from "./pages/ViewBids";
// import DriverRequests from "./pages/DriverRequests";
// import SubmitBid from "./pages/SubmitBid";
// import { RideRatingPage } from "./pages/RideRatingPage";
// import ProfilePage from "./pages/ProfilePage";
// import DriverDashboard from "./pages/DriverDashboard";
// import ActiveRide from "./pages/ActiveRideDriver";
// import RiderActiveRide from "./pages/RiderActiveRide";
// import KYCUploadPage from "./pages/KYCUploadPage";
// import ApplyForDriver from './pages/ApplyForDriver';

// // Components
// import BottomNav from "./components/BottomNav";
// import ProtectedRoute from "./components/ProtectedRoute";
// // At the top with other imports

// import {
//   getAuthFromCookies,
//   saveAuthToCookies,
//   clearAuthData,
// } from "./utils/CookieUtils.js";

// // Styles
// import "./App.css";
// import AdminKYCDashboard from "./pages/AdminDashboard";
// import AdminDashboard from "./pages/AdminDash.jsx";
// import RequireKYC from "./pages/RequireKyc.jsx";
// import PaymentMethodsPage from "./pages/PaymentMethodPage.jsx";

// function App() {
//   const [auth, setAuth] = useState(() => {
//     return (
//       getAuthFromCookies() || {
//         token: null,
//         refreshToken: null,
//         userId: null,
//         userRole: null,
//         driverId: null,
//       }
//     );
//   });

//   const handleLogin = (data) => {
//     console.log("handleLogin called with:", data);

//     const authData = {
//       token: data.token || data.accessToken,
//       refreshToken: data.refreshToken,
//       userId: data.userId,
//       userRole: data.role,
//       driverId: data.driverId,
//       user: {
//         id: data.userId,
//         role: data.role,
//       },
//     };

//     saveAuthToCookies(authData);
//     setAuth(authData);

//     console.log("Auth state updated:", authData);
//   };

//   const handleLogout = () => {
//     console.log("Logging out...");

//     clearAuthData();

//     setAuth({
//       token: null,
//       refreshToken: null,
//       userId: null,
//       userRole: null,
//       driverId: null,
//       user: null,
//     });

//     console.log("Logout complete");
//   };

//   return (
//     <SocketProvider auth={auth}>
//       <div className="app-container">
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route
//             path="/kyc-upload"
//             element={
//               <ProtectedRoute auth={auth}>
//                 <KYCUploadPage />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/kyc"
//             element={
//               <ProtectedRoute auth={auth}>
//                 <AdminKYCDashboard />
//               </ProtectedRoute>
//             }
//           />
//           {/* Admin Routes */}
//           <Route
//             path="/admin/dashboard"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="admin">
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin/kyc"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="admin">
//                 <AdminKYCDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/login"
//             element={
//               auth.token ? (
//                 <Navigate
//                   to={
//                     auth.userRole === "admin"
//                       ? "/admin/dashboard"
//                       : auth.userRole === "rider"
//                         ? "/rider/dashboard"
//                         : "/driver/dashboard"
//                   }
//                   replace
//                 />
//               ) : (
//                 <LoginPage onLogin={handleLogin} />
//               )
//             }
//           />

//           <Route
//             path="/register"
//             element={
//               auth.token ? (
//                 <Navigate
//                   to={
//                     auth.userRole === "rider"
//                       ? "/rider/dashboard"
//                       : "/driver/dashboard"
//                   }
//                   replace
//                 />
//               ) : (
//                 <RegisterPage onRegister={handleLogin} />
//               )
//             }
//           />

//           {/* Rider Routes */}
//           <Route
//             path="/rider/dashboard"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="rider">
               

//                 <RiderDashboard auth={auth} onLogout={handleLogout} />
            
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/rider/create-ride"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="rider">
//                 <RequireKYC>

//                 <CreateRideRequest auth={auth} />
//                 </RequireKYC>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/rider/view-bids/:requestId"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="rider">
//                 <ViewBids auth={auth} />
//               </ProtectedRoute>
//             }
//           />

       


//           <Route
//             path="/rider/requests/:requestId/bids"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="rider">
//                 <ViewBids auth={auth} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/rider/active-ride/:rideId"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="rider">
//                 <RiderActiveRide auth={auth} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/rider/profile"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="rider">
//                 <ProfilePage auth={auth} onLogout={handleLogout} />
//               </ProtectedRoute>
//             }
//           />

//           {/* Driver Routes */}
//           <Route
//             path="/driver/dashboard"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="driver">
//                 <DriverDashboard auth={auth} onLogout={handleLogout} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/driver/requests"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="driver">
//                 <DriverRequests auth={auth} />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/apply-driver"
//             element={
//               <ProtectedRoute auth={auth}>
//                 <ApplyForDriver />
//               </ProtectedRoute>
//             }
//           />

//               <Route
//             path="/payment-methods"
//             element={
//               <ProtectedRoute auth={auth}>
//                 <PaymentMethodsPage />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/driver/submit-bid/:requestId"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="driver">
//                 <SubmitBid auth={auth} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/driver/requests/:requestId/bid"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="driver">
//                 <SubmitBid auth={auth} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/driver/active-ride/:rideId"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="driver">
//                 <ActiveRide auth={auth} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/driver/profile"
//             element={
//               <ProtectedRoute auth={auth} requiredRole="driver">
//                 <ProfilePage auth={auth} onLogout={handleLogout} />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/rating/:rideId"
//             element={
//               <ProtectedRoute auth={auth}>
//                 <RideRatingPage auth={auth} />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>

//         {/* {auth.token && <BottomNav userRole={auth.userRole} />}
//          */}

//         {auth.token &&
//           !window.location.pathname.includes("/kyc-upload") &&
//           !window.location.pathname.includes("/admin") &&
//           !window.location.pathname.includes("/apply-driver") &&
//           !window.location.pathname.includes("/user") &&  (
//             <BottomNav userRole={auth.userRole} />
//           )}
//       </div>
//     </SocketProvider>
//   );
// }

// export default App;

// ─────────────────────────────────────────────────────────────
// SPRINT 7 — new App (all old code above is commented out)
// ─────────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import PhoneFrame from './components/PhoneFrame';

// Auth
import SplashPage      from './pages/auth/SplashPage';
import LoginPage       from './pages/auth/LoginPage';
import NameEntryPage   from './pages/auth/NameEntryPage';
import AdminLoginPage  from './pages/auth/AdminLoginPage';

// Rider
import RiderHome         from './pages/rider/RiderHome';
import DestinationPicker from './pages/rider/DestinationPicker';
import VehicleSelect     from './pages/rider/VehicleSelect';
import WaitingForBids    from './pages/rider/WaitingForBids';
import RideInProgress    from './pages/rider/RideInProgress';
import RideReview        from './pages/rider/RideReview';

// Driver
import DriverHome       from './pages/driver/DriverHome';
import DriverActiveRide from './pages/driver/DriverActiveRide';
import DriverEarnings   from './pages/driver/DriverEarnings';

// Shared
import WalletPage        from './pages/shared/WalletPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage       from './pages/shared/ProfilePage';

// Legal
import PrivacyPolicy  from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';

// Admin
import AdminLayout     from './pages/admin/AdminLayout';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminKYC        from './pages/admin/AdminKYC';
import AdminDriverApps from './pages/admin/AdminDriverApps';
import AdminLiveMap    from './pages/admin/AdminLiveMap';
import AdminPayouts    from './pages/admin/AdminPayouts';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminAnalytics    from './pages/admin/AdminAnalytics';
import AdminSurge        from './pages/admin/AdminSurge';
import AdminPerformance  from './pages/admin/AdminPerformance';

function RequireAuth({ children, role: requiredRole }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function RequireGuest({ children }) {
  const { token, role } = useAuthStore();
  if (token) return <Navigate to={role === 'driver' ? '/driver' : role === 'admin' ? '/admin' : '/rider'} replace />;
  return children;
}

function PhonePage({ children, hideNav }) {
  return <PhoneFrame hideNav={hideNav}>{children}</PhoneFrame>;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '13px', maxWidth: '340px' },
          duration: 3000,
        }}
      />

      <Routes>
        {/* Splash */}
        <Route path="/" element={<PhonePage hideNav><SplashPage /></PhonePage>} />

        {/* Auth */}
        <Route path="/login" element={<RequireGuest><PhonePage hideNav><LoginPage /></PhonePage></RequireGuest>} />
        <Route path="/name"  element={<RequireAuth><PhonePage hideNav><NameEntryPage /></PhonePage></RequireAuth>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Rider */}
        <Route path="/rider"                    element={<RequireAuth role="rider"><PhonePage><RiderHome /></PhonePage></RequireAuth>} />
        <Route path="/rider/destination"         element={<RequireAuth role="rider"><PhonePage hideNav><DestinationPicker /></PhonePage></RequireAuth>} />
        <Route path="/rider/vehicles"            element={<RequireAuth role="rider"><PhonePage hideNav><VehicleSelect /></PhonePage></RequireAuth>} />
        <Route path="/rider/waiting/:requestId"  element={<RequireAuth role="rider"><PhonePage hideNav><WaitingForBids /></PhonePage></RequireAuth>} />
        <Route path="/rider/ride/:rideId"        element={<RequireAuth role="rider"><PhonePage hideNav><RideInProgress /></PhonePage></RequireAuth>} />
        <Route path="/rider/review/:rideId"      element={<RequireAuth role="rider"><PhonePage hideNav><RideReview /></PhonePage></RequireAuth>} />
        <Route path="/rider/wallet"              element={<RequireAuth role="rider"><PhonePage><WalletPage /></PhonePage></RequireAuth>} />
        <Route path="/rider/notifications"       element={<RequireAuth role="rider"><PhonePage><NotificationsPage /></PhonePage></RequireAuth>} />
        <Route path="/rider/profile"             element={<RequireAuth role="rider"><PhonePage><ProfilePage /></PhonePage></RequireAuth>} />

        {/* Driver */}
        <Route path="/driver"              element={<RequireAuth role="driver"><PhonePage><DriverHome /></PhonePage></RequireAuth>} />
        <Route path="/driver/ride/:rideId" element={<RequireAuth role="driver"><PhonePage hideNav><DriverActiveRide /></PhonePage></RequireAuth>} />
        <Route path="/driver/earnings"     element={<RequireAuth role="driver"><PhonePage><DriverEarnings /></PhonePage></RequireAuth>} />
        <Route path="/driver/wallet"       element={<RequireAuth role="driver"><PhonePage><WalletPage /></PhonePage></RequireAuth>} />
        <Route path="/driver/notifications"element={<RequireAuth role="driver"><PhonePage><NotificationsPage /></PhonePage></RequireAuth>} />
        <Route path="/driver/profile"      element={<RequireAuth role="driver"><PhonePage><ProfilePage /></PhonePage></RequireAuth>} />

        {/* Admin */}
        <Route path="/admin"         element={<RequireAuth role="admin"><AdminLayout><AdminDashboard /></AdminLayout></RequireAuth>} />
        <Route path="/admin/kyc"     element={<RequireAuth role="admin"><AdminLayout><AdminKYC /></AdminLayout></RequireAuth>} />
        <Route path="/admin/drivers" element={<RequireAuth role="admin"><AdminLayout><AdminDriverApps /></AdminLayout></RequireAuth>} />
        <Route path="/admin/map"     element={<RequireAuth role="admin"><AdminLayout><AdminLiveMap /></AdminLayout></RequireAuth>} />
        <Route path="/admin/payouts" element={<RequireAuth role="admin"><AdminLayout><AdminPayouts /></AdminLayout></RequireAuth>} />
        <Route path="/admin/users"      element={<RequireAuth role="admin"><AdminLayout><AdminUsers /></AdminLayout></RequireAuth>} />
        <Route path="/admin/analytics"   element={<RequireAuth role="admin"><AdminLayout><AdminAnalytics /></AdminLayout></RequireAuth>} />
        <Route path="/admin/surge"       element={<RequireAuth role="admin"><AdminLayout><AdminSurge /></AdminLayout></RequireAuth>} />
        <Route path="/admin/performance" element={<RequireAuth role="admin"><AdminLayout><AdminPerformance /></AdminLayout></RequireAuth>} />

        {/* Legal — public, no auth, no phone frame */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms"   element={<TermsOfService />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
