import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Package, Navigation, ArrowLeft, Plus, Minus, Check } from 'lucide-react';

const DriverRequests = ({ auth }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmounts, setBidAmounts] = useState({});
  const [submittingBid, setSubmittingBid] = useState(null);
  const [acceptingRide, setAcceptingRide] = useState(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
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
      setRequests(data.data || []);
      
      // ONLY initialize bid amounts for NEW requests
      setBidAmounts(prev => {
        const newBids = { ...prev };
        data.data.forEach(req => {
          if (!newBids[req.id]) {
            const suggestedBid = req.estimated_fare_min 
              ? Math.floor((req.estimated_fare_min + req.estimated_fare_max) / 2)
              : 250;
            newBids[req.id] = suggestedBid;
          }
        });
        return newBids;
      });
    }
  } catch (error) {
    console.error('Error fetching requests:', error);
  } finally {
    setLoading(false);
  }
};
  // const fetchRequests = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/ride-requests/nearby', {
  //       headers: {
  //         'Authorization': `Bearer ${auth.token}`
  //       }
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       setRequests(data.data || []);
        
  //       // Initialize bid amounts
  //       const initialBids = {};
  //       data.data.forEach(req => {
  //         if (!bidAmounts[req.id]) {
  //           const suggestedBid = req.estimated_fare_min 
  //             ? Math.floor((req.estimated_fare_min + req.estimated_fare_max) / 2)
  //             : 250;
  //           initialBids[req.id] = suggestedBid;
  //         }
  //       });
  //       setBidAmounts(prev => ({ ...prev, ...initialBids }));
  //     }
  //   } catch (error) {
  //     console.error('Error fetching requests:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const incrementBid = (requestId, step = 10) => {
    setBidAmounts(prev => ({
      ...prev,
      [requestId]: (prev[requestId] || 0) + step
    }));
  };

  const decrementBid = (requestId, step = 10) => {
    setBidAmounts(prev => ({
      ...prev,
      [requestId]: Math.max(50, (prev[requestId] || 0) - step)
    }));
  };

  const submitBid = async (requestId) => {
    setSubmittingBid(requestId);
    try {
      const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          bidAmount: bidAmounts[requestId],
          estimatedArrivalMinutes: 5,
          driverMessage: 'I can pick you up quickly!'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Bid submitted successfully!');
        fetchRequests();
      } else {
        alert(data.message || 'Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Error: ' + error.message);
    } finally {
      setSubmittingBid(null);
    }
  };

  const acceptRide = async (requestId) => {
    if (!confirm('Accept this ride at fixed price?')) return;
    
    setAcceptingRide(requestId);
    try {
      const response = await fetch(`http://localhost:5000/api/ride-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Ride accepted!');
        navigate(`/driver/active-ride/${data.data.ride_id}`);
      } else {
        alert(data.message || 'Failed to accept ride');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('Error: ' + error.message);
    } finally {
      setAcceptingRide(null);
    }
  };

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/driver/dashboard')}
            className="btn btn-secondary"
            style={{padding: '0.5rem'}}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">Nearby Requests</h1>
            <p className="text-dim mt-1">{requests.length} available</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center p-4">
            <span className="loading"></span>
          </div>
        ) : requests.length === 0 ? (
          <div className="card text-center p-4">
            <MapPin size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
            <p className="text-dim">No ride requests available</p>
            <p className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
              Check back in a few moments
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="card mb-3">
              {/* Rider Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold">{request.rider_name || 'Anonymous Rider'}</div>
                  <div className="badge badge-warning" style={{marginTop: '0.5rem'}}>
                    {request.pricing_mode === 'bidding' ? 'Open to Bids' : 'Fixed Price'}
                  </div>
                </div>
                {request.estimated_fare_min && (
                  <div className="text-right">
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>Suggested Fare</div>
                    <div className="font-bold" style={{color: '#10B981'}}>
                      ₹{request.estimated_fare_min} - ₹{request.estimated_fare_max}
                    </div>
                  </div>
                )}
              </div>

              {/* Route with Stops */}
              <div className="mb-3">
                <div className="flex items-start gap-2 mb-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    marginTop: '0.5rem',
                    flexShrink: 0
                  }}></div>
                  <div>
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
                    <div className="font-bold">{request.pickup_address}</div>
                  </div>
                </div>

                {/* Stops */}
                {request.stops && request.stops.length > 0 && request.stops.map((stop, idx) => (
                  <React.Fragment key={idx}>
                    <div style={{
                      width: '1px',
                      height: '20px',
                      background: 'rgba(148, 163, 184, 0.3)',
                      marginLeft: '3px',
                      marginBottom: '0.5rem'
                    }}></div>

                    <div className="flex items-start gap-2 mb-2">
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#F59E0B',
                        marginTop: '0.5rem',
                        flexShrink: 0
                      }}></div>
                      <div>
                        <div className="text-dim" style={{fontSize: '0.75rem'}}>STOP {stop.stop_order}</div>
                        <div className="font-bold">{stop.address}</div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}

                <div style={{
                  width: '1px',
                  height: '20px',
                  background: 'rgba(148, 163, 184, 0.3)',
                  marginLeft: '3px',
                  marginBottom: '0.5rem'
                }}></div>

                <div className="flex items-start gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    marginTop: '0.5rem',
                    flexShrink: 0
                  }}></div>
                  <div>
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
                    <div className="font-bold">{request.dropoff_address}</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                flexWrap: 'wrap'
              }}>
                {request.estimated_duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} color="#94A3B8" />
                    <span className="text-dim" style={{fontSize: '0.875rem'}}>
                      {request.estimated_duration_minutes} min
                    </span>
                  </div>
                )}
                {request.estimated_distance_km && (
                  <div className="flex items-center gap-1">
                    <Navigation size={16} color="#94A3B8" />
                    <span className="text-dim" style={{fontSize: '0.875rem'}}>
                      {request.estimated_distance_km} km
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users size={16} color="#94A3B8" />
                  <span className="text-dim" style={{fontSize: '0.875rem'}}>
                    {request.passenger_count} passengers
                  </span>
                </div>
                {request.luggage_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Package size={16} color="#94A3B8" />
                    <span className="text-dim" style={{fontSize: '0.875rem'}}>
                      {request.luggage_count} bags
                    </span>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              {request.special_instructions && (
                <div className="mb-3" style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}>
                  <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.25rem'}}>
                    SPECIAL INSTRUCTIONS
                  </div>
                  <div style={{fontSize: '0.875rem'}}>{request.special_instructions}</div>
                </div>
              )}

              {/* Bid Controls or Accept Button */}
              {request.pricing_mode === 'bidding' ? (
                <div>
                  {/* Bid Amount Control */}
                  <div className="mb-3" style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div className="text-dim mb-2" style={{fontSize: '0.75rem'}}>YOUR BID AMOUNT</div>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        className="btn btn-secondary"
                        onClick={() => decrementBid(request.id, 10)}
                        style={{padding: '0.75rem', minWidth: '50px'}}
                      >
                        <Minus size={20} />
                      </button>
                      
                      <div className="text-center flex-1">
                        <div className="font-bold" style={{fontSize: '2rem', color: '#10B981'}}>
                          ₹{bidAmounts[request.id] || 0}
                        </div>
                      </div>
                      
                      <button
                        className="btn btn-secondary"
                        onClick={() => incrementBid(request.id, 10)}
                        style={{padding: '0.75rem', minWidth: '50px'}}
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    {/* Quick adjust buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        className="btn btn-secondary flex-1"
                        onClick={() => decrementBid(request.id, 50)}
                        style={{padding: '0.5rem', fontSize: '0.875rem'}}
                      >
                        -50
                      </button>
                      <button
                        className="btn btn-secondary flex-1"
                        onClick={() => incrementBid(request.id, 50)}
                        style={{padding: '0.5rem', fontSize: '0.875rem'}}
                      >
                        +50
                      </button>
                    </div>
                  </div>

                  {/* Submit Bid Button */}
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => submitBid(request.id)}
                    disabled={submittingBid === request.id}
                    style={{padding: '1rem'}}
                  >
                    {submittingBid === request.id ? (
                      <span className="loading"></span>
                    ) : (
                      <>
                        <DollarSign size={20} />
                        Submit Bid - ₹{bidAmounts[request.id] || 0}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // Fixed Price - Accept Ride Button
                <button
                  className="btn btn-primary w-full"
                  onClick={() => acceptRide(request.id)}
                  disabled={acceptingRide === request.id}
                  style={{padding: '1rem'}}
                >
                  {acceptingRide === request.id ? (
                    <span className="loading"></span>
                  ) : (
                    <>
                      <Check size={20} />
                      Accept Ride - ₹{request.estimated_fare_max || 'N/A'}
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverRequests;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, Clock, DollarSign, Users, Package, Navigation, ArrowLeft } from 'lucide-react';

// const DriverRequests = ({ auth }) => {
//   const navigate = useNavigate();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRequests();
//     const interval = setInterval(fetchRequests, 5000); // Refresh every 5 seconds
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
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => navigate('/driver/dashboard')}
//             className="btn btn-secondary"
//             style={{padding: '0.5rem'}}
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div>
//             <h1 className="header-title">Nearby Requests</h1>
//             <p className="text-dim mt-1">{requests.length} available</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-4">
//         {loading ? (
//           <div className="text-center p-4">
//             <span className="loading"></span>
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
//           requests.map((request) => (
//             <div key={request.id} className="card mb-3">
//               {/* Rider Info */}
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <div className="font-bold">{request.rider_name || 'Anonymous Rider'}</div>
//                   <div className="badge badge-warning" style={{marginTop: '0.5rem'}}>
//                     {request.pricing_mode === 'bidding' ? 'Open to Bids' : 'Fixed Price'}
//                   </div>
//                 </div>
//                 {request.estimated_fare_min && (
//                   <div className="text-right">
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>Estimated Fare</div>
//                     <div className="font-bold" style={{color: '#10B981'}}>
//                       ₹{request.estimated_fare_min} - ₹{request.estimated_fare_max}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Route with Stops */}
//               <div className="mb-3">
//                 <div className="flex items-start gap-2 mb-2">
//                   <div style={{
//                     width: '8px',
//                     height: '8px',
//                     borderRadius: '50%',
//                     background: '#10B981',
//                     marginTop: '0.5rem',
//                     flexShrink: 0
//                   }}></div>
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
//                     <div className="font-bold">{request.pickup_address}</div>
//                   </div>
//                 </div>

//                 {/* Stops */}
//                 {request.stops && request.stops.length > 0 && request.stops.map((stop, idx) => (
//                   <React.Fragment key={idx}>
//                     <div style={{
//                       width: '1px',
//                       height: '20px',
//                       background: 'rgba(148, 163, 184, 0.3)',
//                       marginLeft: '3px',
//                       marginBottom: '0.5rem'
//                     }}></div>

//                     <div className="flex items-start gap-2 mb-2">
//                       <div style={{
//                         width: '8px',
//                         height: '8px',
//                         borderRadius: '50%',
//                         background: '#F59E0B',
//                         marginTop: '0.5rem',
//                         flexShrink: 0
//                       }}></div>
//                       <div>
//                         <div className="text-dim" style={{fontSize: '0.75rem'}}>STOP {stop.stop_order}</div>
//                         <div className="font-bold">{stop.address}</div>
//                       </div>
//                     </div>
//                   </React.Fragment>
//                 ))}

//                 <div style={{
//                   width: '1px',
//                   height: '20px',
//                   background: 'rgba(148, 163, 184, 0.3)',
//                   marginLeft: '3px',
//                   marginBottom: '0.5rem'
//                 }}></div>

//                 <div className="flex items-start gap-2">
//                   <div style={{
//                     width: '8px',
//                     height: '8px',
//                     borderRadius: '50%',
//                     background: '#EF4444',
//                     marginTop: '0.5rem',
//                     flexShrink: 0
//                   }}></div>
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
//                     <div className="font-bold">{request.dropoff_address}</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Details */}
//               <div style={{
//                 display: 'flex',
//                 gap: '1rem',
//                 marginBottom: '1rem',
//                 paddingTop: '1rem',
//                 borderTop: '1px solid rgba(148, 163, 184, 0.1)',
//                 flexWrap: 'wrap'
//               }}>
//                 {request.estimated_duration_minutes && (
//                   <div className="flex items-center gap-1">
//                     <Clock size={16} color="#94A3B8" />
//                     <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                       {request.estimated_duration_minutes} min
//                     </span>
//                   </div>
//                 )}
//                 {request.estimated_distance_km && (
//                   <div className="flex items-center gap-1">
//                     <Navigation size={16} color="#94A3B8" />
//                     <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                       {request.estimated_distance_km} km
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-1">
//                   <Users size={16} color="#94A3B8" />
//                   <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                     {request.passenger_count} passengers
//                   </span>
//                 </div>
//                 {request.luggage_count > 0 && (
//                   <div className="flex items-center gap-1">
//                     <Package size={16} color="#94A3B8" />
//                     <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                       {request.luggage_count} bags
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Special Instructions */}
//               {request.special_instructions && (
//                 <div className="mb-3" style={{
//                   background: 'rgba(139, 92, 246, 0.1)',
//                   border: '1px solid rgba(139, 92, 246, 0.2)',
//                   borderRadius: '8px',
//                   padding: '0.75rem'
//                 }}>
//                   <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.25rem'}}>
//                     SPECIAL INSTRUCTIONS
//                   </div>
//                   <div style={{fontSize: '0.875rem'}}>{request.special_instructions}</div>
//                 </div>
//               )}

//               {/* Action Button */}
//               <button
//                 className="btn btn-primary w-full"
//                 onClick={() => navigate(`/driver/submit-bid/${request.id}`)}
//                 style={{padding: '1rem'}}
//               >
//                 <DollarSign size={20} />
//                 Submit Bid
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default DriverRequests;