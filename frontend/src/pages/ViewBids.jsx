


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { DollarSign, Star, Clock, Car, Check, ArrowLeft, RefreshCw } from 'lucide-react';

// const ViewBids = ({ auth }) => {
//   const navigate = useNavigate();
//   const { requestId } = useParams();
//   const [bids, setBids] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [request, setRequest] = useState(null);

//   useEffect(() => {
//     fetchBids();
//     fetchRequestDetails();
//     // Auto-refresh every 3 seconds for real-time bid updates
//     const interval = setInterval(fetchBids, 3000);
//     return () => clearInterval(interval);
//   }, [requestId]);

//   const fetchRequestDetails = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/ride-requests/${requestId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });
      
//       const data = await response.json();
//       if (response.ok) {
//         setRequest(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching request details:', error);
//     }
//   };

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

//   const acceptBid = async (bidId) => {
//     if (!confirm('Accept this bid? This cannot be undone.')) return;

//     try {
//       const response = await fetch(`http://localhost:5000/api/bidding/bids/${bidId}/accept`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert('Bid accepted! Your ride is confirmed.');
//         navigate('/rider/dashboard');
//       } else {
//         alert(data.message || 'Failed to accept bid');
//       }
//     } catch (error) {
//       alert('Error: ' + error.message);
//     }
//   };

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
//             <h1 className="header-title">Available Bids</h1>
//             <p className="text-dim mt-1">Choose your driver</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-4">
//         {/* Request Summary */}
//         {request && (
//           <div className="card mb-4" style={{
//             background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'
//           }}>
//             <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>YOUR REQUEST</div>
//             <div className="font-bold" style={{marginBottom: '0.5rem'}}>{request.pickup_address}</div>
//             <div className="text-dim" style={{fontSize: '0.875rem'}}>to</div>
//             <div className="font-bold" style={{marginTop: '0.5rem'}}>{request.dropoff_address}</div>
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center p-4">
//             <span className="loading"></span>
//           </div>
//         ) : bids.length === 0 ? (
//           <div className="card text-center p-4">
//             <Clock size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//             <h3 className="font-bold mb-2">Waiting for Bids</h3>
//             <p className="text-dim">Drivers will start bidding soon...</p>
//             <div className="flex items-center justify-center gap-2 mt-3">
//               <RefreshCw size={16} className="animate-spin" />
//               <span className="text-dim" style={{fontSize: '0.875rem'}}>Auto-refreshing...</span>
//             </div>
//             <button 
//               className="btn btn-secondary mt-3"
//               onClick={() => navigate('/rider/dashboard')}
//             >
//               Back to Dashboard
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="mb-3 flex justify-between items-center">
//               <div className="badge badge-success" style={{fontSize: '1rem', padding: '0.75rem 1.5rem'}}>
//                 {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'} Received
//               </div>
//               <div className="flex items-center gap-2 text-dim" style={{fontSize: '0.875rem'}}>
//                 <RefreshCw size={14} />
//                 <span>Auto-updating</span>
//               </div>
//             </div>

//             {sortedBids.map((bid, index) => (
//               <div key={bid.id} className="card mb-3" style={{
//                 border: index === 0 ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(148, 163, 184, 0.2)',
//                 position: 'relative'
//               }}>
//                 {/* Best Bid Badge */}
//                 {index === 0 && (
//                   <div style={{
//                     position: 'absolute',
//                     top: '-12px',
//                     right: '12px',
//                     background: 'linear-gradient(135deg, #10B981, #059669)',
//                     color: 'white',
//                     padding: '0.25rem 0.75rem',
//                     borderRadius: '12px',
//                     fontSize: '0.75rem',
//                     fontWeight: 'bold',
//                     boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
//                   }}>
//                     🏆 LOWEST BID
//                   </div>
//                 )}

//                 {/* Driver Info */}
//                 <div className="flex items-start gap-3 mb-3" style={{
//                   paddingBottom: '1rem',
//                   borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
//                 }}>
//                   <div style={{
//                     width: '60px',
//                     height: '60px',
//                     borderRadius: '50%',
//                     background: 'linear-gradient(135deg, #667eea, #764ba2)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontSize: '1.5rem',
//                     fontWeight: 'bold'
//                   }}>
//                     {bid.driver_id?.charAt(0)?.toUpperCase() || 'D'}
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-bold" style={{fontSize: '1.125rem'}}>Driver #{bid.driver_id?.slice(0, 6)}</div>
//                     <div className="flex items-center gap-2 mt-1 flex-wrap">
//                       <div className="flex items-center gap-1">
//                         <Star size={16} color="#F59E0B" fill="#F59E0B" />
//                         <span style={{fontSize: '0.875rem'}}>{bid.driver_rating || 4.8}</span>
//                       </div>
//                       <span className="text-dim" style={{fontSize: '0.875rem'}}>•</span>
//                       <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                         {bid.driver_completed_rides || 150} trips
//                       </span>
//                       <span className="text-dim" style={{fontSize: '0.875rem'}}>•</span>
//                       <span style={{fontSize: '0.875rem', color: '#10B981'}}>
//                         {bid.driver_safety_points || 950} pts
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Vehicle Info */}
//                 {bid.vehicle_make && (
//                   <div className="flex items-center gap-2 mb-3">
//                     <Car size={20} color="#94A3B8" />
//                     <span className="font-bold">{bid.vehicle_make} {bid.vehicle_model}</span>
//                     {bid.vehicle_color && <span className="text-dim">• {bid.vehicle_color}</span>}
//                     {bid.license_plate && <span className="text-dim">• {bid.license_plate}</span>}
//                   </div>
//                 )}

//                 {/* Bid Details */}
//                 <div className="flex items-center justify-between mb-3" style={{
//                   padding: '1rem',
//                   background: index === 0 
//                     ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))' 
//                     : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
//                   borderRadius: '12px'
//                 }}>
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>BID AMOUNT</div>
//                     <div className="font-bold" style={{fontSize: '2rem', color: index === 0 ? '#10B981' : '#8B5CF6'}}>
//                       ₹{bid.bid_amount}
//                     </div>
//                   </div>
//                   {bid.estimated_arrival_minutes && (
//                     <div className="text-right">
//                       <div className="text-dim" style={{fontSize: '0.75rem'}}>ARRIVAL</div>
//                       <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>
//                         {bid.estimated_arrival_minutes} min
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Driver Message */}
//                 {bid.driver_message && (
//                   <div className="mb-3" style={{
//                     padding: '1rem',
//                     background: 'rgba(30, 41, 59, 0.4)',
//                     borderRadius: '12px',
//                     borderLeft: '3px solid #8B5CF6'
//                   }}>
//                     <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>
//                       MESSAGE FROM DRIVER
//                     </div>
//                     <div style={{fontSize: '0.875rem', fontStyle: 'italic'}}>
//                       "{bid.driver_message}"
//                     </div>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 {bid.status === 'pending' && (
//                   <button
//                     className="btn btn-primary w-full"
//                     onClick={() => acceptBid(bid.id)}
//                   >
//                     <Check size={20} />
//                     Accept Bid - ₹{bid.bid_amount}
//                   </button>
//                 )}

//                 {bid.status === 'accepted' && (
//                   <div className="badge badge-success w-full text-center" style={{padding: '1rem'}}>
//                     <Check size={20} />
//                     Accepted
//                   </div>
//                 )}
//               </div>
//             ))}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewBids;



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, Clock, Star, CheckCircle } from 'lucide-react';

const ViewBids = ({ auth }) => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [bids, setBids] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingBid, setAcceptingBid] = useState(null);

  useEffect(() => {
    fetchBids();
    fetchRequestDetails();
    const interval = setInterval(fetchBids, 3000); // Auto-refresh every 3 seconds
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

  const acceptBid = async (bidId) => {
    if (!confirm('Accept this bid?')) return;

    setAcceptingBid(bidId);
    try {
      const response = await fetch(`http://localhost:5000/api/bidding/bids/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Bid accepted! Your driver is on the way!');
        console.log("bidding data" , data.data)
        // NAVIGATE TO ACTIVE RIDE PAGE
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
            <p className="text-dim mt-1">{sortedBids.length} drivers interested</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center p-4">
            <span className="loading"></span>
          </div>
        ) : sortedBids.length === 0 ? (
          <div className="card text-center p-4">
            <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
            <p className="text-dim">No bids yet</p>
            <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
              Waiting for drivers to submit bids...
            </p>
          </div>
        ) : (
          sortedBids.map((bid, index) => (
            <div key={bid.id} className="card mb-3" style={{
              position: 'relative',
              border: index === 0 ? '2px solid #10B981' : undefined
            }}>
              {/* Lowest Bid Badge */}
              {index === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  background: '#10B981',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  🏆 LOWEST BID
                </div>
              )}

              {/* Bid Amount */}
              <div className="mb-3">
                <div className="text-dim" style={{fontSize: '0.75rem'}}>BID AMOUNT</div>
                <div className="font-bold" style={{fontSize: '2rem', color: '#10B981'}}>
                  ₹{bid.bid_amount}
                </div>
              </div>

              {/* Driver Info */}
              <div className="mb-3" style={{
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <span className="font-bold">{bid.driver_rating || '4.5'}</span>
                  <span className="text-dim" style={{fontSize: '0.875rem'}}>
                    ({bid.driver_completed_rides || 0} rides)
                  </span>
                </div>
                
                {bid.vehicle_make && bid.vehicle_model && (
                  <div className="text-dim" style={{fontSize: '0.875rem'}}>
                    🚗 {bid.vehicle_make} {bid.vehicle_model} - {bid.vehicle_color}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="flex gap-4 mb-3">
                {bid.estimated_arrival_minutes && (
                  <div>
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>ETA</div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} color="#94A3B8" />
                      <span style={{fontSize: '0.875rem'}}>{bid.estimated_arrival_minutes} min</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Driver Message */}
              {bid.driver_message && (
                <div className="mb-3" style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}>
                  <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.25rem'}}>
                    MESSAGE FROM DRIVER
                  </div>
                  <div style={{fontSize: '0.875rem'}}>{bid.driver_message}</div>
                </div>
              )}

              {/* Accept Button */}
              <button
                className="btn btn-primary w-full"
                onClick={() => acceptBid(bid.id)}
                disabled={acceptingBid === bid.id}
                style={{padding: '1rem'}}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewBids;