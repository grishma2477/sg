

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, DollarSign, TrendingUp, Clock } from 'lucide-react';
// import { io } from 'socket.io-client';

// const DriverDashboard = ({ auth, onLogout }) => {
//   const navigate = useNavigate();
//   const socketRef = useRef(null); // Use ref to prevent recreating socket
//   const [stats, setStats] = useState({
//     totalEarnings: 1821.55,
//     totalTrips: 18,
//     rating: 4.7,
//     completionRate: 94
//   });
//   const [isOnline, setIsOnline] = useState(false);
//   const [socketStatus, setSocketStatus] = useState('Disconnected');

//   // Fetch driver status
//   useEffect(() => {
//     fetchDriverStatus();
//   }, []);

//   const fetchDriverStatus = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/drivers/status', {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setIsOnline(data.data.isOnline);
//       }
//     } catch (error) {
//       console.error('Error fetching status:', error);
//     }
//   };

//   // Socket connection - ONLY CREATE ONCE
//   useEffect(() => {
//     if (!auth || !auth.userId || socketRef.current) {
//       return; // Don't create if already exists
//     }

//     console.log('🔌 Creating socket connection...');
//     console.log('Auth:', {
//       userId: auth.userId,
//       role: auth.userRole,
//       driverId: auth.driverId
//     });

//     const socket = io('http://localhost:5000', {
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionAttempts: 10
//     });

//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('✅ Socket connected:', socket.id);
//       setSocketStatus('Connected: ' + socket.id);
      
//       socket.emit('authenticate', {
//         userId: auth.userId,
//         role: auth.userRole || 'driver',
//         driverId: auth.driverId
//       });
      
//       console.log('📤 Auth sent to backend');
//     });

//     socket.on('disconnect', () => {
//       console.log('❌ Socket disconnected');
//       setSocketStatus('Disconnected');
//     });

//     socket.on('connect_error', (error) => {
//       console.error('❌ Socket error:', error);
//       setSocketStatus('Error');
//     });

//     // Listen for bid acceptance
//     socket.on('ride:bid:accepted', (data) => {
//       console.log('');
//       console.log('═══════════════════════════════════════════');
//       console.log('🎉🎉🎉 BID ACCEPTED EVENT RECEIVED! 🎉🎉🎉');
//       console.log('═══════════════════════════════════════════');
//       console.log('Data:', data);
//       console.log('Ride ID:', data.rideId);
//       console.log('═══════════════════════════════════════════');
//       console.log('');
      
//       alert(`🎉 YOUR BID WAS ACCEPTED!\n\nFare: ₹${data.fare_amount}\n\nRedirecting to ride page...`);
      
//       navigate(`/driver/active-ride/${data.rideId}`);
//     });

//     // Listen for all events (debug)
//     socket.onAny((eventName, ...args) => {
//       console.log('📨 Socket event:', eventName, args);
//     });

//     // Cleanup on unmount ONLY
//     return () => {
//       console.log('🧹 Cleaning up socket...');
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, []); // Empty dependency array - only run once!

//   const toggleOnlineStatus = async () => {
//     try {
//       const newStatus = !isOnline;
      
//       const response = await fetch('http://localhost:5000/api/drivers/toggle-status', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify({ isOnline: newStatus })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setIsOnline(newStatus);
//       } else {
//         alert('Failed to update status');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error updating status');
//     }
//   };

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="header-title">Driver Dashboard</h1>
//             <p className="text-dim mt-1">Sajilo Gaadi</p>
//           </div>
//           <button
//             className={`btn ${isOnline ? 'btn-success' : 'btn-secondary'}`}
//             onClick={toggleOnlineStatus}
//             style={{padding: '0.75rem 1.5rem', fontSize: '0.875rem'}}
//           >
//             {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
//           </button>
//         </div>
//       </div>

