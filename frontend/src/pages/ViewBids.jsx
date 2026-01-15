

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowLeft, DollarSign, Clock, Star, CheckCircle } from 'lucide-react';

// const ViewBids = ({ auth }) => {
//   const navigate = useNavigate();
//   const { requestId } = useParams();
//   const [bids, setBids] = useState([]);
//   const [requestDetails, setRequestDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [acceptingBid, setAcceptingBid] = useState(null);

//   useEffect(() => {
//     fetchBids();
//     fetchRequestDetails();
//     const interval = setInterval(fetchBids, 3000); // Auto-refresh every 3 seconds
//     return () => clearInterval(interval);
//   }, [requestId]);

//   const fetchBids = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/bids`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setBids(data.data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching bids:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRequestDetails = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/ride-requests/${requestId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setRequestDetails(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching request details:', error);
//     }
//   };

//   const acceptBid = async (bidId) => {
//     if (!confirm('Accept this bid?')) return;

//     setAcceptingBid(bidId);
//     try {
//       const response = await fetch(`http://localhost:5000/api/bidding/bids/${bidId}/accept`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('✅ Bid accepted! Your driver is on the way!');
//         console.log("bidding data" , data.data)
//         // NAVIGATE TO ACTIVE RIDE PAGE
//         navigate(`/rider/active-ride/${data.data.ride_id}`);
//       } else {
//         alert(data.message || 'Failed to accept bid');
//       }
//     } catch (error) {
//       console.error('Error accepting bid:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setAcceptingBid(null);
//     }
//   };

//   // Sort bids by price (lowest first)
//   const sortedBids = [...bids].sort((a, b) => a.bid_amount - b.bid_amount);

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => navigate('/rider/dashboard')}
//             className="btn btn-secondary"
//             style={{padding: '0.5rem'}}
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div>
//             <h1 className="header-title">Bids Received</h1>
//             <p className="text-dim mt-1">{sortedBids.length} drivers interested</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-4">
//         {loading ? (
//           <div className="text-center p-4">
//             <span className="loading"></span>
//           </div>
//         ) : sortedBids.length === 0 ? (
//           <div className="card text-center p-4">
//             <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//             <p className="text-dim">No bids yet</p>
//             <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
//               Waiting for drivers to submit bids...
//             </p>
//           </div>
//         ) : (
//           sortedBids.map((bid, index) => (
//             <div key={bid.id} className="card mb-3" style={{
//               position: 'relative',
//               border: index === 0 ? '2px solid #10B981' : undefined
//             }}>
//               {/* Lowest Bid Badge */}
//               {index === 0 && (
//                 <div style={{
//                   position: 'absolute',
//                   top: '-10px',
//                   right: '10px',
//                   background: '#10B981',
//                   color: 'white',
//                   padding: '0.25rem 0.75rem',
//                   borderRadius: '12px',
//                   fontSize: '0.75rem',
//                   fontWeight: 'bold'
//                 }}>
//                   🏆 LOWEST BID
//                 </div>
//               )}

//               {/* Bid Amount */}
//               <div className="mb-3">
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>BID AMOUNT</div>
//                 <div className="font-bold" style={{fontSize: '2rem', color: '#10B981'}}>
//                   ₹{bid.bid_amount}
//                 </div>
//               </div>

//               {/* Driver Info */}
//               <div className="mb-3" style={{
//                 paddingBottom: '1rem',
//                 borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
//               }}>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Star size={16} color="#F59E0B" fill="#F59E0B" />
//                   <span className="font-bold">{bid.driver_rating || '4.5'}</span>
//                   <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                     ({bid.driver_completed_rides || 0} rides)
//                   </span>
//                 </div>
                
//                 {bid.vehicle_make && bid.vehicle_model && (
//                   <div className="text-dim" style={{fontSize: '0.875rem'}}>
//                     🚗 {bid.vehicle_make} {bid.vehicle_model} - {bid.vehicle_color}
//                   </div>
//                 )}
//               </div>

