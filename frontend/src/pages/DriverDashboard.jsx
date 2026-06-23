

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   MapPin,
//   DollarSign,
//   Clock,
//   User,
//   TrendingUp,
//   Eye,
//   X,
//   CheckCircle,
//   AlertCircle
// } from 'lucide-react';
// import { useSocket } from '../context/SocketContext';

// const DriverDashboard = ({ auth, onLogout }) => {
//   const navigate = useNavigate();
//   const { socket, isConnected, driverId } = useSocket();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [notification, setNotification] = useState(null);
//   const [stats, setStats] = useState({
//     totalRides: 0,
//     totalEarnings: 0,
//     rating: 0,
//     activeBids: 0
//   });

//   // ═══════════════════════════════════════════════════════════════
//   // SOCKET EVENT LISTENERS
//   // ═══════════════════════════════════════════════════════════════
//   useEffect(() => {
//     if (!socket || !driverId) return;

//     console.log('🔌 Setting up socket listeners for driver...');
//     console.log('Driver ID:', driverId);

//     // Listen for new ride requests
//     socket.on('ride:request:new', (requestData) => {
//       console.log('🚗 New ride request received:', requestData);
      
//       showNotification({
//         type: 'info',
//         title: '🚗 New Ride Request!',
//         message: `${requestData.pickup_address} → ${requestData.dropoff_address}`,
//         requestId: requestData.id
//       });

//       // Add to requests list
//       setRequests(prev => [requestData, ...prev]);
//     });

//     // Listen for bid acceptance
//     socket.on('ride:bid:accepted', (data) => {
//       console.log('');
//       console.log('🎉🎉🎉 BID ACCEPTED NOTIFICATION RECEIVED 🎉🎉🎉');
//       console.log('Ride ID:', data.rideId);
//       console.log('Pickup:', data.pickup_address);
//       console.log('Dropoff:', data.dropoff_address);
//       console.log('Fare:', data.fare_amount);
      
//       showNotification({
//         type: 'success',
//         title: '🎉 Your Bid Was Accepted!',
//         message: `${data.rider_name || 'Rider'} accepted your bid of ₹${data.fare_amount}`,
//         rideId: data.rideId,
//         autoRedirect: true
//       });

//       // Auto-redirect to ride page after 2 seconds
//       setTimeout(() => {
//         navigate(`/driver/active-ride/${data.rideId}`);
//       }, 2000);
//     });

//     // Listen for bid rejection
//     socket.on('ride:bid:rejected', (data) => {
//       console.log('❌ Bid rejected:', data);
      
//       showNotification({
//         type: 'info',
//         title: 'Bid Not Selected',
//         message: 'The rider chose another driver for this ride',
//         requestId: data.requestId
//       });

//       // Remove from requests list
//       setRequests(prev => prev.filter(r => r.id !== data.requestId));
//     });

//     // Listen for ride status changes
//     socket.on('ride:status:changed', (data) => {
//       console.log('🔄 Ride status changed:', data);
      
//       if (data.status === 'completed') {
//         showNotification({
//           type: 'success',
//           title: '✅ Ride Completed!',
//           message: 'Great job! Check your earnings.',
//           rideId: data.rideId
//         });
//       }
//     });

//     return () => {
//       console.log('🧹 Cleaning up driver socket listeners');
//       socket.off('ride:request:new');
//       socket.off('ride:bid:accepted');
//       socket.off('ride:bid:rejected');
//       socket.off('ride:status:changed');
//     };
//   }, [socket, driverId, navigate]);

//   // ═══════════════════════════════════════════════════════════════
//   // FETCH RIDE REQUESTS
//   // ═══════════════════════════════════════════════════════════════
//   useEffect(() => {
//     fetchRequests();
//     // Refresh every 30 seconds as backup
//     const interval = setInterval(fetchRequests, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/ride-requests/nearby', {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         console.log(`✅ Fetched ${data.data?.length || 0} ride requests`);
//         setRequests(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════
//   // NOTIFICATION HELPER
//   // ═══════════════════════════════════════════════════════════════
//   const showNotification = (notif) => {
//     setNotification(notif);
//     if (!notif.autoRedirect) {
//       setTimeout(() => setNotification(null), 5000);
//     }
//   };

//   const dismissNotification = () => {
//     setNotification(null);
//   };

//   return (
//     <div className="p-4" style={{ paddingBottom: '5rem' }}>
//       {/* Header */}
//       <div className="header">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="header-title">Available Rides</h1>
//             <p className="text-dim mt-1">
//               {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
//               {driverId && ` • Driver ID: ${driverId}`}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Notification Banner */}
//       {notification && (
//         <div 
//           className="card mb-4"
//           style={{
//             background: notification.type === 'success' 
//               ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'
//               : notification.type === 'info'
//               ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))'
//               : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
//             border: `2px solid ${
//               notification.type === 'success' ? '#10B981' 
//               : notification.type === 'info' ? '#3B82F6'
//               : '#F59E0B'
//             }`,
//             position: 'relative',
//             animation: 'slideDown 0.3s ease-out'
//           }}
//         >
//           {!notification.autoRedirect && (
//             <button
//               onClick={dismissNotification}
//               style={{
//                 position: 'absolute',
//                 top: '0.5rem',
//                 right: '0.5rem',
//                 background: 'transparent',
//                 border: 'none',
//                 cursor: 'pointer',
//                 color: '#94A3B8'
//               }}
//             >
//               <X size={20} />
//             </button>
//           )}
          
//           <div className="flex items-start gap-3">
//             {notification.type === 'success' ? (
//               <CheckCircle size={24} color="#10B981" />
//             ) : (
//               <AlertCircle size={24} color={notification.type === 'info' ? '#3B82F6' : '#F59E0B'} />
//             )}
//             <div>
//               <div className="font-bold mb-1">{notification.title}</div>
//               <div className="text-dim" style={{ fontSize: '0.875rem' }}>
//                 {notification.message}
//               </div>
//               {notification.requestId && !notification.autoRedirect && (
//                 <button
//                   onClick={() => navigate(`/driver/requests/${notification.requestId}/bid`)}
//                   className="btn btn-primary mt-2"
//                   style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
//                 >
//                   View Request
//                 </button>
//               )}
//               {notification.rideId && !notification.autoRedirect && (
//                 <button
//                   onClick={() => navigate(`/driver/active-ride/${notification.rideId}`)}
//                   className="btn btn-primary mt-2"
//                   style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
//                 >
//                   View Ride
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="p-4">
//         {/* Stats Grid */}
//         <div
//           style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 1fr',
//             gap: '1rem',
//             marginBottom: '1.5rem',
//           }}
//         >
//           <div
//             className="card p-3"
//             style={{
//               background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{ fontSize: '0.75rem' }}>
//                   AVAILABLE RIDES
//                 </div>
//                 <div
//                   className="font-bold"
//                   style={{ fontSize: '1.5rem', color: '#10B981' }}
//                 >
//                   {requests.length}
//                 </div>
//               </div>
//               <MapPin size={32} color="#10B981" style={{ opacity: 0.5 }} />
//             </div>
//           </div>

//           <div
//             className="card p-3"
//             style={{
//               background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{ fontSize: '0.75rem' }}>
//                   ACTIVE BIDS
//                 </div>
//                 <div
//                   className="font-bold"
//                   style={{ fontSize: '1.5rem', color: '#8B5CF6' }}
//                 >
//                   {requests.filter(r => r.has_submitted_bid).length}
//                 </div>
//               </div>
//               <DollarSign size={32} color="#8B5CF6" style={{ opacity: 0.5 }} />
//             </div>
//           </div>
//         </div>

//         {/* Ride Requests List */}
//         <div className="mb-3">
//           <h2 className="font-bold mb-3" style={{ fontSize: '1.25rem' }}>
//             Available Ride Requests
//           </h2>

//           {loading ? (
//             <div className="text-center p-4">
//               <span className="loading"></span>
//               <p className="text-dim mt-2">Loading ride requests...</p>
//             </div>
//           ) : requests.length === 0 ? (
//             <div className="card text-center p-4">
//               <MapPin size={48} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '1rem' }} />
//               <p className="font-bold mb-2">No ride requests available</p>
//               <p className="text-dim" style={{ fontSize: '0.875rem' }}>
//                 New ride requests will appear here automatically.
//               </p>
//             </div>
//           ) : (
//             requests.map((request) => (
//               <div key={request.id} className="card mb-3" style={{
//                 border: request.has_submitted_bid ? '2px solid #8B5CF6' : undefined,
//                 background: request.has_submitted_bid 
//                   ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))'
//                   : undefined
//               }}>
//                 {/* Rider Info */}
//                 <div className="flex items-center gap-2 mb-3">
//                   <div style={{
//                     width: '36px',
//                     height: '36px',
//                     borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #10B981, #059669)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <User size={20} color="white" />
//                   </div>
//                   <div>
//                     <div className="font-bold">{request.rider_name || 'Rider'}</div>
//                     <div className="text-dim" style={{ fontSize: '0.75rem' }}>
//                       Posted {new Date(request.created_at).toLocaleTimeString()}
//                     </div>
//                   </div>
//                   {request.has_submitted_bid && (
//                     <div style={{
//                       marginLeft: 'auto',
//                       padding: '0.25rem 0.75rem',
//                       background: '#8B5CF6',
//                       borderRadius: '12px',
//                       fontSize: '0.75rem',
//                       fontWeight: 'bold'
//                     }}>
//                       BID SENT
//                     </div>
//                   )}
//                 </div>

//                 {/* Route */}
//                 <div className="mb-3">
//                   <div className="flex items-start gap-2 mb-2">
//                     <div style={{
//                       width: '8px',
//                       height: '8px',
//                       borderRadius: '50%',
//                       background: '#10B981',
//                       marginTop: '6px'
//                     }} />
//                     <div style={{ flex: 1 }}>
//                       <div className="text-dim" style={{ fontSize: '0.75rem' }}>PICKUP</div>
//                       <div className="font-bold" style={{ fontSize: '0.875rem' }}>
//                         {request.pickup_address}
//                       </div>
//                     </div>
//                   </div>

//                   <div style={{
//                     width: '2px',
//                     height: '20px',
//                     background: '#475569',
//                     marginLeft: '3px',
//                     marginBottom: '0.5rem'
//                   }} />

//                   <div className="flex items-start gap-2">
//                     <div style={{
//                       width: '8px',
//                       height: '8px',
//                       borderRadius: '50%',
//                       background: '#EF4444',
//                       marginTop: '6px'
//                     }} />
//                     <div style={{ flex: 1 }}>
//                       <div className="text-dim" style={{ fontSize: '0.75rem' }}>DROPOFF</div>
//                       <div className="font-bold" style={{ fontSize: '0.875rem' }}>
//                         {request.dropoff_address}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Details */}
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '1rem',
//                   padding: '1rem',
//                   background: 'rgba(30, 41, 59, 0.4)',
//                   borderRadius: '8px',
//                   marginBottom: '1rem'
//                 }}>
//                   <div>
//                     <div className="text-dim" style={{ fontSize: '0.75rem' }}>DISTANCE</div>
//                     <div className="font-bold">{request.estimated_distance_km} km</div>
//                   </div>
//                   <div>
//                     <div className="text-dim" style={{ fontSize: '0.75rem' }}>EST. DURATION</div>
//                     <div className="font-bold">{request.estimated_duration_minutes} min</div>
//                   </div>
//                 </div>

//                 {/* Estimated Fare */}
//                 <div className="mb-3" style={{
//                   padding: '0.75rem',
//                   background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
//                   borderRadius: '8px'
//                 }}>
//                   <div className="text-dim mb-1" style={{ fontSize: '0.75rem' }}>
//                     ESTIMATED FARE RANGE
//                   </div>
//                   <div className="font-bold" style={{ fontSize: '1.25rem', color: '#10B981' }}>
//                     ₹{request.estimated_fare_min} - ₹{request.estimated_fare_max}
//                   </div>
//                 </div>

//                 {/* Action Button */}
//                 {request.has_submitted_bid ? (
//                   <button
//                     className="btn btn-secondary w-full"
//                     disabled
//                     style={{ padding: '1rem' }}
//                   >
//                     <CheckCircle size={20} />
//                     Bid Submitted - Waiting for Rider
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => navigate(`/driver/requests/${request.id}/bid`)}
//                     className="btn btn-primary w-full"
//                     style={{
//                       padding: '1rem',
//                       background: 'linear-gradient(135deg, #10B981, #059669)'
//                     }}
//                   >
//                     <DollarSign size={20} />
//                     Submit Bid
//                   </button>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {/* Tips */}
//         {requests.length > 0 && (
//           <div className="card" style={{
//             background: 'rgba(59, 130, 246, 0.1)',
//             border: '1px solid rgba(59, 130, 246, 0.2)'
//           }}>
//             <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
//               💡 TIP
//             </div>
//             <div style={{ fontSize: '0.875rem' }}>
//               Submit competitive bids to increase your chances of getting rides. 
//               You'll be notified instantly when a rider accepts your bid.
//             </div>
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default DriverDashboard;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Clock,
  User,
  TrendingUp,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { getToken } from '../utils/CookieUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DriverDashboard = ({ auth, onLogout }) => {
  const navigate = useNavigate();
  const { socket, isConnected, driverId } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalEarnings: 0,
    rating: 0,
    activeBids: 0
  });

  // KYC Status
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    if (!socket || !driverId || !kycStatus?.isVerified) return;

    console.log('🔌 Setting up socket listeners for driver...');
    console.log('Driver ID:', driverId);

    // Listen for new ride requests
    socket.on('ride:request:new', (requestData) => {
      console.log('🚗 New ride request received:', requestData);
      
      showNotification({
        type: 'info',
        title: '🚗 New Ride Request!',
        message: `${requestData.pickup_address} → ${requestData.dropoff_address}`,
        requestId: requestData.id
      });

      setRequests(prev => [requestData, ...prev]);
    });

    socket.on('ride:bid:accepted', (data) => {
      console.log('🎉 BID ACCEPTED:', data);
      
      showNotification({
        type: 'success',
        title: '🎉 Your Bid Was Accepted!',
        message: `${data.rider_name || 'Rider'} accepted your bid of ₹${data.fare_amount}`,
        rideId: data.rideId,
        autoRedirect: true
      });

      setTimeout(() => {
        navigate(`/driver/active-ride/${data.rideId}`);
      }, 2000);
    });

    socket.on('ride:bid:rejected', (data) => {
      console.log('❌ Bid rejected:', data);
      
      showNotification({
        type: 'info',
        title: 'Bid Not Selected',
        message: 'The rider chose another driver for this ride',
        requestId: data.requestId
      });

      setRequests(prev => prev.filter(r => r.id !== data.requestId));
    });

    socket.on('ride:status:changed', (data) => {
      console.log('🔄 Ride status changed:', data);
      
      if (data.status === 'completed') {
        showNotification({
          type: 'success',
          title: '✅ Ride Completed!',
          message: 'Great job! Check your earnings.',
          rideId: data.rideId
        });
      }
    });

    return () => {
      console.log('🧹 Cleaning up driver socket listeners');
      socket.off('ride:request:new');
      socket.off('ride:bid:accepted');
      socket.off('ride:bid:rejected');
      socket.off('ride:status:changed');
    };
  }, [socket, driverId, navigate, kycStatus]);

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
      const response = await fetch(`${API_URL}/api/ride-requests/nearby`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Fetched ${data.data?.length || 0} ride requests`);
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (notif) => {
    setNotification(notif);
    if (!notif.autoRedirect) {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (kycLoading) {
    return (
      <div className="p-4" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="loading mb-4"></div>
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
          <h1 className="header-title">Driver Dashboard</h1>
          <p className="text-dim mt-1">Complete KYC to start driving</p>
        </div>

        <div className="p-4">
          {/* KYC Required Card */}
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
              justifyContent: 'center'
            }}>
              <Shield size={40} color="white" />
            </div>

            <h2 className="font-bold mb-3" style={{ fontSize: '1.5rem' }}>
              KYC Verification Required
            </h2>
            
            <p className="text-dim mb-6" style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              To start accepting rides and earning money, you need to complete your KYC verification. 
              This helps us ensure the safety of all our users.
            </p>

            <button
              onClick={() => navigate('/kyc-upload')}
              className="btn btn-primary"
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)'
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
                  fontSize: '0.875rem'
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
                  fontSize: '0.875rem'
                }}>2</div>
                <div>
                  <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                    Admin Review
                    {/* TODO: Auto-verification can be implemented here in future */}
                  </div>
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
                  fontSize: '0.875rem'
                }}>3</div>
                <div>
                  <div className="font-bold" style={{ fontSize: '0.875rem' }}>Start Driving!</div>
                  <div className="text-dim" style={{ fontSize: '0.75rem' }}>Once approved, you can accept ride requests</div>
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
          <h1 className="header-title">Driver Dashboard</h1>
          <p className="text-dim mt-1">Verification in progress</p>
        </div>

        <div className="p-4">
          {/* Pending Verification Card */}
          <div className="card text-center" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
            border: '2px solid #3B82F6',
            padding: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
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

            <div className="card mb-4" style={{ 
              background: 'rgba(59, 130, 246, 0.1)',
              textAlign: 'left',
              padding: '1rem'
            }}>
              <div className="font-bold mb-2">📄 Submitted Information:</div>
              <div className="text-dim" style={{ fontSize: '0.875rem' }}>
                <div>Name: {kycStatus.kycData?.firstName} {kycStatus.kycData?.lastName}</div>
                <div>Email: {kycStatus.kycData?.email}</div>
                <div>Phone: {kycStatus.kycData?.phone}</div>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.875rem'
            }}>
              <div className="font-bold mb-1">⏱️ Expected Timeline:</div>
              <div className="text-dim">
                Verification typically takes 24-72 hours. 
                We'll notify you once approved!
                {/* TODO: Implement email/SMS notification system */}
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
              <li>✓ Your driver profile will be activated automatically</li>
              {/* TODO: Add automatic driver profile creation after approval */}
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
    <div className="p-4" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="header-title">Available Rides</h1>
            <p className="text-dim mt-1">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              {driverId && ` • Driver ID: ${driverId}`}
            </p>
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} />
            VERIFIED
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
              : notification.type === 'info'
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
            border: `2px solid ${
              notification.type === 'success' ? '#10B981' 
              : notification.type === 'info' ? '#3B82F6'
              : '#F59E0B'
            }`,
            position: 'relative',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {!notification.autoRedirect && (
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
          )}
          
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle size={24} color="#10B981" />
            ) : (
              <AlertCircle size={24} color={notification.type === 'info' ? '#3B82F6' : '#F59E0B'} />
            )}
            <div>
              <div className="font-bold mb-1">{notification.title}</div>
              <div className="text-dim" style={{ fontSize: '0.875rem' }}>
                {notification.message}
              </div>
              {notification.requestId && !notification.autoRedirect && (
                <button
                  onClick={() => navigate(`/driver/requests/${notification.requestId}/bid`)}
                  className="btn btn-primary mt-2"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  View Request
                </button>
              )}
              {notification.rideId && !notification.autoRedirect && (
                <button
                  onClick={() => navigate(`/driver/active-ride/${notification.rideId}`)}
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
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            className="card p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                  AVAILABLE RIDES
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: '1.5rem', color: '#10B981' }}
                >
                  {requests.length}
                </div>
              </div>
              <MapPin size={32} color="#10B981" style={{ opacity: 0.5 }} />
            </div>
          </div>

          <div
            className="card p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                  ACTIVE BIDS
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: '1.5rem', color: '#8B5CF6' }}
                >
                  {requests.filter(r => r.has_submitted_bid).length}
                </div>
              </div>
              <DollarSign size={32} color="#8B5CF6" style={{ opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Ride Requests List */}
        <div className="mb-3">
          <h2 className="font-bold mb-3" style={{ fontSize: '1.25rem' }}>
            Available Ride Requests
          </h2>

          {loading ? (
            <div className="text-center p-4">
              <span className="loading"></span>
              <p className="text-dim mt-2">Loading ride requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="card text-center p-4">
              <MapPin size={48} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '1rem' }} />
              <p className="font-bold mb-2">No ride requests available</p>
              <p className="text-dim" style={{ fontSize: '0.875rem' }}>
                New ride requests will appear here automatically.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="card mb-3" style={{
                border: request.has_submitted_bid ? '2px solid #8B5CF6' : undefined,
                background: request.has_submitted_bid 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))'
                  : undefined
              }}>
                {/* Rider Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={20} color="white" />
                  </div>
                  <div>
                    <div className="font-bold">{request.rider_name || 'Rider'}</div>
                    <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                      Posted {new Date(request.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  {request.has_submitted_bid && (
                    <div style={{
                      marginLeft: 'auto',
                      padding: '0.25rem 0.75rem',
                      background: '#8B5CF6',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      BID SENT
                    </div>
                  )}
                </div>

                {/* Route */}
                <div className="mb-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10B981',
                      marginTop: '6px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className="text-dim" style={{ fontSize: '0.75rem' }}>PICKUP</div>
                      <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                        {request.pickup_address}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    width: '2px',
                    height: '20px',
                    background: '#475569',
                    marginLeft: '3px',
                    marginBottom: '0.5rem'
                  }} />

                  <div className="flex items-start gap-2">
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#EF4444',
                      marginTop: '6px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className="text-dim" style={{ fontSize: '0.75rem' }}>DROPOFF</div>
                      <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                        {request.dropoff_address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div className="text-dim" style={{ fontSize: '0.75rem' }}>DISTANCE</div>
                    <div className="font-bold">{request.estimated_distance_km} km</div>
                  </div>
                  <div>
                    <div className="text-dim" style={{ fontSize: '0.75rem' }}>EST. DURATION</div>
                    <div className="font-bold">{request.estimated_duration_minutes} min</div>
                  </div>
                </div>

                {/* Estimated Fare */}
                <div className="mb-3" style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                  borderRadius: '8px'
                }}>
                  <div className="text-dim mb-1" style={{ fontSize: '0.75rem' }}>
                    ESTIMATED FARE RANGE
                  </div>
                  <div className="font-bold" style={{ fontSize: '1.25rem', color: '#10B981' }}>
                    NPR {request.estimated_total}
                  </div>
                </div>

                {/* Action Button */}
                {request.has_submitted_bid ? (
                  <button
                    className="btn btn-secondary w-full"
                    disabled
                    style={{ padding: '1rem' }}
                  >
                    <CheckCircle size={20} />
                    Bid Submitted - Waiting for Rider
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/driver/requests/${request.id}/bid`)}
                    className="btn btn-primary w-full"
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #10B981, #059669)'
                    }}
                  >
                    <DollarSign size={20} />
                    Submit Bid
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Tips */}
        {requests.length > 0 && (
          <div className="card" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              💡 TIP
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              Submit competitive bids to increase your chances of getting rides. 
              You'll be notified instantly when a rider accepts your bid.
            </div>
          </div>
        )}
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
      `}</style>
    </div>
  );
};

export default DriverDashboard;