//       <div className="p-4">
//         {/* Debug Info */}
//         <div className="card mb-4" style={{background: '#fff3cd', border: '2px solid #ffc107', padding: '1rem'}}>
//           <div className="font-bold mb-2" style={{color: '#856404'}}>🔧 Socket Status</div>
//           <div style={{fontSize: '0.75rem', fontFamily: 'monospace', color: '#856404'}}>
//             <div>Status: {socketStatus}</div>
//             <div>Driver ID: {auth?.driverId || '⚠️ MISSING'}</div>
//             <div>Listening for: ride:bid:accepted</div>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
//           <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Earnings</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>₹{stats.totalEarnings}</div>
//               </div>
//               <DollarSign size={32} color="#10B981" style={{opacity: 0.5}} />
//             </div>
//           </div>

//           <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Trips</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#8B5CF6'}}>{stats.totalTrips}</div>
//               </div>
//               <TrendingUp size={32} color="#8B5CF6" style={{opacity: 0.5}} />
//             </div>
//           </div>

//           <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Rating</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#F59E0B'}}>{stats.rating}/5.0</div>
//               </div>
//               <div style={{fontSize: '2rem'}}>⭐</div>
//             </div>
//           </div>

//           <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Completion</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>{stats.completionRate}%</div>
//               </div>
//               <Clock size={32} color="#06B6D4" style={{opacity: 0.5}} />
//             </div>
//           </div>
//         </div>

//         {/* Quick Action */}
//         <button 
//           className="btn btn-primary w-full mb-4"
//           style={{padding: '1.5rem', fontSize: '1.125rem'}}
//           onClick={() => navigate('/driver/requests')}
//         >
//           <MapPin size={24} />
//           View Nearby Requests
//         </button>

//         {/* Active Bids */}
//         <div>
//           <h3 className="font-bold mb-3" style={{fontSize: '1.25rem'}}>Active Bids</h3>
          
//           <div className="card text-center p-4">
//             <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//             <p className="text-dim">No active bids</p>
//             <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
//               Submit bids on nearby requests to start earning
//             </p>
//           </div>
//         </div>
//       </div>
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
  AlertCircle
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

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

  // ═══════════════════════════════════════════════════════════════
  // SOCKET EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!socket || !driverId) return;

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

      // Add to requests list
      setRequests(prev => [requestData, ...prev]);
    });

    // Listen for bid acceptance
    socket.on('ride:bid:accepted', (data) => {
      console.log('');
      console.log('🎉🎉🎉 BID ACCEPTED NOTIFICATION RECEIVED 🎉🎉🎉');
      console.log('Ride ID:', data.rideId);
      console.log('Pickup:', data.pickup_address);
      console.log('Dropoff:', data.dropoff_address);
      console.log('Fare:', data.fare_amount);
      
      showNotification({
        type: 'success',
        title: '🎉 Your Bid Was Accepted!',
        message: `${data.rider_name || 'Rider'} accepted your bid of ₹${data.fare_amount}`,
        rideId: data.rideId,
        autoRedirect: true
      });

      // Auto-redirect to ride page after 2 seconds
      setTimeout(() => {
        navigate(`/driver/active-ride/${data.rideId}`);
      }, 2000);
    });

    // Listen for bid rejection
    socket.on('ride:bid:rejected', (data) => {
      console.log('❌ Bid rejected:', data);
      
      showNotification({
        type: 'info',
        title: 'Bid Not Selected',
        message: 'The rider chose another driver for this ride',
        requestId: data.requestId
      });

      // Remove from requests list
      setRequests(prev => prev.filter(r => r.id !== data.requestId));
    });

    // Listen for ride status changes
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
  }, [socket, driverId, navigate]);

  // ═══════════════════════════════════════════════════════════════
  // FETCH RIDE REQUESTS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchRequests();
    // Refresh every 30 seconds as backup
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ride-requests/nearby', {
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

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATION HELPER
  // ═══════════════════════════════════════════════════════════════
  const showNotification = (notif) => {
    setNotification(notif);
    if (!notif.autoRedirect) {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

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
                    ₹{request.estimated_fare_min} - ₹{request.estimated_fare_max}
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
