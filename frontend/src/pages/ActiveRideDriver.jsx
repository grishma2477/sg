// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { MapPin, Navigation, Phone, User, Clock, DollarSign, CheckCircle, XCircle, Play, Flag } from 'lucide-react';

// const ActiveRide = ({ auth }) => {
//   const navigate = useNavigate();
//   const { rideId } = useParams();
//   const [ride, setRide] = useState(null);
//   const [stops, setStops] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

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
//       }
//     } catch (error) {
//       console.error('Error fetching ride details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startRide = async () => {
//     if (!confirm('Start this ride?')) return;

//     setActionLoading(true);
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}/start`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('✅ Ride started!');
//         fetchRideDetails();
//       } else {
//         alert(data.message || 'Failed to start ride');
//       }
//     } catch (error) {
//       console.error('Error starting ride:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const arriveAtStop = async (stopId) => {
//     setActionLoading(true);
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}/stops/${stopId}/arrive`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('✅ Arrived at stop!');
//         fetchRideDetails();
//       } else {
//         alert(data.message || 'Failed to update stop');
//       }
//     } catch (error) {
//       console.error('Error updating stop:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const departFromStop = async (stopId) => {
//     setActionLoading(true);
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}/stops/${stopId}/depart`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('✅ Departed from stop!');
//         fetchRideDetails();
//       } else {
//         alert(data.message || 'Failed to update stop');
//       }
//     } catch (error) {
//       console.error('Error updating stop:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const completeRide = async () => {
//     if (!confirm('Mark this ride as completed?')) return;

//     setActionLoading(true);
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}/complete`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('✅ Ride completed! Waiting for rider review...');
//         navigate('/driver/dashboard');
//       } else {
//         alert(data.message || 'Failed to complete ride');
//       }
//     } catch (error) {
//       console.error('Error completing ride:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const cancelRide = async () => {
//     const reason = prompt('Please provide a reason for cancellation:');
//     if (!reason) return;

//     setActionLoading(true);
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}/cancel`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify({ reason })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Ride cancelled');
//         navigate('/driver/dashboard');
//       } else {
//         alert(data.message || 'Failed to cancel ride');
//       }
//     } catch (error) {
//       console.error('Error cancelling ride:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       'accepted': { class: 'badge-warning', text: 'Accepted', icon: CheckCircle },
//       'started': { class: 'badge-primary', text: 'In Progress', icon: Navigation },
//       'completed': { class: 'badge-success', text: 'Completed', icon: CheckCircle },
//       'cancelled': { class: 'badge-danger', text: 'Cancelled', icon: XCircle }
//     };
//     return badges[status] || { class: 'badge-secondary', text: status, icon: Clock };
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
//           <button className="btn btn-primary mt-3" onClick={() => navigate('/driver/dashboard')}>
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusBadge = getStatusBadge(ride.status);
//   const StatusIcon = statusBadge.icon;

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <h1 className="header-title">Active Ride</h1>
//         <div className="flex items-center gap-2 mt-2">
//           <StatusIcon size={20} />
//           <span className={`badge ${statusBadge.class}`} style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
//             {statusBadge.text}
//           </span>
//         </div>
//       </div>

//       <div className="p-4">
//         {/* Rider Info */}
//         <div className="card mb-4" style={{
//           background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'
//         }}>
//           <div className="flex items-center gap-3 mb-3">
//             <div style={{
//               width: '60px',
//               height: '60px',
//               borderRadius: '50%',
//               background: 'linear-gradient(135deg, #667eea, #764ba2)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '1.5rem',
//               fontWeight: 'bold'
//             }}>
//               {ride.rider_name?.charAt(0)?.toUpperCase() || 'R'}
//             </div>
//             <div className="flex-1">
//               <div className="font-bold" style={{fontSize: '1.25rem'}}>{ride.rider_name || 'Rider'}</div>
//               <div className="flex items-center gap-2 mt-1">
//                 <Phone size={16} color="#94A3B8" />
//                 <a href={`tel:${ride.rider_phone}`} className="text-dim" style={{textDecoration: 'none'}}>
//                   {ride.rider_phone || 'No phone'}
//                 </a>
//               </div>
//             </div>
//           </div>

//           {ride.fare_amount && (
//             <div className="flex items-center justify-between" style={{
//               paddingTop: '1rem',
//               borderTop: '1px solid rgba(148, 163, 184, 0.2)'
//             }}>
//               <div className="text-dim">Fare Amount</div>
//               <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>
//                 ₹{ride.fare_amount}
//               </div>
//             </div>
//           )}
//         </div>

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

//                 <div className="mb-3" style={{
//                   background: 'rgba(245, 158, 11, 0.1)',
//                   border: `2px solid ${stopStatus.color}`,
//                   borderRadius: '12px',
//                   padding: '1rem'
//                 }}>
//                   <div className="flex items-start gap-2 mb-2">
//                     <div style={{
//                       width: '24px',
//                       height: '24px',
//                       borderRadius: '50%',
//                       background: stopStatus.color,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontSize: '0.875rem',
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
//                       <div className="font-bold mb-2">{stop.address}</div>

//                       {/* Stop Actions */}
//                       {ride.status === 'started' && !stop.actual_departure_time && (
//                         <div className="flex gap-2 mt-2">
//                           {!stop.actual_arrival_time ? (
//                             <button
//                               className="btn btn-primary flex-1"
//                               onClick={() => arriveAtStop(stop.id)}
//                               disabled={actionLoading}
//                               style={{padding: '0.5rem', fontSize: '0.875rem'}}
//                             >
//                               <Flag size={16} />
//                               Arrive at Stop
//                             </button>
//                           ) : (
//                             <button
//                               className="btn btn-success flex-1"
//                               onClick={() => departFromStop(stop.id)}
//                               disabled={actionLoading}
//                               style={{padding: '0.5rem', fontSize: '0.875rem'}}
//                             >
//                               <Navigation size={16} />
//                               Depart from Stop
//                             </button>
//                           )}
//                         </div>
//                       )}

//                       {/* Timestamps */}
//                       {stop.actual_arrival_time && (
//                         <div className="text-dim" style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>
//                           Arrived: {new Date(stop.actual_arrival_time).toLocaleTimeString()}
//                         </div>
//                       )}
//                       {stop.actual_departure_time && (
//                         <div className="text-dim" style={{fontSize: '0.75rem'}}>
//                           Departed: {new Date(stop.actual_departure_time).toLocaleTimeString()}
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
//         <div className="space-y-3">
//           {ride.status === 'accepted' && (
//             <>
//               <button
//                 className="btn btn-primary w-full"
//                 onClick={startRide}
//                 disabled={actionLoading}
//                 style={{padding: '1.25rem', fontSize: '1.125rem'}}
//               >
//                 {actionLoading ? (
//                   <span className="loading"></span>
//                 ) : (
//                   <>
//                     <Play size={24} />
//                     Start Ride
//                   </>
//                 )}
//               </button>

//               <button
//                 className="btn btn-danger w-full"
//                 onClick={cancelRide}
//                 disabled={actionLoading}
//                 style={{padding: '1rem'}}
//               >
//                 <XCircle size={20} />
//                 Cancel Ride
//               </button>
//             </>
//           )}

//           {ride.status === 'started' && (
//             <>
//               <button
//                 className="btn btn-success w-full"
//                 onClick={completeRide}
//                 disabled={actionLoading}
//                 style={{padding: '1.25rem', fontSize: '1.125rem'}}
//               >
//                 {actionLoading ? (
//                   <span className="loading"></span>
//                 ) : (
//                   <>
//                     <CheckCircle size={24} />
//                     Complete Ride
//                   </>
//                 )}
//               </button>

//               <button
//                 className="btn btn-danger w-full"
//                 onClick={cancelRide}
//                 disabled={actionLoading}
//                 style={{padding: '1rem'}}
//               >
//                 <XCircle size={20} />
//                 Cancel Ride
//               </button>
//             </>
//           )}

//           {(ride.status === 'completed' || ride.status === 'cancelled') && (
//             <button
//               className="btn btn-secondary w-full"
//               onClick={() => navigate('/driver/dashboard')}
//               style={{padding: '1rem'}}
//             >
//               Back to Dashboard
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActiveRide;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Phone, Star, ArrowLeft, Navigation } from 'lucide-react';

const DriverActiveRide = ({ auth }) => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
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
      if (response.ok && data.success) {
        setRide(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('✅ Ride Started!');
        fetchRideDetails();
      } else {
        alert('Failed to start ride: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error starting ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    if (actionLoading) return;
    
    if (!confirm('Complete this ride? This will redirect to rating page.')) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('✅ Ride Completed!');
        // Redirect to rating page
        navigate(`/rating/${rideId}`);
      } else {
        alert('Failed to complete ride: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error completing ride');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      'accepted': { 
        color: '#F59E0B', 
        text: 'Ride Accepted', 
        message: '📍 Navigate to pickup location',
        action: 'START RIDE',
        handler: handleStartRide
      },
      'started': { 
        color: '#8B5CF6', 
        text: 'Ride in Progress', 
        message: '🚗 Take rider to destination',
        action: 'COMPLETE RIDE',
        handler: handleCompleteRide
      },
      'completed': { 
        color: '#10B981', 
        text: 'Completed', 
        message: '✅ Thanks for the ride!',
        action: null
      }
    };
    return statuses[status] || statuses['accepted'];
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
          <p className="text-dim">Unable to load ride details</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/driver/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ride.status);

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={() => navigate('/driver/dashboard')}
            className="btn btn-secondary"
            style={{padding: '0.5rem'}}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="header-title">Active Ride</h1>
            <div className="badge mt-2" style={{background: statusInfo.color, color: 'white', padding: '0.5rem 1rem'}}>
              {statusInfo.text}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Status Message */}
        <div className="card mb-4" style={{
          background: `linear-gradient(135deg, ${statusInfo.color}33, ${statusInfo.color}11)`,
          textAlign: 'center',
          padding: '1.5rem',
          border: `2px solid ${statusInfo.color}`
        }}>
          <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>
            {ride.status === 'accepted' ? '📍' : ride.status === 'started' ? '🚗' : '✅'}
          </div>
          <div className="font-bold" style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>
            {statusInfo.text}
          </div>
          <div className="text-dim">
            {statusInfo.message}
          </div>
        </div>

        {/* Action Button */}
        {statusInfo.action && (
          <button
            onClick={statusInfo.handler}
            disabled={actionLoading}
            className="btn btn-success w-full mb-4"
            style={{padding: '1.25rem', fontSize: '1.25rem', fontWeight: 'bold'}}
          >
            {actionLoading ? 'Processing...' : statusInfo.action}
          </button>
        )}

        {/* Rider Info */}
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'
        }}>
          <h3 className="font-bold mb-3">Rider Information</h3>
          
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {ride.rider_name?.[0] || 'R'}
            </div>
            <div className="flex-1">
              <div className="font-bold" style={{fontSize: '1.125rem'}}>
                {ride.rider_name || 'Rider'}
              </div>
              {ride.rider_phone && (
                <div className="text-dim" style={{fontSize: '0.875rem'}}>
                  {ride.rider_phone}
                </div>
              )}
            </div>
            {ride.rider_phone && (
              <a 
                href={`tel:${ride.rider_phone}`}
                className="btn btn-primary"
                style={{padding: '0.75rem', borderRadius: '50%'}}
              >
                <Phone size={20} />
              </a>
            )}
          </div>

          <div className="flex items-center justify-between" style={{
            paddingTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <div className="text-dim">Fare</div>
            <div className="font-bold" style={{fontSize: '1.5rem', color: '#8B5CF6'}}>
              ₹{ride.fare_amount}
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Route</h3>

          <div className="flex items-start gap-2 mb-2">
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10B981',
              marginTop: '0.5rem',
              flexShrink: 0
            }}></div>
            <div className="flex-1">
              <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
              <div className="font-bold">{ride.pickup_address}</div>
            </div>
          </div>

          {ride.stops && ride.stops.length > 0 && ride.stops.map((stop, idx) => (
            <React.Fragment key={stop.id}>
              <div style={{
                width: '2px',
                height: '20px',
                background: 'rgba(148, 163, 184, 0.3)',
                marginLeft: '4px',
                marginBottom: '0.5rem'
              }}></div>

              <div className="mb-2" style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <div className="flex items-start gap-2">
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-dim" style={{fontSize: '0.75rem'}}>STOP {stop.stop_order}</div>
                    <div className="font-bold">{stop.address}</div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}

          <div style={{
            width: '2px',
            height: '20px',
            background: 'rgba(148, 163, 184, 0.3)',
            marginLeft: '4px',
            marginBottom: '0.5rem'
          }}></div>

          <div className="flex items-start gap-2">
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#EF4444',
              marginTop: '0.5rem',
              flexShrink: 0
            }}></div>
            <div className="flex-1">
              <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
              <div className="font-bold">{ride.dropoff_address}</div>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="card">
          <h3 className="font-bold mb-3">Trip Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-dim">Distance</span>
              <span className="font-bold">{ride.estimated_distance_km} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dim">Duration</span>
              <span className="font-bold">{ride.estimated_duration_minutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dim">Passengers</span>
              <span className="font-bold">{ride.passenger_count || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverActiveRide;