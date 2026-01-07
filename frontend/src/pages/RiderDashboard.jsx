// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, Clock, DollarSign, Navigation, TrendingUp } from 'lucide-react';

// const RiderDashboard = ({ auth, onLogout }) => {
//   const navigate = useNavigate();
//   const [requests, setRequests] = useState([]);
//   const [stats, setStats] = useState({
//     totalRides: 18,
//     totalSpent: 1821.55,
//     rating: 4.7,
//     activeRequests: 0
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/ride-requests', {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setRequests(data.data || []);
//         setStats(prev => ({ ...prev, activeRequests: data.data.length }));
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
//         <h1 className="header-title">Dashboard</h1>
//         <p className="text-dim mt-1">Your ride activity</p>
//       </div>

//       <div className="p-4">
//         {/* Stats Grid */}
//         <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
//           <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Total Rides</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>{stats.totalRides}</div>
//               </div>
//               <TrendingUp size={32} color="#10B981" style={{opacity: 0.5}} />
//             </div>
//           </div>

//           <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Total Spent</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#8B5CF6'}}>₹{stats.totalSpent}</div>
//               </div>
//               <DollarSign size={32} color="#8B5CF6" style={{opacity: 0.5}} />
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
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>Active</div>
//                 <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>{stats.activeRequests}</div>
//               </div>
//               <Navigation size={32} color="#06B6D4" style={{opacity: 0.5}} />
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="mb-4">
//           <button
//             className="btn btn-primary w-full"
//             style={{padding: '1.5rem', fontSize: '1.125rem'}}
//             onClick={() => navigate('/rider/create-ride')}
//           >
//             <Navigation size={24} />
//             Request New Ride
//           </button>
//         </div>

//         {/* Active Requests */}
//         <div>
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-bold" style={{fontSize: '1.25rem'}}>Your Requests</h3>
//             {loading && <span className="loading"></span>}
//           </div>

//           {requests.length === 0 ? (
//             <div className="card text-center p-4">
//               <MapPin size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
//               <p className="text-dim">No active ride requests</p>
//               <button
//                 className="btn btn-primary mt-3"
//                 onClick={() => navigate('/rider/create-ride')}
//               >
//                 Create Your First Ride
//               </button>
//             </div>
//           ) : (
//             requests.map((request) => (
//               <div key={request.id} className="card mb-3">
//                 <div className="flex justify-between items-start mb-3">
//                   <div>
//                     <div className="badge badge-warning">
//                       {request.status}
//                     </div>
//                   </div>
//                   {request.pricing_mode === 'bidding' && (
//                     <button
//                       className="btn btn-primary"
//                       style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}
//                       onClick={() => navigate(`/rider/view-bids/${request.id}`)}
//                     >
//                       View Bids
//                     </button>
//                   )}
//                 </div>

//                 <div className="mb-2">
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

//                 <div style={{
//                   display: 'flex',
//                   gap: '1rem',
//                   marginTop: '1rem',
//                   paddingTop: '1rem',
//                   borderTop: '1px solid rgba(148, 163, 184, 0.1)'
//                 }}>
//                   <div className="flex items-center gap-1">
//                     <Clock size={16} color="#94A3B8" />
//                     <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                       {request.estimated_duration_minutes} min
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Navigation size={16} color="#94A3B8" />
//                     <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                       {request.estimated_distance_km} km
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <DollarSign size={16} color="#94A3B8" />
//                     <span className="text-dim" style={{fontSize: '0.875rem'}}>
//                       ₹{request.estimated_fare_min} - ₹{request.estimated_fare_max}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RiderDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  TrendingUp,
} from "lucide-react";

const RiderDashboard = ({ auth, onLogout }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRides: 18,
    totalSpent: 1821.55,
    rating: 4.7,
    activeRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/ride-requests", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setRequests(data.data || []);
        setStats((prev) => ({ ...prev, activeRequests: data.data.length }));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "badge-warning", text: "Waiting for Bids" },
      accepted: { class: "badge-success", text: "Driver Accepted" },
      in_progress: { class: "badge-primary", text: "In Progress" },
      completed: { class: "badge-secondary", text: "Completed" },
    };
    return badges[status] || { class: "badge-warning", text: status };
  };

  return (
    <div className="p-4" style={{ paddingBottom: "5rem" }}>
      <div className="header">
        <h1 className="header-title">Dashboard</h1>
        <p className="text-dim mt-1">Your ride activity</p>
      </div>

      <div className="p-4">
        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="card p-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: "0.75rem" }}>
                  Total Rides
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "#10B981" }}
                >
                  {stats.totalRides}
                </div>
              </div>
              <TrendingUp size={32} color="#10B981" style={{ opacity: 0.5 }} />
            </div>
          </div>

          <div
            className="card p-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: "0.75rem" }}>
                  Total Spent
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "#8B5CF6" }}
                >
                  ₹{stats.totalSpent}
                </div>
              </div>
              <DollarSign size={32} color="#8B5CF6" style={{ opacity: 0.5 }} />
            </div>
          </div>

          <div
            className="card p-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: "0.75rem" }}>
                  Rating
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "#F59E0B" }}
                >
                  {stats.rating}/5.0
                </div>
              </div>
              <div style={{ fontSize: "2rem" }}>⭐</div>
            </div>
          </div>

          <div
            className="card p-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{ fontSize: "0.75rem" }}>
                  Active
                </div>
                <div
                  className="font-bold"
                  style={{ fontSize: "1.5rem", color: "#06B6D4" }}
                >
                  {stats.activeRequests}
                </div>
              </div>
              <Navigation size={32} color="#06B6D4" style={{ opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <button
            className="btn btn-primary w-full"
            style={{ padding: "1.5rem", fontSize: "1.125rem" }}
            onClick={() => navigate("/rider/create-ride")}
          >
            <Navigation size={24} />
            Request New Ride
          </button>
        </div>

        {/* Active Requests */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold" style={{ fontSize: "1.25rem" }}>
              Your Requests
            </h3>
            {loading && <span className="loading"></span>}
          </div>

          {requests.length === 0 ? (
            <div className="card text-center p-4">
              <MapPin
                size={48}
                style={{ margin: "0 auto", opacity: 0.3, marginBottom: "1rem" }}
              />
              <p className="text-dim">No active ride requests</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/rider/create-ride")}
              >
                Create Your First Ride
              </button>
            </div>
          ) : (
            requests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              return (
                <div key={request.id} className="card mb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className={`badge ${statusBadge.class}`}>
                        {statusBadge.text}
                      </div>
                      <div
                        className="text-dim"
                        style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}
                      >
                        Created {new Date(request.created_at).toLocaleString()}
                      </div>
                    </div>
                    {request.pricing_mode === "bidding" &&
                      request.status === "pending" && (
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                          }}
                          onClick={() =>
                            navigate(`/rider/view-bids/${request.id}`)
                          }
                        >
                          View Bids
                        </button>
                      )}
                    {request.status === "accepted" &&
                      request.created_ride_id && (
                        <button
                          className="btn btn-success"
                          style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                          }}
                          onClick={() =>
                            navigate(
                              `/rider/active-ride/${request.created_ride_id}`
                            )
                          }
                        >
                          View Ride
                        </button>
                      )}
                  </div>

                  <div className="mb-2">
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#10B981",
                          marginTop: "0.5rem",
                          flexShrink: 0,
                        }}
                      ></div>
                      <div>
                        <div
                          className="text-dim"
                          style={{ fontSize: "0.75rem" }}
                        >
                          PICKUP
                        </div>
                        <div className="font-bold">
                          {request.pickup_address}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "1px",
                        height: "20px",
                        background: "rgba(148, 163, 184, 0.3)",
                        marginLeft: "3px",
                        marginBottom: "0.5rem",
                      }}
                    ></div>

                    <div className="flex items-start gap-2">
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#EF4444",
                          marginTop: "0.5rem",
                          flexShrink: 0,
                        }}
                      ></div>
                      <div>
                        <div
                          className="text-dim"
                          style={{ fontSize: "0.75rem" }}
                        >
                          DROPOFF
                        </div>
                        <div className="font-bold">
                          {request.dropoff_address}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                    }}
                  >
                    {request.estimated_duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} color="#94A3B8" />
                        <span
                          className="text-dim"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {request.estimated_duration_minutes} min
                        </span>
                      </div>
                    )}
                    {request.estimated_distance_km && (
                      <div className="flex items-center gap-1">
                        <Navigation size={16} color="#94A3B8" />
                        <span
                          className="text-dim"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {request.estimated_distance_km} km
                        </span>
                      </div>
                    )}
                    {request.estimated_fare_min &&
                      request.estimated_fare_max && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} color="#94A3B8" />
                          <span
                            className="text-dim"
                            style={{ fontSize: "0.875rem" }}
                          >
                            ₹{request.estimated_fare_min} - ₹
                            {request.estimated_fare_max}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
