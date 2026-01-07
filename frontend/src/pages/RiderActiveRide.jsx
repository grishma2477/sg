// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { MapPin, Navigation, Phone, User, Clock, DollarSign, Star, MessageSquare } from 'lucide-react';

// const RiderActiveRide = ({ auth }) => {
//   const navigate = useNavigate();
//   const { rideId } = useParams();
//   const [ride, setRide] = useState(null);
//   const [stops, setStops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showReview, setShowReview] = useState(false);
//   const [rating, setRating] = useState(5);
//   const [review, setReview] = useState('');

//   useEffect(() => {
//     fetchRideDetails();
//     const interval = setInterval(fetchRideDetails, 3000); // Refresh every 3 seconds
//     return () => clearInterval(interval);
//   }, [rideId]);

//   const fetchRideDetails = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setRide(data.data);
//         if (data.data.stops) {
//           setStops(data.data.stops);
//         }
        
//         // Show review modal when ride is completed
//         if (data.data.status === 'completed' && !showReview) {
//           setTimeout(() => setShowReview(true), 1000);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching ride details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitReview = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}/review`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify({
//           rating,
//           review
//         })
//       });

//       if (response.ok) {
//         alert('✅ Thank you for your review!');
//         setShowReview(false);
//         navigate('/rider/dashboard');
//       }
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('Failed to submit review');
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       'accepted': { class: 'badge-warning', text: 'Driver Accepted', description: 'Your driver is on the way' },
//       'started': { class: 'badge-primary', text: 'Ride in Progress', description: 'Enjoy your ride!' },
//       'completed': { class: 'badge-success', text: 'Completed', description: 'Thanks for riding with us!' },
//       'cancelled': { class: 'badge-danger', text: 'Cancelled', description: 'This ride was cancelled' }
//     };
//     return badges[status] || { class: 'badge-secondary', text: status, description: '' };
//   };

//   const getStopStatus = (stop) => {
//     if (stop.actual_departure_time) {
//       return { text: 'Completed', color: '#10B981', icon: '✓' };
//     } else if (stop.actual_arrival_time) {
//       return { text: 'At Stop', color: '#F59E0B', icon: '⏸' };
//     } else {
//       return { text: 'Pending', color: '#94A3B8', icon: '○' };
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-4">
//         <div className="text-center p-4">
//           <span className="loading"></span>
//         </div>
//       </div>
//     );
//   }

//   if (!ride) {
//     return (
//       <div className="p-4">
//         <div className="card text-center p-4">
//           <p className="text-dim">Ride not found</p>
//           <button className="btn btn-primary mt-3" onClick={() => navigate('/rider/dashboard')}>
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusBadge = getStatusBadge(ride.status);

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <h1 className="header-title">Your Ride</h1>
//         <div className="mt-2">
//           <div className={`badge ${statusBadge.class}`} style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
//             {statusBadge.text}
//           </div>
//           <p className="text-dim mt-1" style={{fontSize: '0.875rem'}}>{statusBadge.description}</p>
//         </div>
//       </div>

//       <div className="p-4">
//         {/* Driver Info */}
//         <div className="card mb-4" style={{
//           background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'
//         }}>
//           <div className="flex items-center gap-3 mb-3">
//             <div style={{
//               width: '60px',
//               height: '60px',
//               borderRadius: '50%',
//               background: 'linear-gradient(135deg, #10B981, #059669)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '1.5rem',
//               fontWeight: 'bold',
//               color: 'white'
//             }}>
//               {ride.driver_name?.charAt(0)?.toUpperCase() || 'D'}
//             </div>
//             <div className="flex-1">
//               <div className="font-bold" style={{fontSize: '1.25rem'}}>{ride.driver_name || 'Your Driver'}</div>
//               <div className="flex items-center gap-2 mt-1">
//                 <Star size={16} color="#F59E0B" fill="#F59E0B" />
//                 <span className="font-bold" style={{color: '#F59E0B'}}>4.8</span>
//                 <span className="text-dim" style={{fontSize: '0.875rem'}}>(127 rides)</span>
//               </div>
//             </div>
//             {ride.status !== 'completed' && ride.status !== 'cancelled' && (
//               <a 
//                 href={`tel:${ride.driver_phone}`}
//                 className="btn btn-primary"
//                 style={{padding: '0.75rem', borderRadius: '50%'}}
//               >
//                 <Phone size={20} />
//               </a>
//             )}
//           </div>

