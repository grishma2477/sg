


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, DollarSign, TrendingUp, Clock } from 'lucide-react';
// import { io } from 'socket.io-client';

// let socket = null;

// const DriverDashboard = ({ auth, onLogout }) => {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({
//     totalEarnings: 1821.55,
//     totalTrips: 18,
//     rating: 4.7,
//     completionRate: 94
//   });
//   const [isOnline, setIsOnline] = useState(false);
//   const [activeBids, setActiveBids] = useState([]);

//   // Fetch initial driver status
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
//         console.log('✅ Driver status fetched:', data.data.isOnline ? 'ONLINE' : 'OFFLINE');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching driver status:', error);
//     }
//   };

//   // Initialize Socket.IO connection
//   useEffect(() => {
//     if (!auth || !auth.userId) {
//       console.log('⚠️ No auth data, skipping socket connection');
//       return;
//     }

//     if (!socket) {
//       console.log('🔌 Initializing socket connection...');
//       console.log('Auth data:', {
//         userId: auth.userId,
//         role: auth.userRole,
//         driverId: auth.driverId
//       });

//       socket = io('http://localhost:5000', {
//         transports: ['websocket'],
//         reconnection: true,
//         reconnectionDelay: 1000,
//         reconnectionAttempts: 5
//       });

//       socket.on('connect', () => {
//         console.log('✅ Socket connected:', socket.id);
        
//         // Authenticate with server
//         socket.emit('authenticate', {
//           userId: auth.userId,
//           role: auth.userRole || 'driver',
//           driverId: auth.driverId
//         });
        
//         console.log('📤 Authentication data sent');
//       });

//       socket.on('disconnect', () => {
//         console.log('❌ Socket disconnected');
//       });

//       socket.on('connect_error', (error) => {
//         console.error('❌ Socket connection error:', error);
//       });
//     }

//     // Listen for bid acceptance - THIS IS THE CRITICAL PART
//     const handleBidAccepted = (data) => {
//       console.log('');
//       console.log('='.repeat(50));
//       console.log('🎉🎉🎉 BID ACCEPTED EVENT RECEIVED! 🎉🎉🎉');
//       console.log('='.repeat(50));
//       console.log('Data received:', data);
//       console.log('='.repeat(50));
//       console.log('');
      
//       // Show alert
//       alert(`🎉 YOUR BID WAS ACCEPTED!\n\nFare: ₹${data.fare_amount}\nPickup: ${data.pickup_address}\n\nRedirecting to ride page...`);
      
//       // Navigate to active ride
//       const rideUrl = `/driver/active-ride/${data.rideId}`;
//       console.log('🔄 Navigating to:', rideUrl);
//       navigate(rideUrl);
//     };

//     socket.on('ride:bid:accepted', handleBidAccepted);

//     // Listen for ride status changes
//     socket.on('ride:status:changed', (data) => {
//       console.log('📍 Ride status changed:', data);
//     });

//     // Debug: Listen to ALL events
//     socket.onAny((eventName, ...args) => {
//       console.log('📨 Socket event received:', eventName, args);
//     });

//     // Cleanup
//     return () => {
//       if (socket) {
//         console.log('🧹 Cleaning up socket listeners');
//         socket.off('ride:bid:accepted', handleBidAccepted);
//         socket.off('ride:status:changed');
//         socket.offAny();
//       }
//     };
//   }, [auth, navigate]);

//   const toggleOnlineStatus = async () => {
//     try {
//       const newStatus = !isOnline;
      
//       console.log('🔄 Toggling status to:', newStatus ? 'ONLINE' : 'OFFLINE');
      
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
//         console.log('✅ Status updated successfully:', newStatus ? 'ONLINE' : 'OFFLINE');
//       } else {
//         console.error('❌ Failed to update status:', data);
//         alert('Failed to update status: ' + (data.message || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('❌ Error toggling status:', error);
//       alert('Error updating status: ' + error.message);
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
          
//           {activeBids.length === 0 ? (
//             <div className="card text-center p-4">
//               <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//               <p className="text-dim">No active bids</p>
//               <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
//                 Submit bids on nearby requests to start earning
//               </p>
//             </div>
//           ) : (
//             activeBids.map((bid) => (
//               <div key={bid.id} className="card mb-3">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <div className="font-bold">₹{bid.amount}</div>
//                     <div className="text-dim" style={{fontSize: '0.875rem'}}>{bid.route}</div>
//                   </div>
//                   <div className="badge badge-warning">Pending</div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Debug Info - Remove this in production */}
//         <div className="card mt-4 p-3" style={{background: '#f8f9fa', fontSize: '0.75rem'}}>
//           <div className="font-bold mb-2">Debug Info:</div>
//           <div>Socket Connected: {socket?.connected ? '✅ Yes' : '❌ No'}</div>
//           <div>User ID: {auth?.userId || 'Not set'}</div>
//           <div>Driver ID: {auth?.driverId || 'Not set'}</div>
//           <div>Role: {auth?.userRole || 'Not set'}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

let socket = null;

