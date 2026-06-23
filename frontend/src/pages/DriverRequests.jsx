

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, DollarSign, Users, Package, Clock, ArrowLeft } from 'lucide-react';

// const DriverRequests = ({ auth }) => {
//   const navigate = useNavigate();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRequests();
//     const interval = setInterval(fetchRequests, 5000);
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
//         setRequests(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <div className="flex items-center gap-3 mb-3">
//           <button 
//             onClick={() => navigate('/driver/dashboard')}
//             className="btn btn-secondary"
//             style={{padding: '0.5rem'}}
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div className="flex-1">
//             <h1 className="header-title">Nearby Requests</h1>
//             <p className="text-dim">{requests.length} available</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-4">
//         {loading ? (
//           <div className="text-center p-4">
//             <span className="loading"></span>
//             <p className="text-dim mt-2">Loading requests...</p>
//           </div>
//         ) : requests.length === 0 ? (
//           <div className="card text-center p-4">
//             <MapPin size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//             <p className="text-dim">No ride requests available</p>
//             <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
//               Check back in a few moments
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {requests.map((request) => (
//               <RequestCard 
//                 key={request.id} 
//                 request={request} 
//                 auth={auth}
//                 onAccepted={fetchRequests}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const RequestCard = ({ request, auth, onAccepted }) => {
//   const navigate = useNavigate();
//   const [fare, setFare] = useState(() => {
//     // Set default to mid-value
//     const min = parseFloat(request.estimated_fare_min) || 0;
//     const max = parseFloat(request.estimated_fare_max) || 0;
//     return Math.round((min + max) / 2);
//   });
//   const [accepting, setAccepting] = useState(false);

//   const minFare = parseFloat(request.estimated_fare_min) || 0;
//   const maxFare = parseFloat(request.estimated_fare_max) || 0;

//   const handleAccept = async () => {
//     if (accepting) return;
//     setAccepting(true);

//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/accept/${request.id}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify({
//           fareAmount: fare
//         })
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         alert(`✅ Ride Accepted!\nFare: ₹${fare}`);
//         navigate(`/driver/active-ride/${data.data.ride_id}`);
//       } else {
//         alert('Failed to accept ride: ' + (data.message || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error accepting ride');
//     } finally {
//       setAccepting(false);
//     }
//   };

//   return (
//     <div className="card" style={{
//       background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
//       border: '2px solid rgba(16, 185, 129, 0.3)'
//     }}>
//       {/* Route */}
//       <div className="mb-3">
//         <div className="flex items-start gap-2 mb-2">
//           <div style={{
//             width: '8px',
//             height: '8px',
//             borderRadius: '50%',
//             background: '#10B981',
//             marginTop: '0.5rem',
//             flexShrink: 0
//           }}></div>
//           <div className="flex-1">
//             <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
//             <div className="font-bold">{request.pickup_address}</div>
//           </div>
//         </div>

//         <div style={{
//           width: '2px',
//           height: '15px',
//           background: 'rgba(148, 163, 184, 0.3)',
//           marginLeft: '3px',
//           marginBottom: '0.5rem'
//         }}></div>

//         <div className="flex items-start gap-2">
//           <div style={{
//             width: '8px',
//             height: '8px',
//             borderRadius: '50%',
//             background: '#EF4444',
//             marginTop: '0.5rem',
//             flexShrink: 0
//           }}></div>
//           <div className="flex-1">
//             <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
//             <div className="font-bold">{request.dropoff_address}</div>
//           </div>
//         </div>
//       </div>

//       {/* Details */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: '1fr 1fr',
//         gap: '0.5rem',
//         marginBottom: '1rem',
//         padding: '0.75rem',
//         background: 'rgba(255, 255, 255, 0.5)',
//         borderRadius: '8px'
//       }}>
//         <div className="flex items-center gap-2">
//           <Clock size={16} color="#6B7280" />
//           <span style={{fontSize: '0.875rem'}}>{request.estimated_duration_minutes}min</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <MapPin size={16} color="#6B7280" />
//           <span style={{fontSize: '0.875rem'}}>{request.estimated_distance_km}km</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Users size={16} color="#6B7280" />
//           <span style={{fontSize: '0.875rem'}}>{request.passenger_count} passengers</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Package size={16} color="#6B7280" />
//           <span style={{fontSize: '0.875rem'}}>{request.luggage_count} bags</span>
//         </div>
//       </div>

//       {/* Fare Adjuster */}
//       <div style={{
//         padding: '1rem',
//         background: 'rgba(16, 185, 129, 0.1)',
//         borderRadius: '12px',
//         marginBottom: '1rem'
//       }}>
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-dim" style={{fontSize: '0.875rem'}}>Your Fare</span>
//           <span className="text-dim" style={{fontSize: '0.75rem'}}>
//             Range: ₹{minFare} - ₹{maxFare}
//           </span>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setFare(Math.max(minFare, fare - 10))}
//             className="btn btn-secondary"
//             style={{padding: '0.75rem 1rem', fontSize: '1.25rem'}}
//             disabled={fare <= minFare}
//           >
//             −
//           </button>

//           <div className="flex-1 text-center">
//             <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#10B981'}}>
//               ₹{fare}
//             </div>
//           </div>

//           <button
//             onClick={() => setFare(Math.min(maxFare, fare + 10))}
//             className="btn btn-secondary"
//             style={{padding: '0.75rem 1rem', fontSize: '1.25rem'}}
//             disabled={fare >= maxFare}
//           >
//             +
//           </button>
//         </div>

//         <input
//           type="range"
//           min={minFare}
//           max={maxFare}
//           value={fare}
//           onChange={(e) => setFare(parseInt(e.target.value))}
//           style={{width: '100%', marginTop: '0.75rem'}}
//         />
//       </div>

//       {/* Accept Button */}
//       <button
//         onClick={handleAccept}
//         disabled={accepting}
//         className="btn btn-success w-full"
//         style={{padding: '1rem', fontSize: '1.125rem', fontWeight: 'bold'}}
//       >
//         {accepting ? 'Accepting...' : 'Accept This Ride'}
//       </button>
//     </div>
//   );
// };

// export default DriverRequests;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Package,
  Navigation,
  ArrowLeft,
  Send,
  CheckCircle,
  User
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const DriverRequests = ({ auth }) => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ═══════════════════════════════════════════════════════════════
  // SOCKET LISTENERS FOR REAL-TIME UPDATES
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Setting up socket listeners for driver requests...');

    // Listen for new ride requests
    socket.on('ride:request:new', (requestData) => {
      console.log('🚗 New ride request received:', requestData);
      
      // Add to requests list if not already there
      setRequests(prev => {
        const exists = prev.some(r => r.id === requestData.id);
        if (exists) return prev;
        return [requestData, ...prev];
      });
    });

    // Listen for bid acceptance
    socket.on('ride:bid:accepted', (data) => {
      console.log('🎉 Bid accepted - redirecting...');
      navigate(`/driver/active-ride/${data.rideId}`);
    });

    // Listen for bid rejection
    socket.on('ride:bid:rejected', (data) => {
      console.log('❌ Bid rejected for request:', data.requestId);
      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== data.requestId));
    });

    return () => {
      console.log('🧹 Cleaning up driver requests socket listeners');
      socket.off('ride:request:new');
      socket.off('ride:bid:accepted');
      socket.off('ride:bid:rejected');
    };
  }, [socket, navigate]);

  // ═══════════════════════════════════════════════════════════════
  // FETCH REQUESTS
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

  return (
    <div className="p-4" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/driver/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '0.5rem' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">Nearby Ride Requests</h1>
            <p className="text-dim mt-1">
              {isConnected ? '🟢' : '🔴'} {requests.length} available
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center p-4">
            <span className="loading"></span>
            <p className="text-dim mt-2">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center p-4">
            <MapPin size={48} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '1rem' }} />
            <p className="font-bold mb-2">No ride requests available</p>
            <p className="text-dim" style={{ fontSize: '0.875rem' }}>
              New requests will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REQUEST CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const RequestCard = ({ request, navigate }) => {
  return (
    <div className="card" style={{
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
        <div className="flex-1">
          <div className="font-bold">{request.rider_name || 'Rider'}</div>
          <div className="text-dim" style={{ fontSize: '0.75rem' }}>
            Posted {new Date(request.created_at).toLocaleTimeString()}
          </div>
        </div>
        {request.has_submitted_bid && (
          <div style={{
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

        {/* Stops */}
        {request.stops && request.stops.length > 0 && request.stops.map((stop, idx) => (
          <React.Fragment key={idx}>
            <div style={{
              width: '2px',
              height: '15px',
              background: '#475569',
              marginLeft: '3px',
              marginBottom: '0.5rem'
            }} />
            <div className="flex items-start gap-2 mb-2">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F59E0B',
                marginTop: '6px'
              }} />
              <div style={{ flex: 1 }}>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                  STOP {stop.stop_order}
                </div>
                <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                  {stop.address}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}

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

      {/* Details Grid */}
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
          <div className="text-dim" style={{ fontSize: '0.75rem' }}>EST. TIME</div>
          <div className="font-bold">{request.estimated_duration_minutes} min</div>
        </div>
        <div>
          <div className="text-dim" style={{ fontSize: '0.75rem' }}>PASSENGERS</div>
          <div className="font-bold">{request.passenger_count}</div>
        </div>
        <div>
          <div className="text-dim" style={{ fontSize: '0.75rem' }}>LUGGAGE</div>
          <div className="font-bold">{request.luggage_count} bags</div>
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
        <div className="text-dim mt-1" style={{ fontSize: '0.75rem' }}>
          Submit your competitive bid to get this ride
        </div>
      </div>

      {/* Special Instructions */}
      {request.special_instructions && (
        <div className="mb-3" style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '8px',
          padding: '0.75rem'
        }}>
          <div className="text-dim" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            SPECIAL INSTRUCTIONS
          </div>
          <div style={{ fontSize: '0.875rem' }}>{request.special_instructions}</div>
        </div>
      )}

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
            background: 'linear-gradient(135deg, #10B981, #059669)',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          <DollarSign size={20} />
          Submit Your Bid
        </button>
      )}
    </div>
  );
};

export default DriverRequests;