//           {/* Vehicle Info */}
//           {ride.vehicle_info && (
//             <div style={{
//               paddingTop: '1rem',
//               borderTop: '1px solid rgba(148, 163, 184, 0.2)'
//             }}>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <div className="text-dim" style={{fontSize: '0.75rem'}}>VEHICLE</div>
//                   <div className="font-bold">{ride.vehicle_info}</div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-dim" style={{fontSize: '0.75rem'}}>PLATE</div>
//                   <div className="font-bold">{ride.license_plate || 'N/A'}</div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Fare */}
//           {ride.fare_amount && (
//             <div className="flex items-center justify-between" style={{
//               paddingTop: '1rem',
//               borderTop: '1px solid rgba(148, 163, 184, 0.2)',
//               marginTop: '1rem'
//             }}>
//               <div className="text-dim">Total Fare</div>
//               <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>
//                 ₹{ride.fare_amount}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Progress Indicator */}
//         {ride.status === 'started' && (
//           <div className="card mb-4" style={{
//             background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
//             textAlign: 'center',
//             padding: '1.5rem'
//           }}>
//             <div className="animate-pulse" style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🚗</div>
//             <div className="font-bold" style={{fontSize: '1.125rem'}}>Ride in Progress</div>
//             <div className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
//               Sit back and enjoy your ride
//             </div>
//           </div>
//         )}

//         {/* Route with Stops */}
//         <div className="card mb-4">
//           <h3 className="font-bold mb-3">Route</h3>

//           {/* Pickup */}
//           <div className="flex items-start gap-2 mb-2">
//             <div style={{
//               width: '8px',
//               height: '8px',
//               borderRadius: '50%',
//               background: '#10B981',
//               marginTop: '0.5rem',
//               flexShrink: 0
//             }}></div>
//             <div>
//               <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
//               <div className="font-bold">{ride.pickup_address}</div>
//             </div>
//           </div>

//           {/* Stops */}
//           {stops && stops.length > 0 && stops.map((stop, idx) => {
//             const stopStatus = getStopStatus(stop);
//             return (
//               <React.Fragment key={stop.id}>
//                 <div style={{
//                   width: '1px',
//                   height: '20px',
//                   background: 'rgba(148, 163, 184, 0.3)',
//                   marginLeft: '3px',
//                   marginBottom: '0.5rem'
//                 }}></div>

//                 <div className="mb-2" style={{
//                   background: 'rgba(245, 158, 11, 0.1)',
//                   border: `2px solid ${stopStatus.color}`,
//                   borderRadius: '12px',
//                   padding: '1rem'
//                 }}>
//                   <div className="flex items-start gap-2">
//                     <div style={{
//                       width: '20px',
//                       height: '20px',
//                       borderRadius: '50%',
//                       background: stopStatus.color,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontSize: '0.75rem',
//                       fontWeight: 'bold',
//                       color: 'white',
//                       flexShrink: 0
//                     }}>
//                       {stopStatus.icon}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex justify-between items-start mb-1">
//                         <div className="text-dim" style={{fontSize: '0.75rem'}}>STOP {stop.stop_order}</div>
//                         <div className="badge" style={{
//                           background: stopStatus.color,
//                           color: 'white',
//                           fontSize: '0.75rem',
//                           padding: '0.25rem 0.5rem'
//                         }}>
//                           {stopStatus.text}
//                         </div>
//                       </div>
//                       <div className="font-bold">{stop.address}</div>
                      
