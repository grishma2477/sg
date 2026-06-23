
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   MapPin,
//   Clock,
//   DollarSign,
//   Navigation,
//   TrendingUp,
//   Bell,
//   CheckCircle,
// } from "lucide-react";
// import io from "socket.io-client";

// const RiderDashboard = ({ auth, onLogout }) => {
//   const navigate = useNavigate();
//   const [requests, setRequests] = useState([]);
//   const [stats, setStats] = useState({
//     totalRides: 18,
//     totalSpent: 1821.55,
//     rating: 4.7,
//     activeRequests: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState(null);
//   const [notification, setNotification] = useState(null); // For showing notifications

//   // ═══════════════════════════════════════════════════════════════════════
//   // 🔥 SOCKET.IO: Initialize connection
//   // ═══════════════════════════════════════════════════════════════════════
//   useEffect(() => {
//     // ✅ NULL CHECK: Make sure auth and auth.user exist
//     if (!auth || !auth.user || !auth.user.id) {
//       console.error('❌ Auth object or user ID is missing');
//       return;
//     }

//     const newSocket = io("http://localhost:5000");
//     setSocket(newSocket);

//     // Authenticate socket with user ID
//     newSocket.emit("authenticate", {
//       userId: auth.user.id,
//       role: "rider",
//     });

//     console.log("🔌 Socket connected for rider:", auth.user.id);

//     return () => {
//       console.log("🔌 Socket disconnecting...");
//       newSocket.close();
//     };
//   }, [auth]);

//   // ═══════════════════════════════════════════════════════════════════════
//   // 🔥 SOCKET.IO: Listen for ride acceptance notifications
//   // ═══════════════════════════════════════════════════════════════════════
//   useEffect(() => {
//     if (!socket) return;

//     // Listen for ride accepted event
//     socket.on("ride:accepted", (data) => {
//       console.log("🎉 Ride accepted notification received:", data);
      
//       // ✅ NULL CHECK: Make sure data exists
//       if (!data) {
//         console.error('❌ Received empty data from ride:accepted event');
//         return;
//       }

//       // Show notification banner
//       setNotification({
//         type: 'success',
//         title: '🎉 Driver Accepted!',
//         message: data.message || 'A driver has accepted your ride!',
//         driverName: data.driver?.name || 'Your driver',
//         vehicleInfo: data.driver?.vehicleModel 
//           ? `${data.driver.vehicleModel} (${data.driver.licensePlate || ''})` 
//           : null,
//         rideId: data.rideId
//       });

//       // Update the requests list to reflect the accepted status
//       setRequests(prevRequests => 
//         prevRequests.map(request => {
//           // ✅ NULL CHECK: Make sure request and data have IDs
//           if (!request || !request.id || !data.requestId) {
//             return request;
//           }
          
//           if (request.id === data.requestId) {
//             return {
//               ...request,
//               status: 'accepted',
//               created_ride_id: data.rideId,
//               matched_driver: data.driver
//             };
//           }
//           return request;
//         })
//       );

//       // Auto-hide notification after 5 seconds
//       setTimeout(() => {
//         setNotification(null);
//       }, 5000);

//       // Optionally: Auto-redirect to active ride page after 3 seconds
//       if (data.rideId) {
//         setTimeout(() => {
//           navigate(`/rider/active-ride/${data.rideId}`);
//         }, 3000);
//       }
//     });

//     // Listen for ride started event
//     socket.on("ride:started", (data) => {
//       console.log("🚗 Ride started notification received:", data);
      
//       // ✅ NULL CHECK
//       if (!data) return;

//       setNotification({
//         type: 'info',
//         title: '🚗 Ride Started!',
//         message: data.message || 'Your driver has started the ride!',
//         rideId: data.rideId
//       });

//       // Update ride status
//       setRequests(prevRequests => 
//         prevRequests.map(request => {
//           if (request?.created_ride_id === data.rideId) {
//             return { ...request, status: 'in_progress' };
//           }
//           return request;
//         })
//       );

//       setTimeout(() => setNotification(null), 5000);
//     });

//     // Listen for ride completed event
//     socket.on("ride:completed", (data) => {
//       console.log("✅ Ride completed notification received:", data);
      
//       // ✅ NULL CHECK
//       if (!data) return;

//       setNotification({
//         type: 'success',
//         title: '✅ Ride Completed!',
//         message: data.message || 'Please rate your driver.',
//         rideId: data.rideId
//       });

//       // Update ride status
//       setRequests(prevRequests => 
//         prevRequests.map(request => {
//           if (request?.created_ride_id === data.rideId) {
//             return { ...request, status: 'completed' };
//           }
//           return request;
//         })
//       );

//       // Redirect to rating page
//       if (data.redirectTo) {
//         setTimeout(() => {
//           navigate(data.redirectTo);
//         }, 2000);
//       }
//     });

//     return () => {
//       socket.off("ride:accepted");
//       socket.off("ride:started");
//       socket.off("ride:completed");
//     };
//   }, [socket, navigate]);

//   // ═══════════════════════════════════════════════════════════════════════
//   // Fetch ride requests
//   // ═══════════════════════════════════════════════════════════════════════
//   useEffect(() => {
//     fetchRequests();
//     // Auto-refresh every 10 seconds
//     const interval = setInterval(fetchRequests, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       // ✅ NULL CHECK: Make sure auth and token exist
//       if (!auth || !auth.token) {
//         console.error('❌ Auth token is missing');
//         setLoading(false);
//         return;
//       }

//       const response = await fetch("http://localhost:5000/api/ride-requests", {
//         headers: {
//           Authorization: `Bearer ${auth.token}`,
//         },
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         // ✅ NULL CHECK: Make sure data.data is an array
//         const requestsData = Array.isArray(data.data) ? data.data : [];
//         setRequests(requestsData);
//         setStats((prev) => ({ 
//           ...prev, 
//           activeRequests: requestsData.length 
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     // ✅ NULL CHECK: Default to 'pending' if status is undefined
//     const safeStatus = status || 'pending';
    
//     const badges = {
//       pending: { class: "badge-warning", text: "Waiting for Bids" },
//       accepted: { class: "badge-success", text: "Driver Accepted" },
//       in_progress: { class: "badge-primary", text: "In Progress" },
//       completed: { class: "badge-secondary", text: "Completed" },
//     };
    
//     return badges[safeStatus] || { class: "badge-warning", text: safeStatus };
//   };

//   return (
//     <div className="p-4" style={{ paddingBottom: "5rem" }}>
//       {/* ═══════════════════════════════════════════════════════════════════ */}
//       {/* 🔔 Notification Banner */}
//       {/* ═══════════════════════════════════════════════════════════════════ */}
//       {notification && (
//         <div
//           style={{
//             position: "fixed",
//             top: "1rem",
//             left: "1rem",
//             right: "1rem",
//             zIndex: 1000,
//             padding: "1rem",
//             borderRadius: "0.5rem",
//             background: notification.type === 'success' 
//               ? "linear-gradient(135deg, #10B981, #059669)"
//               : "linear-gradient(135deg, #3B82F6, #2563EB)",
//             color: "white",
//             boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
//             animation: "slideDown 0.3s ease-out",
//           }}
//         >
//           <div className="flex items-start justify-between">
//             <div className="flex items-start gap-3">
//               {notification.type === 'success' ? (
//                 <CheckCircle size={24} />
//               ) : (
//                 <Bell size={24} />
//               )}
//               <div>
//                 <div className="font-bold" style={{ fontSize: "1.125rem" }}>
//                   {notification.title}
//                 </div>
//                 <div style={{ marginTop: "0.25rem", opacity: 0.9 }}>
//                   {notification.message}
//                 </div>
//                 {notification.driverName && (
//                   <div style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
//                     Driver: <strong>{notification.driverName}</strong>
//                   </div>
//                 )}
//                 {notification.vehicleInfo && (
//                   <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
//                     Vehicle: {notification.vehicleInfo}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={() => setNotification(null)}
//               style={{
//                 background: "rgba(255,255,255,0.2)",
//                 border: "none",
//                 borderRadius: "50%",
//                 width: "2rem",
//                 height: "2rem",
//                 cursor: "pointer",
//                 color: "white",
//               }}
//             >
//               ✕
//             </button>
//           </div>
//           {notification.rideId && (
//             <button
//               onClick={() => {
//                 setNotification(null);
//                 navigate(`/rider/active-ride/${notification.rideId}`);
//               }}
//               style={{
//                 marginTop: "0.75rem",
//                 padding: "0.5rem 1rem",
//                 background: "rgba(255,255,255,0.3)",
//                 border: "1px solid rgba(255,255,255,0.5)",
//                 borderRadius: "0.375rem",
//                 color: "white",
//                 cursor: "pointer",
//                 width: "100%",
//                 fontWeight: "600",
//               }}
//             >
//               View Ride Details →
//             </button>
//           )}
//         </div>
//       )}

//       {/* Header */}
//       <div className="header">
//         <h1 className="header-title">Dashboard</h1>
//         <p className="text-dim mt-1">Your ride activity</p>
//       </div>

//       <div className="p-4">
//         {/* Stats Grid */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "1rem",
//             marginBottom: "1.5rem",
//           }}
//         >
//           <div
//             className="card p-3"
//             style={{
//               background:
//                 "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))",
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{ fontSize: "0.75rem" }}>
//                   Total Rides
//                 </div>
//                 <div
//                   className="font-bold"
//                   style={{ fontSize: "1.5rem", color: "#10B981" }}
//                 >
//                   {stats.totalRides}
//                 </div>
//               </div>
//               <TrendingUp size={32} color="#10B981" style={{ opacity: 0.5 }} />
//             </div>
//           </div>

//           <div
//             className="card p-3"
//             style={{
//               background:
//                 "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))",
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{ fontSize: "0.75rem" }}>
//                   Total Spent
//                 </div>
//                 <div
//                   className="font-bold"
//                   style={{ fontSize: "1.5rem", color: "#8B5CF6" }}
//                 >
//                   ₹{stats.totalSpent}
//                 </div>
//               </div>
//               <DollarSign size={32} color="#8B5CF6" style={{ opacity: 0.5 }} />
//             </div>
//           </div>

//           <div
//             className="card p-3"
//             style={{
//               background:
//                 "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))",
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{ fontSize: "0.75rem" }}>
//                   Rating
//                 </div>
//                 <div
//                   className="font-bold"
//                   style={{ fontSize: "1.5rem", color: "#F59E0B" }}
//                 >
//                   {stats.rating}/5.0
//                 </div>
//               </div>
//               <div style={{ fontSize: "2rem" }}>⭐</div>
//             </div>
//           </div>

//           <div
//             className="card p-3"
//             style={{
//               background:
//                 "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))",
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{ fontSize: "0.75rem" }}>
//                   Active
//                 </div>
//                 <div
//                   className="font-bold"
//                   style={{ fontSize: "1.5rem", color: "#06B6D4" }}
//                 >
//                   {stats.activeRequests}
//                 </div>
//               </div>
//               <Navigation size={32} color="#06B6D4" style={{ opacity: 0.5 }} />
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="mb-4">
//           <button
//             className="btn btn-primary w-full"
//             style={{ padding: "1.5rem", fontSize: "1.125rem" }}
//             onClick={() => navigate("/rider/create-ride")}
//           >
//             <Navigation size={24} />
//             Request New Ride
//           </button>
//         </div>

//         {/* Active Requests */}
//         <div>
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-bold" style={{ fontSize: "1.25rem" }}>
//               Your Requests
//             </h3>
//             {loading && <span className="loading"></span>}
//           </div>

//           {requests.length === 0 ? (
//             <div className="card text-center p-4">
//               <MapPin
//                 size={48}
//                 style={{ margin: "0 auto", opacity: 0.3, marginBottom: "1rem" }}
//               />
//               <p className="text-dim">No active ride requests</p>
//               <button
//                 className="btn btn-primary mt-3"
//                 onClick={() => navigate("/rider/create-ride")}
//               >
//                 Create Your First Ride
//               </button>
//             </div>
//           ) : (
//             requests.map((request) => {
//               // ✅ NULL CHECK: Skip if request is null/undefined
//               if (!request) return null;
              
//               const statusBadge = getStatusBadge(request.status);
              
//               return (
//                 <div key={request.id} className="card mb-3">
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <div className={`badge ${statusBadge.class}`}>
//                         {statusBadge.text}
//                       </div>
//                       <div
//                         className="text-dim"
//                         style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}
//                       >
//                         {/* ✅ NULL CHECK: Make sure created_at exists */}
//                         Created {request.created_at 
//                           ? new Date(request.created_at).toLocaleString()
//                           : 'Recently'}
//                       </div>
//                     </div>
//                     {request.pricing_mode === "bidding" &&
//                       request.status === "pending" && (
//                         <button
//                           className="btn btn-primary"
//                           style={{
//                             padding: "0.5rem 1rem",
//                             fontSize: "0.875rem",
//                           }}
//                           onClick={() =>
//                             navigate(`/rider/view-bids/${request.id}`)
//                           }
//                         >
//                           View Bids
//                         </button>
//                       )}
//                     {request.status === "accepted" &&
//                       request.created_ride_id && (
//                         <button
//                           className="btn btn-success"
//                           style={{
//                             padding: "0.5rem 1rem",
//                             fontSize: "0.875rem",
//                           }}
//                           onClick={() =>
//                             navigate(
//                               `/rider/active-ride/${request.created_ride_id}`
//                             )
//                           }
//                         >
//                           View Ride
//                         </button>
//                       )}
//                   </div>

//                   <div className="mb-2">
//                     <div className="flex items-start gap-2 mb-2">
//                       <div
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           borderRadius: "50%",
//                           background: "#10B981",
//                           marginTop: "0.5rem",
//                           flexShrink: 0,
//                         }}
//                       ></div>
//                       <div>
//                         <div
//                           className="text-dim"
//                           style={{ fontSize: "0.75rem" }}
//                         >
//                           PICKUP
//                         </div>
//                         <div className="font-bold">
//                           {/* ✅ NULL CHECK */}
//                           {request.pickup_address || "Not specified"}
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       style={{
//                         width: "1px",
//                         height: "20px",
//                         background: "rgba(148, 163, 184, 0.3)",
//                         marginLeft: "3px",
//                         marginBottom: "0.5rem",
//                       }}
//                     ></div>

//                     <div className="flex items-start gap-2">
//                       <div
//                         style={{
//                           width: "8px",
//                           height: "8px",
//                           borderRadius: "50%",
//                           background: "#EF4444",
//                           marginTop: "0.5rem",
//                           flexShrink: 0,
//                         }}
//                       ></div>
//                       <div>
//                         <div
//                           className="text-dim"
//                           style={{ fontSize: "0.75rem" }}
//                         >
//                           DROPOFF
//                         </div>
//                         <div className="font-bold">
//                           {/* ✅ NULL CHECK */}
//                           {request.dropoff_address || "Not specified"}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     style={{
//                       display: "flex",
//                       gap: "1rem",
//                       marginTop: "1rem",
//                       paddingTop: "1rem",
//                       borderTop: "1px solid rgba(148, 163, 184, 0.1)",
//                     }}
//                   >
//                     {request.estimated_duration_minutes && (
//                       <div className="flex items-center gap-1">
//                         <Clock size={16} color="#94A3B8" />
//                         <span
//                           className="text-dim"
//                           style={{ fontSize: "0.875rem" }}
//                         >
//                           {request.estimated_duration_minutes} min
//                         </span>
//                       </div>
//                     )}
//                     {request.estimated_distance_km && (
//                       <div className="flex items-center gap-1">
//                         <Navigation size={16} color="#94A3B8" />
//                         <span
//                           className="text-dim"
//                           style={{ fontSize: "0.875rem" }}
//                         >
//                           {request.estimated_distance_km} km
//                         </span>
//                       </div>
//                     )}
//                     {request.estimated_fare_min &&
//                       request.estimated_fare_max && (
//                         <div className="flex items-center gap-1">
//                           <DollarSign size={16} color="#94A3B8" />
//                           <span
//                             className="text-dim"
//                             style={{ fontSize: "0.875rem" }}
//                           >
//                             ₹{request.estimated_fare_min} - ₹
//                             {request.estimated_fare_max}
//                           </span>
//                         </div>
//                       )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* Add animation for notification */}
//       <style>{`
//         @keyframes slideDown {
//           from {
//             transform: translateY(-100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RiderDashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  FileText,
  Loader2
} from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { getToken } from '../utils/CookieUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RiderDashboard = ({ auth, onLogout }) => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSpent: 0,
    rating: 0,
    activeRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // KYC State
  const [kycStatus, setKycStatus] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);

  // ═══════════════════════════════════════════════════════════════
  // CHECK KYC STATUS ON MOUNT
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    checkKYCStatus();
  }, []);

  const checkKYCStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/kyc/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('📋 KYC Status:', data);
      
      if (data.success) {
        setKycStatus(data.data);
      }
    } catch (error) {
      console.error('❌ Failed to check KYC:', error);
    } finally {
      setKycLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // SOCKET EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // Only set up socket listeners if KYC is verified
    if (!socket || !kycStatus?.isVerified) return;

    console.log('🔌 Setting up socket listeners for rider...');

    socket.on('ride:bid:new', (bidData) => {
      console.log('💰 New bid received:', bidData);
      
      showNotification({
        type: 'success',
        title: '💰 New Bid Received!',
        message: `Driver bid ₹${bidData.bidAmount} - ETA ${bidData.estimatedArrival || 10} min`,
        requestId: bidData.requestId
      });

      fetchRequests();
    });

    socket.on('ride:bid:accepted:confirmed', (data) => {
      console.log('🎉 Bid acceptance confirmed:', data);
      
      showNotification({
        type: 'success',
        title: '🎉 Ride Confirmed!',
        message: 'Your driver is on the way!',
        rideId: data.rideId
      });

      setRequests(prev => prev.map(req => 
        req.id === data.requestId 
          ? { ...req, status: 'accepted', ride_id: data.rideId }
          : req
      ));
    });

    socket.on('ride:status:changed', (data) => {
      console.log('🔄 Ride status changed:', data);
      
      if (data.status === 'in_progress') {
        showNotification({
          type: 'info',
          title: '🚗 Ride Started!',
          message: 'Your driver has picked you up',
          rideId: data.rideId
        });
      } else if (data.status === 'completed') {
        showNotification({
          type: 'success',
          title: '✅ Ride Completed!',
          message: 'Please rate your driver',
          rideId: data.rideId
        });
      }

      fetchRequests();
    });

    // ✅ Listen for KYC status updates
    socket.on('kyc:status_update', (data) => {
      console.log('🔔 KYC Status Update:', data);
      showNotification({
        type: data.approved ? 'success' : 'error',
        title: data.approved ? '✅ KYC Approved!' : '❌ KYC Rejected',
        message: data.message
      });
      checkKYCStatus(); // Refresh KYC status
    });

    return () => {
      console.log('🧹 Cleaning up rider socket listeners');
      socket.off('ride:bid:new');
      socket.off('ride:bid:accepted:confirmed');
      socket.off('ride:status:changed');
      socket.off('kyc:status_update');
    };
  }, [socket, kycStatus]);

  // ═══════════════════════════════════════════════════════════════
  // FETCH RIDE REQUESTS (only if KYC verified)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (kycStatus?.isVerified) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [kycStatus]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ride-requests`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setRequests(data.data || []);
        const activeCount = (data.data || []).filter(
          r => r.status === 'pending' || r.status === 'accepted'
        ).length;
        setStats((prev) => ({ ...prev, activeRequests: activeCount }));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (notif) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), 5000);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "badge-warning", text: "⏳ Waiting for Bids", color: "#F59E0B" },
      accepted: { class: "badge-success", text: "✅ Driver Matched", color: "#10B981" },
      in_progress: { class: "badge-primary", text: "🚗 In Progress", color: "#06B6D4" },
      completed: { class: "badge-secondary", text: "✓ Completed", color: "#94A3B8" },
      cancelled: { class: "badge-error", text: "✗ Cancelled", color: "#EF4444" }
    };
    return badges[status] || { class: "badge-warning", text: status, color: "#94A3B8" };
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (kycLoading) {
    return (
      <div className="p-4" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin" style={{ margin: '0 auto', marginBottom: '1rem', color: '#3B82F6' }} />
          <p className="text-dim">Checking your verification status...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: KYC NOT STARTED - BLOCK EVERYTHING
  // ═══════════════════════════════════════════════════════════════
  if (!kycStatus?.kycExists || !kycStatus?.isComplete) {
    return (
      <div className="p-4" style={{ minHeight: '100vh' }}>
        <div className="header">
          <h1 className="header-title">My Rides</h1>
          <p className="text-dim mt-1">Complete KYC to book rides</p>
        </div>

        <div className="p-4">
          {/* KYC Required Card */}
          <div className="card text-center" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
            border: '2px solid #EF4444',
            padding: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={40} color="white" />
            </div>

            <h2 className="font-bold mb-3" style={{ fontSize: '1.5rem' }}>
              KYC Verification Required
            </h2>
            
            <p className="text-dim mb-6" style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              To book rides and use our platform, you need to complete your KYC verification. 
              This helps us ensure the safety of all our users.
            </p>

            <button
              onClick={() => navigate('/kyc-upload')}
              className="btn btn-primary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <FileText size={20} />
              Complete KYC Now
            </button>
          </div>

          {/* What You'll Need */}
          <div className="card mt-4">
            <h3 className="font-bold mb-3">📋 What You'll Need:</h3>
            <ul className="space-y-2 text-dim" style={{ fontSize: '0.875rem' }}>
              <li>✓ Personal Information (Name, DOB, Address)</li>
              <li>✓ National ID / Citizenship / Passport</li>
              <li>✓ A Clear Selfie</li>
              <li>✓ Document Photos (Front & Back)</li>
            </ul>
          </div>

          {/* Process Steps */}
          <div className="card mt-4">
            <h3 className="font-bold mb-3">🚀 Verification Process:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: '#10B981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  color: 'white'
                }}>1</div>
                <div>
                  <div className="font-bold" style={{ fontSize: '0.875rem' }}>Complete KYC Form</div>
                  <div className="text-dim" style={{ fontSize: '0.75rem' }}>Fill in your details and upload documents</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: '#3B82F6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  color: 'white'
                }}>2</div>
                <div>
                  <div className="font-bold" style={{ fontSize: '0.875rem' }}>Admin Review</div>
                  <div className="text-dim" style={{ fontSize: '0.75rem' }}>Our team will verify your documents (24-72 hours)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: '#8B5CF6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  color: 'white'
                }}>3</div>
                <div>
                  <div className="font-bold" style={{ fontSize: '0.875rem' }}>Start Riding!</div>
                  <div className="text-dim" style={{ fontSize: '0.75rem' }}>Once approved, you can book rides instantly</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: KYC PENDING VERIFICATION - BLOCK EVERYTHING
  // ═══════════════════════════════════════════════════════════════
  if (kycStatus?.isComplete && !kycStatus?.isVerified) {
    return (
      <div className="p-4" style={{ minHeight: '100vh' }}>
        <div className="header">
          <h1 className="header-title">My Rides</h1>
          <p className="text-dim mt-1">Verification in progress</p>
        </div>

        <div className="p-4">
          {/* Pending Verification Card */}
          <div className="card text-center" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
            border: '2px solid #F59E0B',
            padding: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <Clock size={40} color="white" />
            </div>

            <h2 className="font-bold mb-3" style={{ fontSize: '1.5rem' }}>
              KYC Under Review
            </h2>
            
            <p className="text-dim mb-6" style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Thank you for submitting your KYC documents! 
              Our team is currently reviewing your application.
            </p>

            <div style={{
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.875rem',
              textAlign: 'left'
            }}>
              <div className="font-bold mb-1">⏱️ Expected Timeline:</div>
              <div className="text-dim">
                Verification typically takes 24-72 hours. 
                We'll notify you once approved!
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="card mt-4">
            <h3 className="font-bold mb-3">🔍 What Happens Next:</h3>
            <ul className="space-y-2 text-dim" style={{ fontSize: '0.875rem' }}>
              <li>✓ Our team reviews your documents</li>
              <li>✓ We verify your identity and information</li>
              <li>✓ You'll receive notification once approved</li>
              <li>✓ You can then book rides instantly</li>
            </ul>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: KYC VERIFIED - SHOW FULL DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="p-4" style={{ paddingBottom: "5rem" }}>
      {/* Header */}
      <div className="header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="header-title">My Rides</h1>
            <p className="text-dim mt-1">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
          <button
            onClick={() => navigate('/rider/create-ride')}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <Plus size={20} />
            New Ride
          </button>
        </div>
      </div>

      {/* KYC Verified Badge */}
      <div className="p-4">
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
          border: '2px solid #10B981',
          padding: '0.75rem'
        }}>
          <div className="flex items-center gap-2">
            <CheckCircle size={20} color="#10B981" />
            <div className="font-bold" style={{ color: '#059669', fontSize: '0.875rem' }}>
              ✅ KYC Verified - Ready to Book Rides
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div 
          className="card mb-4"
          style={{
            background: notification.type === 'success' 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
            border: `2px solid ${notification.type === 'success' ? '#10B981' : '#3B82F6'}`,
            position: 'relative',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <button
            onClick={dismissNotification}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8'
            }}
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle size={24} color="#10B981" />
            ) : (
              <AlertCircle size={24} color="#3B82F6" />
            )}
            <div>
              <div className="font-bold mb-1">{notification.title}</div>
              <div className="text-dim" style={{ fontSize: '0.875rem' }}>
                {notification.message}
              </div>
              {notification.requestId && (
                <button
                  onClick={() => navigate(`/rider/requests/${notification.requestId}/bids`)}
                  className="btn btn-primary mt-2"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  View Bids
                </button>
              )}
              {notification.rideId && (
                <button
                  onClick={() => navigate(`/rider/active-ride/${notification.rideId}`)}
                  className="btn btn-primary mt-2"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  View Ride
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="card p-3"
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: "0.75rem" }}>
                  ACTIVE REQUESTS
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "#10B981" }}
                >
                  {stats.activeRequests}
                </div>
              </div>
              <TrendingUp size={32} color="#10B981" style={{ opacity: 0.5 }} />
            </div>
          </div>

          <div
            className="card p-3"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: "0.75rem" }}>
                  TOTAL RIDES
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "#8B5CF6" }}
                >
                  {requests.filter(r => r.status === 'completed').length}
                </div>
              </div>
              <DollarSign size={32} color="#8B5CF6" style={{ opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Ride Requests List */}
        <div className="mb-3">
          <h2 className="font-bold mb-3" style={{ fontSize: "1.25rem" }}>
            Recent Requests
          </h2>

          {loading ? (
            <div className="text-center p-4">
              <span className="loading"></span>
            </div>
          ) : requests.length === 0 ? (
            <div className="card text-center p-4">
              <MapPin size={48} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '1rem' }} />
              <p className="text-dim">No ride requests yet</p>
              <button
                onClick={() => navigate('/rider/create-ride')}
                className="btn btn-primary mt-3"
              >
                <Plus size={20} />
                Create Your First Ride
              </button>
            </div>
          ) : (
            requests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              
              return (
                <div key={request.id} className="card mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: `${statusBadge.color}20`,
                        color: statusBadge.color,
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {statusBadge.text}
                    </div>
                    <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#10B981',
                          marginTop: '6px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                          PICKUP
                        </div>
                        <div className="font-bold">{request.pickup_address}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '2px',
                        height: '20px',
                        background: '#475569',
                        marginLeft: '3px',
                        marginBottom: '0.5rem'
                      }}
                    />

                    <div className="flex items-start gap-2">
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#EF4444',
                          marginTop: '6px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                          DROPOFF
                        </div>
                        <div className="font-bold">{request.dropoff_address}</div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                        DISTANCE
                      </div>
                      <div className="font-bold">
                        {request.estimated_distance_km} km
                      </div>
                    </div>
                    <div>
                      <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                        EST. FARE
                      </div>
                      <div className="font-bold" style={{ color: '#10B981' }}>
                        NPR {request.estimated_total}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mb-3">
                      <div
                        style={{
                          padding: '0.75rem',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            💰 {request.bid_count || 0} Bids Received
                          </span>
                          {request.bid_count > 0 && (
                            <div
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: '#8B5CF6',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                animation: 'pulse 2s infinite'
                              }}
                            >
                              NEW
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <button
                      onClick={() => navigate(`/rider/requests/${request.id}/bids`)}
                      className="btn btn-primary w-full"
                      disabled={!request.bid_count || request.bid_count === 0}
                    >
                      <Eye size={20} />
                      View Bids {request.bid_count > 0 && `(${request.bid_count})`}
                    </button>
                  )}

                  {request.status === 'accepted' && request.ride_id && (
                    <button
                      onClick={() => navigate(`/rider/active-ride/${request.ride_id}`)}
                      className="btn btn-success w-full"
                    >
                      <MapPin size={20} />
                      Track Ride
                    </button>
                  )}

                  {request.status === 'completed' && request.ride_id && (
                    <button
                      onClick={() => navigate(`/rider/ride/${request.ride_id}/rate`)}
                      className="btn btn-secondary w-full"
                    >
                      <TrendingUp size={20} />
                      Rate Driver
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default RiderDashboard;