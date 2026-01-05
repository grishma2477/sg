import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Navigation } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="header">
        <h1 className="header-title">RideShare</h1>
        <p className="text-dim mt-1">Premium ride-sharing experience</p>
      </div>

      <div className="p-4 mt-4">
        <div className="card text-center p-4">
          <h2 className="font-bold" style={{fontSize: '1.5rem', marginBottom: '1rem'}}>
            Welcome to RideShare
          </h2>
          <p className="text-dim mb-4">
            Experience the future of ride-sharing with real-time bidding and multi-stop routes
          </p>
          
          <div className="flex flex-col gap-2 mt-4">
            <button 
              className="btn btn-primary w-full" 
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button 
              className="btn btn-secondary w-full" 
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="card p-3" style={{background: 'rgba(16, 185, 129, 0.1)'}}>
            <div className="flex items-center gap-2">
              <MapPin size={24} color="#10B981" />
              <div>
                <div className="font-bold">Multi-Stop Rides</div>
                <div className="text-dim" style={{fontSize: '0.875rem'}}>Add unlimited stops to your journey</div>
              </div>
            </div>
          </div>

          <div className="card p-3 mt-2" style={{background: 'rgba(139, 92, 246, 0.1)'}}>
            <div className="flex items-center gap-2">
              <DollarSign size={24} color="#8B5CF6" />
              <div>
                <div className="font-bold">Smart Bidding</div>
                <div className="text-dim" style={{fontSize: '0.875rem'}}>Drivers compete for your ride</div>
              </div>
            </div>
          </div>

          <div className="card p-3 mt-2" style={{background: 'rgba(6, 182, 212, 0.1)'}}>
            <div className="flex items-center gap-2">
              <Navigation size={24} color="#06B6D4" />
              <div>
                <div className="font-bold">Live Tracking</div>
                <div className="text-dim" style={{fontSize: '0.875rem'}}>Real-time driver location updates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