//                       {stop.actual_arrival_time && (
//                         <div className="text-dim" style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>
//                           {stop.actual_departure_time ? 'Completed' : 'Waiting at stop...'}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </React.Fragment>
//             );
//           })}

//           <div style={{
//             width: '1px',
//             height: '20px',
//             background: 'rgba(148, 163, 184, 0.3)',
//             marginLeft: '3px',
//             marginBottom: '0.5rem'
//           }}></div>

//           {/* Dropoff */}
//           <div className="flex items-start gap-2">
//             <div style={{
//               width: '8px',
//               height: '8px',
//               borderRadius: '50%',
//               background: '#EF4444',
//               marginTop: '0.5rem',
//               flexShrink: 0
//             }}></div>
//             <div>
//               <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
//               <div className="font-bold">{ride.dropoff_address}</div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         {ride.status === 'completed' && (
//           <button
//             className="btn btn-primary w-full"
//             onClick={() => setShowReview(true)}
//             style={{padding: '1rem'}}
//           >
//             <Star size={20} />
//             Rate Your Ride
//           </button>
//         )}

//         {(ride.status === 'completed' || ride.status === 'cancelled') && !showReview && (
//           <button
//             className="btn btn-secondary w-full mt-3"
//             onClick={() => navigate('/rider/dashboard')}
//             style={{padding: '1rem'}}
//           >
//             Back to Dashboard
//           </button>
//         )}
//       </div>

//       {/* Review Modal */}
//       {showReview && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: 'rgba(0, 0, 0, 0.8)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 1000,
//           padding: '1rem'
//         }}>
//           <div className="card" style={{
//             maxWidth: '500px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflow: 'auto'
//           }}>
//             <h2 className="font-bold mb-3" style={{fontSize: '1.5rem'}}>Rate Your Ride</h2>
            
//             <div className="mb-4">
//               <div className="text-dim mb-2">How was your experience?</div>
//               <div className="flex justify-center gap-2">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <button
//                     key={star}
//                     onClick={() => setRating(star)}
//                     style={{
//                       background: 'none',
//                       border: 'none',
//                       cursor: 'pointer',
//                       padding: '0.5rem'
//                     }}
//                   >
//                     <Star
//                       size={40}
//                       color="#F59E0B"
//                       fill={star <= rating ? '#F59E0B' : 'none'}
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="text-dim mb-2" style={{display: 'block'}}>
//                 Share your feedback (optional)
//               </label>
//               <textarea
//                 className="w-full p-3"
//                 rows="4"
//                 placeholder="Tell us about your experience..."
//                 value={review}
//                 onChange={(e) => setReview(e.target.value)}
//                 style={{
//                   background: 'rgba(148, 163, 184, 0.1)',
//                   border: '1px solid rgba(148, 163, 184, 0.3)',
//                   borderRadius: '8px',
//                   resize: 'none'
//                 }}
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 className="btn btn-secondary flex-1"
//                 onClick={() => {
//                   setShowReview(false);
//                   navigate('/rider/dashboard');
//                 }}
//                 style={{padding: '1rem'}}
//               >
//                 Skip
//               </button>
//               <button
//                 className="btn btn-primary flex-1"
//                 onClick={submitReview}
//                 style={{padding: '1rem'}}
//               >
//                 Submit Review
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RiderActiveRide;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Star, ArrowLeft } from 'lucide-react';