//               {/* Additional Info */}
//               <div className="flex gap-4 mb-3">
//                 {bid.estimated_arrival_minutes && (
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>ETA</div>
//                     <div className="flex items-center gap-1">
//                       <Clock size={16} color="#94A3B8" />
//                       <span style={{fontSize: '0.875rem'}}>{bid.estimated_arrival_minutes} min</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Driver Message */}
//               {bid.driver_message && (
//                 <div className="mb-3" style={{
//                   background: 'rgba(139, 92, 246, 0.1)',
//                   border: '1px solid rgba(139, 92, 246, 0.2)',
//                   borderRadius: '8px',
//                   padding: '0.75rem'
//                 }}>
//                   <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.25rem'}}>
//                     MESSAGE FROM DRIVER
//                   </div>
//                   <div style={{fontSize: '0.875rem'}}>{bid.driver_message}</div>
//                 </div>
//               )}

//               {/* Accept Button */}
//               <button
//                 className="btn btn-primary w-full"
//                 onClick={() => acceptBid(bid.id)}
//                 disabled={acceptingBid === bid.id}
//                 style={{padding: '1rem'}}
//               >
//                 {acceptingBid === bid.id ? (
//                   <span className="loading"></span>
//                 ) : (
//                   <>
//                     <CheckCircle size={20} />
//                     Accept Bid - ₹{bid.bid_amount}
//                   </>
//                 )}
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewBids;



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, Clock, Star, CheckCircle, Car, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ViewBids = ({ auth }) => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { socket } = useSocket();
  const [bids, setBids] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingBid, setAcceptingBid] = useState(null);

  // ═══════════════════════════════════════════════════════════════
  // SOCKET LISTENERS FOR REAL-TIME BID UPDATES
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Setting up socket listeners for bid updates...');

    // Listen for new bids in real-time
    socket.on('ride:bid:new', (bidData) => {
      console.log('💰 Real-time bid received:', bidData);
      
      // Only update if it's for this request
      if (bidData.requestId === requestId) {
        // Refresh bids list
        fetchBids();
      }
    });

    return () => {
      console.log('🧹 Cleaning up bid socket listeners');
      socket.off('ride:bid:new');
    };
  }, [socket, requestId]);

  // ═══════════════════════════════════════════════════════════════
  // FETCH DATA
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchBids();
    fetchRequestDetails();
    
    // Auto-refresh every 10 seconds as backup (sockets are primary)
    const interval = setInterval(fetchBids, 10000);
    return () => clearInterval(interval);
  }, [requestId]);

  const fetchBids = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/bids`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Fetched ${data.data?.length || 0} bids`);
        setBids(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ride-requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setRequestDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ACCEPT BID
  // ═══════════════════════════════════════════════════════════════
  const acceptBid = async (bidId) => {
    if (!confirm('Accept this bid? This will confirm your ride.')) return;

    setAcceptingBid(bidId);
    try {
      const response = await fetch(`http://localhost:5000/api/bidding/bids/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Bid accepted successfully:', data);
        
        // Show success message
        alert('🎉 Bid accepted! Your driver will arrive soon!');
        
        // Navigate to active ride page
        navigate(`/rider/active-ride/${data.data.ride_id}`);
      } else {
        alert(data.message || 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      alert('Error: ' + error.message);
    } finally {
      setAcceptingBid(null);
    }
  };

  // Sort bids by price (lowest first)
  const sortedBids = [...bids].sort((a, b) => a.bid_amount - b.bid_amount);

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      {/* Header */}
      <div className="header">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/rider/dashboard')}
            className="btn btn-secondary"
            style={{padding: '0.5rem'}}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">Bids Received</h1>
            <p className="text-dim mt-1">
              {sortedBids.length} {sortedBids.length === 1 ? 'driver' : 'drivers'} interested
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Request Summary */}
        {requestDetails && (
          <div className="card mb-4" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              YOUR RIDE REQUEST
            </div>
            
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
                    {requestDetails.pickup_address}
                  </div>
                </div>
              </div>

              <div style={{
                width: '2px',
                height: '15px',
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
                    {requestDetails.dropoff_address}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '8px'
            }}>
              <div>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>DISTANCE</div>
                <div className="font-bold">{requestDetails.estimated_distance_km} km</div>
              </div>
              <div>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>EST. FARE</div>
                <div className="font-bold" style={{ color: '#10B981' }}>
                  ₹{requestDetails.estimated_fare_min} - ₹{requestDetails.estimated_fare_max}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bids List */}
        {loading ? (
          <div className="text-center p-4">
            <span className="loading"></span>
            <p className="text-dim mt-2">Loading bids...</p>
          </div>
        ) : sortedBids.length === 0 ? (
          <div className="card text-center p-4">
            <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
            <p className="font-bold mb-2">No bids yet</p>
            <p className="text-dim" style={{fontSize: '0.875rem'}}>
              Drivers can see your request and will submit bids soon.
            </p>
            <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
              This page updates automatically when bids are received.
            </p>
          </div>
        ) : (
          <>
            {sortedBids.map((bid, index) => (
              <div key={bid.id} className="card mb-3" style={{
                position: 'relative',
                border: index === 0 ? '2px solid #10B981' : undefined,
                background: index === 0 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
                  : undefined
              }}>
                {/* Lowest Bid Badge */}
                {index === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '12px',
                    background: '#10B981',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}>
                    🏆 LOWEST BID
                  </div>
                )}

                {/* Bid Amount */}
                <div className="mb-3" style={{
                  padding: '1rem',
                  background: index === 0 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
                  borderRadius: '12px'
                }}>
                  <div className="text-dim" style={{fontSize: '0.75rem'}}>BID AMOUNT</div>
                  <div className="font-bold" style={{
                    fontSize: '2.5rem',
                    color: index === 0 ? '#10B981' : '#8B5CF6'
                  }}>
                    ₹{bid.bid_amount}
                  </div>
                </div>

                {/* Driver Info */}
                <div className="mb-3" style={{
                  paddingBottom: '1rem',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-bold">
                        {bid.driver_name || 'Professional Driver'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          <span className="font-bold" style={{ fontSize: '0.875rem' }}>
                            {bid.driver_rating || '4.5'}
                          </span>
                        </div>
                        <span className="text-dim" style={{ fontSize: '0.75rem' }}>
                          ({bid.driver_completed_rides || 0} rides)
                        </span>
                        <span style={{ fontSize: '0.875rem', color: '#10B981' }}>
                          {bid.driver_safety_points || 950} pts
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Info */}
                  {bid.vehicle_make && bid.vehicle_model && (
                    <div className="flex items-center gap-2 mt-2" style={{
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '8px'
                    }}>
                      <Car size={18} color="#94A3B8" />
                      <div>
                        <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                          {bid.vehicle_make} {bid.vehicle_model}
                        </div>
                        <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                          {bid.vehicle_color} • {bid.license_plate || 'License Plate'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Estimated Arrival */}
                {bid.estimated_arrival_minutes && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={18} color="#06B6D4" />
                      <div>
                        <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                          ESTIMATED ARRIVAL
                        </div>
                        <div className="font-bold" style={{ color: '#06B6D4' }}>
                          {bid.estimated_arrival_minutes} minutes
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver Message */}
                {bid.driver_message && (
                  <div className="mb-3" style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderLeft: '3px solid #8B5CF6',
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}>
                    <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>
                      MESSAGE FROM DRIVER
                    </div>
                    <div style={{fontSize: '0.875rem', fontStyle: 'italic'}}>
                      "{bid.driver_message}"
                    </div>
                  </div>
                )}

                {/* Accept Button */}
                <button
                  className="btn btn-primary w-full"
                  onClick={() => acceptBid(bid.id)}
                  disabled={acceptingBid === bid.id}
                  style={{
                    padding: '1rem',
                    background: index === 0 
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {acceptingBid === bid.id ? (
                    <span className="loading"></span>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Accept Bid - ₹{bid.bid_amount}
                    </>
                  )}
                </button>

                {index === 0 && sortedBids.length > 1 && (
                  <div className="text-center mt-2">
                    <div className="text-dim" style={{ fontSize: '0.75rem' }}>
                      💡 Save ₹{sortedBids[1].bid_amount - bid.bid_amount} with the lowest bid!
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Tips */}
        {sortedBids.length > 0 && (
          <div className="card mt-4" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              💡 TIP
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              Consider the driver's rating and arrival time along with the bid amount for the best experience.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBids;