const DriverDashboard = ({ auth, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEarnings: 1821.55,
    totalTrips: 18,
    rating: 4.7,
    completionRate: 94
  });
  const [isOnline, setIsOnline] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [lastEvent, setLastEvent] = useState('None');

  useEffect(() => {
    fetchDriverStatus();
  }, []);

  const fetchDriverStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/drivers/status', {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setIsOnline(data.data.isOnline);
        console.log('✅ Driver status fetched:', data.data.isOnline ? 'ONLINE' : 'OFFLINE');
      }
    } catch (error) {
      console.error('❌ Error fetching driver status:', error);
    }
  };

  useEffect(() => {
    if (!auth || !auth.userId) {
      console.log('⚠️ No auth data');
      return;
    }

    console.log('=== SOCKET INITIALIZATION ===');
    console.log('Auth userId:', auth.userId);
    console.log('Auth driverId:', auth.driverId);
    console.log('Auth role:', auth.userRole);

    if (!socket) {
      socket = io('http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true
      });

      socket.on('connect', () => {
        console.log('✅ SOCKET CONNECTED:', socket.id);
        setSocketStatus('Connected: ' + socket.id);
        
        socket.emit('authenticate', {
          userId: auth.userId,
          role: auth.userRole || 'driver',
          driverId: auth.driverId
        });
        
        console.log('📤 Auth sent');
      });

      socket.on('disconnect', () => {
        console.log('❌ SOCKET DISCONNECTED');
        setSocketStatus('Disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ SOCKET ERROR:', error);
        setSocketStatus('Error: ' + error.message);
      });

      // Listen for ALL events
      socket.onAny((eventName, ...args) => {
        console.log('');
        console.log('═══════════════════════════════════');
        console.log('📨 EVENT RECEIVED:', eventName);
        console.log('📦 Data:', args);
        console.log('═══════════════════════════════════');
        console.log('');
        setLastEvent(eventName + ' at ' + new Date().toLocaleTimeString());
      });

      socket.on('ride:bid:accepted', (data) => {
        console.log('');
        console.log('🎉🎉🎉 BID ACCEPTED! 🎉🎉🎉');
        console.log('Data:', data);
        console.log('');
        
        alert(`BID ACCEPTED!\nRide ID: ${data.rideId}\nFare: ₹${data.fare_amount}`);
        navigate(`/driver/active-ride/${data.rideId}`);
      });
    }

    return () => {
      if (socket) {
        socket.offAny();
        socket.off('ride:bid:accepted');
      }
    };
  }, [auth, navigate]);

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      
      const response = await fetch('http://localhost:5000/api/drivers/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setIsOnline(newStatus);
        console.log('✅ Status updated:', newStatus ? 'ONLINE' : 'OFFLINE');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error updating status');
    }
  };

  // TEST SOCKET FUNCTION
  const testSocket = () => {
    if (socket && socket.connected) {
      console.log('📤 Sending test event...');
      socket.emit('test-from-driver', { message: 'Hello from driver!', timestamp: Date.now() });
      alert('Test event sent! Check backend console.');
    } else {
      alert('Socket not connected!');
    }
  };

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="header-title">Driver Dashboard</h1>
            <p className="text-dim mt-1">Sajilo Gaadi</p>
          </div>
          <button
            className={`btn ${isOnline ? 'btn-success' : 'btn-secondary'}`}
            onClick={toggleOnlineStatus}
            style={{padding: '0.75rem 1.5rem', fontSize: '0.875rem'}}
          >
            {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* SOCKET TEST SECTION */}
        <div className="card mb-4" style={{background: '#fff3cd', border: '2px solid #ffc107'}}>
          <h3 className="font-bold mb-2" style={{color: '#856404'}}>🔧 Socket Debug</h3>
          <div style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>
            <strong>Status:</strong> {socketStatus}
          </div>
          <div style={{fontSize: '0.875rem', marginBottom: '1rem'}}>
            <strong>Last Event:</strong> {lastEvent}
          </div>
          <button 
            className="btn btn-warning w-full"
            onClick={testSocket}
            style={{padding: '0.75rem'}}
          >
            🧪 Test Socket Connection
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Earnings</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>₹{stats.totalEarnings}</div>
              </div>
              <DollarSign size={32} color="#10B981" style={{opacity: 0.5}} />
            </div>
          </div>

          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Trips</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#8B5CF6'}}>{stats.totalTrips}</div>
              </div>
              <TrendingUp size={32} color="#8B5CF6" style={{opacity: 0.5}} />
            </div>
          </div>

          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Rating</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#F59E0B'}}>{stats.rating}/5.0</div>
              </div>
              <div style={{fontSize: '2rem'}}>⭐</div>
            </div>
          </div>

          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Completion</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>{stats.completionRate}%</div>
              </div>
              <Clock size={32} color="#06B6D4" style={{opacity: 0.5}} />
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary w-full mb-4"
          style={{padding: '1.5rem', fontSize: '1.125rem'}}
          onClick={() => navigate('/driver/requests')}
        >
          <MapPin size={24} />
          View Nearby Requests
        </button>

        <div>
          <h3 className="font-bold mb-3" style={{fontSize: '1.25rem'}}>Active Bids</h3>
          
          <div className="card text-center p-4">
            <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
            <p className="text-dim">No active bids</p>
            <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
              Submit bids on nearby requests to start earning
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="card mt-4 p-3" style={{background: '#f8f9fa', fontSize: '0.75rem'}}>
          <div className="font-bold mb-2">Debug Info:</div>
          <div>User ID: {auth?.userId || 'Not set'}</div>
          <div>Driver ID: {auth?.driverId || 'Not set'}</div>
          <div>Role: {auth?.userRole || 'Not set'}</div>
          <div>Socket: {socket?.connected ? '✅ Connected' : '❌ Disconnected'}</div>
          <div>Socket ID: {socket?.id || 'None'}</div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;