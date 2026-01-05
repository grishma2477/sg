import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Navigation, User, DollarSign } from 'lucide-react';

const BottomNav = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '430px',
      width: '100%',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 100
    }}>
      {userRole === 'rider' ? (
        <>
          <button 
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/rider/dashboard') ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
            onClick={() => navigate('/rider/dashboard')}
          >
            <MapPin size={24} />
            <span style={{fontSize: '0.75rem'}}>Rides</span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/rider/create-ride') ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
            onClick={() => navigate('/rider/create-ride')}
          >
            <Navigation size={24} />
            <span style={{fontSize: '0.75rem'}}>New</span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/rider/profile') ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
            onClick={() => navigate('/rider/profile')}
          >
            <User size={24} />
            <span style={{fontSize: '0.75rem'}}>Profile</span>
          </button>
        </>
      ) : (
        <>
          <button 
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/driver/dashboard') ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
            onClick={() => navigate('/driver/dashboard')}
          >
            <MapPin size={24} />
            <span style={{fontSize: '0.75rem'}}>Dashboard</span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/driver/requests') ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
            onClick={() => navigate('/driver/requests')}
          >
            <DollarSign size={24} />
            <span style={{fontSize: '0.75rem'}}>Requests</span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1"
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/driver/profile') ? '#10B981' : '#94A3B8',
              cursor: 'pointer',
              transition: 'color 0.3s'
            }}
            onClick={() => navigate('/driver/profile')}
          >
            <User size={24} />
            <span style={{fontSize: '0.75rem'}}>Profile</span>
          </button>
        </>
      )}
    </div>
  );
};

export default BottomNav;
