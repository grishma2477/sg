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