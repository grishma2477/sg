// import React, { useState, useEffect } from 'react';
// import { MapPin, Navigation, DollarSign, Clock, Users } from 'lucide-react';

// const DriverRequests = ({ auth, setView }) => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   useEffect(() => {
//     fetchNearbyRequests();

//     // Listen for new requests via Socket.IO
//     const handleNewRequest = (requestData) => {
//       setRequests(prev => [requestData, ...prev]);
//     };

//     // socket.on('ride:request:new', handleNewRequest);
//     // return () => socket.off('ride:request:new', handleNewRequest);
//   }, []);

//   const fetchNearbyRequests = async () => {
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
//         <h1 className="header-title">Ride Requests</h1>
//         <p className="text-dim mt-1">Nearby opportunities</p>
//       </div>

//       <div className="p-4">
//         {loading ? (
//           <div className="text-center p-4">
//             <span className="loading"></span>
//           </div>
//         ) : requests.length === 0 ? (
//           <div className="card text-center p-4">
//             <MapPin size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//             <h3 className="font-bold mb-2">No Requests Nearby</h3>
//             <p className="text-dim">We'll notify you when riders request a ride in your area</p>
//           </div>
//         ) : (
//           <>
//             <div className="mb-3 text-center">
//               <div className="badge badge-success" style={{fontSize: '1rem', padding: '0.75rem 1.5rem'}}>
//                 {requests.length} {requests.length === 1 ? 'Request' : 'Requests'} Available
//               </div>
//             </div>

//             {requests.map((request) => (
//               <div key={request.id} className="card mb-3">
//                 {/* Header */}
//                 <div className="flex justify-between items-start mb-3">
//                   <div>
//                     {request.pricing_mode === 'bidding' ? (
//                       <div className="badge" style={{background: 'rgba(139, 92, 246, 0.2)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
//                         <DollarSign size={16} />
//                         Bidding
//                       </div>
//                     ) : (
//                       <div className="badge badge-success">
//                         Fixed Price
//                       </div>
//                     )}
//                   </div>
//                   <div className="text-right">
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>DISTANCE</div>
//                     <div className="font-bold" style={{color: '#10B981'}}>
//                       {request.distance_km?.toFixed(1) || 0.5} km
//                     </div>
//                   </div>
//                 </div>

//                 {/* Route */}
//                 <div className="mb-3">
//                   <div className="flex items-start gap-2 mb-2">
//                     <div style={{
//                       width: '8px',
//                       height: '8px',
//                       borderRadius: '50%',
//                       background: '#10B981',
//                       marginTop: '0.5rem',
//                       flexShrink: 0
//                     }}></div>
//                     <div>
//                       <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
//                       <div className="font-bold">{request.pickup_address}</div>
//                     </div>
//                   </div>

//                   {request.stops && request.stops.length > 0 && (
//                     <div className="flex items-start gap-2 mb-2 ml-1">
//                       <div style={{fontSize: '1rem', color: '#F59E0B'}}>⦿</div>
//                       <div>
//                         <div className="text-dim" style={{fontSize: '0.75rem'}}>
//                           {request.stops.length} {request.stops.length === 1 ? 'STOP' : 'STOPS'}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div style={{
//                     width: '1px',
//                     height: '20px',
//                     background: 'rgba(148, 163, 184, 0.3)',
//                     marginLeft: '3px',
//                     marginBottom: '0.5rem'
//                   }}></div>

//                   <div className="flex items-start gap-2">
//                     <div style={{
//                       width: '8px',
//                       height: '8px',
//                       borderRadius: '50%',
//                       background: '#EF4444',
//                       marginTop: '0.5rem',
//                       flexShrink: 0
//                     }}></div>
//                     <div>
//                       <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
//                       <div className="font-bold">{request.dropoff_address}</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Details */}
//                 <div style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr 1fr',
//                   gap: '0.5rem',
//                   marginBottom: '1rem',
//                   padding: '1rem',
//                   background: 'rgba(30, 41, 59, 0.4)',
//                   borderRadius: '12px'
//                 }}>
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>TIME</div>
//                     <div className="font-bold" style={{fontSize: '0.875rem'}}>
//                       {request.estimated_duration_minutes} min
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>FARE</div>
//                     <div className="font-bold" style={{fontSize: '0.875rem', color: '#10B981'}}>
//                       ₹{request.estimated_fare_min}-{request.estimated_fare_max}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-dim" style={{fontSize: '0.75rem'}}>PASSENGERS</div>
//                     <div className="font-bold" style={{fontSize: '0.875rem'}}>
//                       {request.passenger_count || 1}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Button */}
//                 <button
//                   className="btn btn-primary w-full"
//                   onClick={() => {
//                     setSelectedRequest(request);
//                     setView('submit-bid');
//                   }}
//                 >
//                   {request.pricing_mode === 'bidding' ? (
//                     <>
//                       <DollarSign size={20} />
//                       Submit Bid
//                     </>
//                   ) : (
//                     <>
//                       <Navigation size={20} />
//                       Accept Ride
//                     </>
//                   )}
//                 </button>
//               </div>
//             ))}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DriverRequests;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Users, Package, Navigation, ArrowLeft } from 'lucide-react';

const DriverRequests = ({ auth }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Refresh every 5 seconds
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
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
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
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>Estimated Fare</div>
                    <div className="font-bold" style={{color: '#10B981'}}>
                      ₹{request.estimated_fare_min} - ₹{request.estimated_fare_max}
                    </div>
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
                    marginTop: '0.5rem',
                    flexShrink: 0
                  }}></div>
                  <div>
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
                    <div className="font-bold">{request.pickup_address}</div>
                  </div>
                </div>

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

              {/* Action Button */}
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate(`/driver/submit-bid/${request.id}`)}
                style={{padding: '1rem'}}
              >
                <DollarSign size={20} />
                Submit Bid
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverRequests;