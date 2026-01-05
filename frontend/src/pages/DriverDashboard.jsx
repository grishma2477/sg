// import { useState } from "react";
// import { RideRequestCard } from "../components/RideRequestCard";
// import { OnlineToggle } from "../components/OnlineToggle";

// export const rideRequests = [
//   {
//     id: 1,
//     pickup: "Gulshan Club, Road 49, Kemal Ataturk Avenue",
//     destination: "Banani DCC Market, Road 17 E, Banani",
//     riderName: "Md Shahadat Hossain",
//     rating: 98,
//     baseFare: 225,
//     distance: 0.5,
//     bonus: 25,
//   },
//   {
//     id: 2,
//     pickup: "Dhanmondi 27",
//     destination: "New Market",
//     riderName: "Rahim Uddin",
//     rating: 95,
//     baseFare: 180,
//     distance: 1.2,
//     bonus: 20,
//   },
// ];


// export const DriverDashboard = () => {
//   const [isOnline, setIsOnline] = useState(true);

//   const handleAcceptRide = (rideId, bidAmount) => {
//     console.log("Ride Accepted:", rideId, bidAmount);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto">
//       {/* Header */}
//       <div className="bg-green-600 text-white p-4 rounded-2xl mb-4">
//         <h1 className="text-xl font-bold">Sajilo Gaadi</h1>
//         <p className="text-sm">Driver Dashboard</p>
//       </div>

//       {/* Online Toggle */}
//       <OnlineToggle isOnline={isOnline} setIsOnline={setIsOnline} />

//       {/* Earnings */}
//       <div className="grid grid-cols-2 gap-3 mb-4">
//         {[
//           ["Total Earnings", "₹1,821.55"],
//           ["Trips", "18"],
//           ["Rating", "94%"],
//           ["Completion", "94%"],
//         ].map(([label, value]) => (
//           <div key={label} className="bg-white p-3 rounded-xl shadow">
//             <p className="text-xs text-gray-400">{label}</p>
//             <p className="font-bold text-lg">{value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Ride Requests */}
//       <h2 className="text-lg font-semibold mb-3">Ride Requests</h2>

//       {!isOnline ? (
//         <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow">
//           You are offline. Go online to receive ride requests.
//         </div>
//       ) : (
//         rideRequests.map((ride) => (
//           <RideRequestCard
//             key={ride.id}
//             ride={ride}
//             onAccept={handleAcceptRide}
//           />
//         ))
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Star, TrendingUp, Navigation, ToggleLeft, ToggleRight } from 'lucide-react';

const DriverDashboard = ({ auth, onLogout }) => {
  const navigate = useNavigate();
  
  // Get online status from localStorage on mount
  const [isOnline, setIsOnline] = useState(() => {
    const savedStatus = localStorage.getItem('driverOnlineStatus');
    return savedStatus === 'true';
  });
  
  const [stats, setStats] = useState({
    totalEarnings: 1821.55,
    totalTrips: 18,
    rating: 4.7,
    completionRate: 94,
    safetyPoints: 1150,
    tier: 'gold'
  });
  const [activeBids, setActiveBids] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch nearby requests when online
  useEffect(() => {
    if (isOnline) {
      fetchNearbyRequests();
      const interval = setInterval(fetchNearbyRequests, 10000); // Fetch every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Update location periodically when online
  useEffect(() => {
    if (isOnline) {
      updateLocation();
      const interval = setInterval(updateLocation, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const fetchNearbyRequests = async () => {
    try {
      console.log('🔍 Fetching nearby requests...');
      const response = await fetch('http://localhost:5000/api/ride-requests/nearby', {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      console.log('📍 Nearby requests response:', data);

      if (response.ok) {
        setNearbyRequests(data.data || []);
        console.log(`✅ Found ${data.data?.length || 0} nearby requests`);
      } else {
        console.error('❌ Failed to fetch requests:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching nearby requests:', error);
    }
  };

  const updateLocation = async () => {
    try {
      // Get browser location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            console.log('📍 Updating location:', latitude, longitude);
            
            await fetch('http://localhost:5000/api/drivers/location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
              },
              body: JSON.stringify({
                lat: latitude,
                lng: longitude
              })
            });
            console.log('✅ Location updated');
          },
          (error) => {
            console.warn('⚠️ Could not get location:', error.message);
            // Use default location if can't get real location
            updateDefaultLocation();
          }
        );
      } else {
        console.warn('⚠️ Geolocation not supported');
        updateDefaultLocation();
      }
    } catch (error) {
      console.error('❌ Error updating location:', error);
    }
  };

  const updateDefaultLocation = async () => {
    try {
      await fetch('http://localhost:5000/api/drivers/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          lat: 27.7100 + (Math.random() - 0.5) * 0.01,
          lng: 85.3250 + (Math.random() - 0.5) * 0.01
        })
      });
    } catch (error) {
      console.error('Error updating default location:', error);
    }
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    // Save to localStorage
    localStorage.setItem('driverOnlineStatus', newStatus.toString());
    
    console.log(newStatus ? '🟢 Driver is now ONLINE' : '🔴 Driver is now OFFLINE');
    
    if (newStatus) {
      // Immediately fetch requests when going online
      fetchNearbyRequests();
      updateLocation();
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      probation: '#EF4444',
      standard: '#94A3B8',
      silver: '#94A3B8',
      gold: '#F59E0B',
      platinum: '#8B5CF6'
    };
    return colors[tier] || '#94A3B8';
  };

  const getTierMultiplier = (tier) => {
    const multipliers = {
      probation: '0.5x',
      standard: '1.0x',
      silver: '1.2x',
      gold: '1.5x',
      platinum: '2.0x'
    };
    return multipliers[tier] || '1.0x';
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
            onClick={toggleOnlineStatus}
            className={`btn ${isOnline ? 'btn-primary' : 'btn-secondary'}`}
            style={{padding: '0.75rem 1rem'}}
          >
            {isOnline ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Online Status Banner */}
        {isOnline && (
          <div className="card mb-4" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '1rem'
          }}>
            <div className="flex items-center gap-2">
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10B981',
                animation: 'pulse 2s infinite'
              }}></div>
              <div>
                <div className="font-bold" style={{color: '#10B981'}}>You're Online</div>
                <div className="text-dim" style={{fontSize: '0.875rem'}}>
                  {nearbyRequests.length} nearby requests available
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Driver Status Card */}
        <div className="card mb-4" style={{
          background: `linear-gradient(135deg, ${getTierColor(stats.tier)}15, transparent)`,
          border: `1px solid ${getTierColor(stats.tier)}30`
        }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="badge" style={{
                background: `${getTierColor(stats.tier)}20`,
                color: getTierColor(stats.tier),
                border: `1px solid ${getTierColor(stats.tier)}30`,
                textTransform: 'uppercase'
              }}>
                {stats.tier} Tier
              </div>
              <div className="mt-2" style={{fontSize: '2rem', fontWeight: 700}}>
                {getTierMultiplier(stats.tier)}
              </div>
              <div className="text-dim" style={{fontSize: '0.875rem'}}>Visibility Multiplier</div>
            </div>
            <div className="text-right">
              <div style={{fontSize: '2rem', fontWeight: 700, color: getTierColor(stats.tier)}}>
                {stats.safetyPoints}
              </div>
              <div className="text-dim" style={{fontSize: '0.875rem'}}>Safety Points</div>
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(148, 163, 184, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(stats.safetyPoints / 1500) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getTierColor(stats.tier)}, ${getTierColor(stats.tier)}CC)`,
              transition: 'width 0.3s'
            }}></div>
          </div>
          <div className="text-dim mt-1" style={{fontSize: '0.75rem'}}>
            Next tier at 1300 points
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Earnings</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>
                  ₹{stats.totalEarnings.toFixed(2)}
                </div>
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
              <Navigation size={32} color="#8B5CF6" style={{opacity: 0.5}} />
            </div>
          </div>

          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Rating</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#F59E0B'}}>{stats.rating}/5</div>
              </div>
              <Star size={32} color="#F59E0B" style={{opacity: 0.5}} fill="#F59E0B" />
            </div>
          </div>

          <div className="card p-3" style={{background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>Completion</div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>{stats.completionRate}%</div>
              </div>
              <TrendingUp size={32} color="#06B6D4" style={{opacity: 0.5}} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <button 
            className="btn btn-primary w-full"
            style={{padding: '1.5rem', fontSize: '1.125rem'}}
            onClick={() => navigate('/driver/requests')}
            disabled={!isOnline}
          >
            <MapPin size={24} />
            View Nearby Requests ({nearbyRequests.length})
          </button>
          {!isOnline && (
            <p className="text-dim text-center mt-2" style={{fontSize: '0.875rem'}}>
              Go online to see ride requests
            </p>
          )}
        </div>

        {/* Active Bids */}
        <div>
          <h3 className="font-bold mb-3" style={{fontSize: '1.25rem'}}>Active Bids</h3>
          {activeBids.length === 0 ? (
            <div className="card text-center p-4">
              <DollarSign size={48} style={{margin: '0 auto', opacity: 0.3, marginBottom: '1rem'}} />
              <p className="text-dim">No active bids</p>
            </div>
          ) : (
            activeBids.map((bid) => (
              <div key={bid.id} className="card mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold" style={{fontSize: '1.25rem'}}>₹{bid.bidAmount}</div>
                    <div className="text-dim" style={{fontSize: '0.875rem'}}>{bid.destination}</div>
                  </div>
                  <div className="badge badge-warning">Pending</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;