const RiderActiveRide = ({ auth }) => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    console.log('🔍 Fetching ride details for ID:', rideId);
    fetchRideDetails();
    const interval = setInterval(fetchRideDetails, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      console.log('📦 Ride data received:', data);

      if (response.ok) {
        setRide(data.data);
        
        if (data.data.status === 'completed' && !showReview) {
          setTimeout(() => setShowReview(true), 1000);
        }
      } else {
        console.error('❌ Failed to fetch ride:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching ride details:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ rating, review })
      });

      if (response.ok) {
        alert('✅ Thank you for your review!');
        setShowReview(false);
        navigate('/rider/dashboard');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'accepted': { class: 'badge-warning', text: 'Driver Accepted' },
      'started': { class: 'badge-primary', text: 'Ride in Progress' },
      'completed': { class: 'badge-success', text: 'Completed' },
      'cancelled': { class: 'badge-danger', text: 'Cancelled' }
    };
    return badges[status] || { class: 'badge-secondary', text: status };
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center p-4">
          <span className="loading"></span>
          <p className="text-dim mt-2">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="p-4">
        <div className="card text-center p-4">
          <p className="text-dim">Ride not found</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/rider/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(ride.status);

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
            <h1 className="header-title">Your Ride</h1>
            <div className={`badge ${statusBadge.class} mt-2`}>
              {statusBadge.text}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Driver Info */}
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              D
            </div>
            <div className="flex-1">
              <div className="font-bold" style={{fontSize: '1.25rem'}}>Your Driver</div>
              <div className="flex items-center gap-2 mt-1">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <span className="font-bold" style={{color: '#F59E0B'}}>4.8</span>
                <span className="text-dim" style={{fontSize: '0.875rem'}}>(127 rides)</span>
              </div>
            </div>
            {ride.status !== 'completed' && ride.status !== 'cancelled' && (
              <a 
                href="tel:1234567890"
                className="btn btn-primary"
                style={{padding: '0.75rem', borderRadius: '50%'}}
              >
                <Phone size={20} />
              </a>
            )}
          </div>

          {ride.fare_amount && (
            <div className="flex items-center justify-between" style={{
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              marginTop: '1rem'
            }}>
              <div className="text-dim">Total Fare</div>
              <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>
                ₹{ride.fare_amount}
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {ride.status === 'accepted' && (
          <div className="card mb-4" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
            textAlign: 'center',
            padding: '1.5rem'
          }}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🚗</div>
            <div className="font-bold" style={{fontSize: '1.125rem'}}>Driver Accepted</div>
            <div className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
              Your driver is on the way
            </div>
          </div>
        )}

        {ride.status === 'started' && (
          <div className="card mb-4" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
            textAlign: 'center',
            padding: '1.5rem'
          }}>
            <div className="animate-pulse" style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🚗💨</div>
            <div className="font-bold" style={{fontSize: '1.125rem'}}>Ride in Progress</div>
            <div className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
              Sit back and enjoy your ride
            </div>
          </div>
        )}

        {/* Route */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Route</h3>

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
              <div className="font-bold">{ride.pickup_address || 'Pickup location'}</div>
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
              <div className="font-bold">{ride.dropoff_address || 'Dropoff location'}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {ride.status === 'completed' && (
          <button
            className="btn btn-primary w-full"
            onClick={() => setShowReview(true)}
            style={{padding: '1rem'}}
          >
            <Star size={20} />
            Rate Your Ride
          </button>
        )}

        {(ride.status === 'completed' || ride.status === 'cancelled') && !showReview && (
          <button
            className="btn btn-secondary w-full mt-3"
            onClick={() => navigate('/rider/dashboard')}
            style={{padding: '1rem'}}
          >
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Review Modal */}
      {showReview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 className="font-bold mb-3" style={{fontSize: '1.5rem'}}>Rate Your Ride</h2>
            
            <div className="mb-4">
              <div className="text-dim mb-2">How was your experience?</div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                  >
                    <Star
                      size={40}
                      color="#F59E0B"
                      fill={star <= rating ? '#F59E0B' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-dim mb-2" style={{display: 'block'}}>
                Share your feedback (optional)
              </label>
              <textarea
                className="w-full p-3"
                rows="4"
                placeholder="Tell us about your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                style={{
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  resize: 'none'
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => {
                  setShowReview(false);
                  navigate('/rider/dashboard');
                }}
                style={{padding: '1rem'}}
              >
                Skip
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={submitReview}
                style={{padding: '1rem'}}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderActiveRide;