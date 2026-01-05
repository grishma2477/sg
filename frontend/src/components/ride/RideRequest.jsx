import React, { useState } from 'react';
import { MapPin, Plus, X, Navigation, DollarSign, Users, Package } from 'lucide-react';

const CreateRideRequest = ({ auth, setView }) => {
  const [loading, setLoading] = useState(false);
  const [pricingMode, setPricingMode] = useState('bidding'); // or 'fixed'
  const [formData, setFormData] = useState({
    pickup: { lat: '', lng: '', address: '' },
    dropoff: { lat: '', lng: '', address: '' },
    stops: [],
    vehiclePreference: 'sedan',
    passengerCount: 1,
    luggageCount: 0,
    requiresWheelchairAccessible: false,
    requiresPetFriendly: false,
    requiresChildSeat: false,
    specialInstructions: ''
  });

  const [newStop, setNewStop] = useState({
    lat: '',
    lng: '',
    address: '',
    contactName: '',
    contactPhone: '',
    notes: '',
    maxWaitSeconds: 120
  });

  const addStop = () => {
    if (newStop.address) {
      setFormData({
        ...formData,
        stops: [...formData.stops, {...newStop}]
      });
      setNewStop({
        lat: '',
        lng: '',
        address: '',
        contactName: '',
        contactPhone: '',
        notes: '',
        maxWaitSeconds: 120
      });
    }
  };

  const removeStop = (index) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert address to coordinates (in real app, use geocoding API)
      const requestBody = {
        pickup: {
          lat: formData.pickup.lat || 27.7172,
          lng: formData.pickup.lng || 85.3240,
          address: formData.pickup.address
        },
        dropoff: {
          lat: formData.dropoff.lat || 27.6915,
          lng: formData.dropoff.lng || 85.3206,
          address: formData.dropoff.address
        },
        stops: formData.stops.map(stop => ({
          ...stop,
          lat: stop.lat || 27.7050,
          lng: stop.lng || 85.3200
        })),
        pricingMode,
        vehiclePreference: formData.vehiclePreference,
        passengerCount: formData.passengerCount,
        luggageCount: formData.luggageCount,
        requiresWheelchairAccessible: formData.requiresWheelchairAccessible,
        requiresPetFriendly: formData.requiresPetFriendly,
        requiresChildSeat: formData.requiresChildSeat,
        specialInstructions: formData.specialInstructions
      };

      const response = await fetch('http://localhost:5000/api/ride-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Ride request created successfully!');
        if (pricingMode === 'bidding') {
          setView('view-bids');
        } else {
          setView('rider-dashboard');
        }
      } else {
        alert(data.message || 'Failed to create ride request');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <h1 className="header-title">New Ride</h1>
        <p className="text-dim mt-1">Plan your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Pricing Mode Selection */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Pricing Mode</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn flex-1 ${pricingMode === 'fixed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPricingMode('fixed')}
            >
              <DollarSign size={20} />
              Fixed Price
            </button>
            <button
              type="button"
              className={`btn flex-1 ${pricingMode === 'bidding' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPricingMode('bidding')}
            >
              <Navigation size={20} />
              Let Drivers Bid
            </button>
          </div>
          <p className="text-dim mt-2" style={{fontSize: '0.875rem'}}>
            {pricingMode === 'bidding' 
              ? 'Drivers will compete to offer you the best price'
              : 'Get an instant fare estimate based on distance and time'
            }
          </p>
        </div>

        {/* Locations */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Route</h3>

          {/* Pickup */}
          <div className="mb-3">
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Pickup Location
            </label>
            <div style={{position: 'relative'}}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981'
              }}></div>
              <input
                type="text"
                className="input"
                placeholder="Enter pickup address"
                style={{paddingLeft: '3rem'}}
                value={formData.pickup.address}
                onChange={(e) => setFormData({
                  ...formData,
                  pickup: {...formData.pickup, address: e.target.value}
                })}
                required
              />
            </div>
          </div>

          {/* Stops */}
          {formData.stops.map((stop, index) => (
            <div key={index} className="mb-3" style={{position: 'relative'}}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '1rem',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F59E0B',
                zIndex: 2
              }}></div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                paddingLeft: '3rem'
              }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold">{stop.address}</div>
                    {stop.notes && (
                      <div className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
                        {stop.notes}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    style={{background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444'}}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Stop Section */}
          <div className="mb-3" style={{background: 'rgba(148, 163, 184, 0.05)', padding: '1rem', borderRadius: '12px'}}>
            <div className="flex items-center gap-2 mb-2">
              <Plus size={20} color="#F59E0B" />
              <span className="font-bold" style={{color: '#F59E0B'}}>Add Stop</span>
            </div>
            <input
              type="text"
              className="input mb-2"
              placeholder="Stop address"
              value={newStop.address}
              onChange={(e) => setNewStop({...newStop, address: e.target.value})}
              style={{fontSize: '0.875rem'}}
            />
            <input
              type="text"
              className="input mb-2"
              placeholder="Notes (optional)"
              value={newStop.notes}
              onChange={(e) => setNewStop({...newStop, notes: e.target.value})}
              style={{fontSize: '0.875rem'}}
            />
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={addStop}
              style={{padding: '0.75rem', fontSize: '0.875rem'}}
            >
              <Plus size={16} />
              Add This Stop
            </button>
          </div>

          {/* Dropoff */}
          <div>
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Dropoff Location
            </label>
            <div style={{position: 'relative'}}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#EF4444'
              }}></div>
              <input
                type="text"
                className="input"
                placeholder="Enter dropoff address"
                style={{paddingLeft: '3rem'}}
                value={formData.dropoff.address}
                onChange={(e) => setFormData({
                  ...formData,
                  dropoff: {...formData.dropoff, address: e.target.value}
                })}
                required
              />
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Ride Details</h3>

          <div className="mb-3">
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Vehicle Type
            </label>
            <select
              className="input"
              value={formData.vehiclePreference}
              onChange={(e) => setFormData({...formData, vehiclePreference: e.target.value})}
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
              <option value="van">Van</option>
            </select>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Passengers
              </label>
              <div style={{position: 'relative'}}>
                <Users size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="8"
                  style={{paddingLeft: '3rem'}}
                  value={formData.passengerCount}
                  onChange={(e) => setFormData({...formData, passengerCount: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Luggage
              </label>
              <div style={{position: 'relative'}}>
                <Package size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="10"
                  style={{paddingLeft: '3rem'}}
                  value={formData.luggageCount}
                  onChange={(e) => setFormData({...formData, luggageCount: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div className="mb-2">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
              <input
                type="checkbox"
                checked={formData.requiresWheelchairAccessible}
                onChange={(e) => setFormData({...formData, requiresWheelchairAccessible: e.target.checked})}
                style={{width: '20px', height: '20px'}}
              />
              <span>Wheelchair Accessible</span>
            </label>
          </div>

          <div className="mb-2">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
              <input
                type="checkbox"
                checked={formData.requiresPetFriendly}
                onChange={(e) => setFormData({...formData, requiresPetFriendly: e.target.checked})}
                style={{width: '20px', height: '20px'}}
              />
              <span>Pet Friendly</span>
            </label>
          </div>

          <div className="mb-3">
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
              <input
                type="checkbox"
                checked={formData.requiresChildSeat}
                onChange={(e) => setFormData({...formData, requiresChildSeat: e.target.checked})}
                style={{width: '20px', height: '20px'}}
              />
              <span>Child Seat Required</span>
            </label>
          </div>

          <div>
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Special Instructions
            </label>
            <textarea
              className="input"
              rows="3"
              placeholder="Any special requests or notes for the driver..."
              value={formData.specialInstructions}
              onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
          style={{padding: '1.25rem', fontSize: '1.125rem'}}
        >
          {loading ? (
            <span className="loading"></span>
          ) : (
            <>
              <Navigation size={24} />
              {pricingMode === 'bidding' ? 'Request Bids' : 'Confirm Ride'}
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary w-full mt-2"
          onClick={() => setView('rider-dashboard')}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateRideRequest;