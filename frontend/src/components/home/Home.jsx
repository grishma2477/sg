import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Star, Clock, User, Menu, X } from 'lucide-react';
import io from 'socket.io-client';

// Socket connection
const socket = io('http://localhost:5000');

const RideShareApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState('rider'); // rider or driver
  const [auth, setAuth] = useState({ token: null, userId: null });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (auth.token) {
      socket.emit('authenticate', {
        userId: auth.userId,
        role: userRole,
        driverId: userRole === 'driver' ? auth.userId : null
      });
    }
  }, [auth, userRole]);

  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomePage setView={setCurrentView} userRole={userRole} />;
      case 'login': return <LoginPage setAuth={setAuth} setView={setCurrentView} setUserRole={setUserRole} />;
      case 'rider-dashboard': return <RiderDashboard auth={auth} setView={setCurrentView} />;
      case 'driver-dashboard': return <DriverDashboard auth={auth} setView={setCurrentView} />;
      case 'create-ride': return <CreateRideRequest auth={auth} setView={setCurrentView} />;
      case 'view-bids': return <ViewBids auth={auth} setView={setCurrentView} />;
      case 'driver-requests': return <DriverRequests auth={auth} setView={setCurrentView} />;
      case 'submit-bid': return <SubmitBid auth={auth} setView={setCurrentView} />;
      default: return <HomePage setView={setCurrentView} userRole={userRole} />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile-first design with elegant aesthetics */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;700;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #0F172A;
          --accent: #10B981;
          --danger: #EF4444;
          --warning: #F59E0B;
          --surface: #1E293B;
          --surface-light: #F8FAFC;
          --text: #F1F5F9;
          --text-dim: #94A3B8;
          --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        body {
          font-family: 'Satoshi', -apple-system, sans-serif;
          background: var(--primary);
          color: var(--text);
          overflow-x: hidden;
        }

        .app-container {
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--primary);
          position: relative;
        }

        /* Animated background */
        .app-container::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          animation: drift 20s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        .view-container {
          position: relative;
          z-index: 1;
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header styles */
        .header {
          padding: 1.5rem 1.5rem 1rem;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #10B981, #06B6D4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        /* Button styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: 'Satoshi', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .btn:hover::before {
          transform: translateX(100%);
        }

        .btn-primary {
          background: var(--accent);
          color: white;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary {
          background: var(--surface);
          color: var(--text);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .btn-danger {
          background: var(--danger);
          color: white;
        }

        /* Card styles */
        .card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        /* Input styles */
        .input {
          width: 100%;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          color: var(--text);
          font-size: 1rem;
          font-family: 'Satoshi', sans-serif;
          transition: all 0.3s;
        }

        .input:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(30, 41, 59, 0.6);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .input::placeholder {
          color: var(--text-dim);
        }

        /* Status badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.2);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        /* Utility classes */
        .mt-1 { margin-top: 0.5rem; }
        .mt-2 { margin-top: 1rem; }
        .mt-3 { margin-top: 1.5rem; }
        .mt-4 { margin-top: 2rem; }
        .mb-1 { margin-bottom: 0.5rem; }
        .mb-2 { margin-bottom: 1rem; }
        .mb-3 { margin-bottom: 1.5rem; }
        .mb-4 { margin-bottom: 2rem; }
        .p-1 { padding: 0.5rem; }
        .p-2 { padding: 1rem; }
        .p-3 { padding: 1.5rem; }
        .p-4 { padding: 2rem; }

        .text-center { text-align: center; }
        .text-dim { color: var(--text-dim); }
        .font-bold { font-weight: 700; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 1rem; }
        .w-full { width: 100%; }

        /* Loading animation */
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="view-container">
        {renderView()}
      </div>

      {/* Bottom navigation for authenticated users */}
      {auth.token && (
        <BottomNav currentView={currentView} setView={setCurrentView} userRole={userRole} />
      )}
    </div>
  );
};

// Home Page Component
const HomePage = ({ setView, userRole }) => {
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
            <button className="btn btn-primary w-full" onClick={() => setView('login')}>
              Get Started
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

// Bottom Navigation Component
const BottomNav = ({ currentView, setView, userRole }) => {
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
            style={{background: 'none', border: 'none', color: currentView === 'rider-dashboard' ? '#10B981' : '#94A3B8', cursor: 'pointer'}}
            onClick={() => setView('rider-dashboard')}
          >
            <MapPin size={24} />
            <span style={{fontSize: '0.75rem'}}>Rides</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1"
            style={{background: 'none', border: 'none', color: currentView === 'create-ride' ? '#10B981' : '#94A3B8', cursor: 'pointer'}}
            onClick={() => setView('create-ride')}
          >
            <Navigation size={24} />
            <span style={{fontSize: '0.75rem'}}>New</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1"
            style={{background: 'none', border: 'none', color: currentView === 'profile' ? '#10B981' : '#94A3B8', cursor: 'pointer'}}
          >
            <User size={24} />
            <span style={{fontSize: '0.75rem'}}>Profile</span>
          </button>
        </>
      ) : (
        <>
          <button 
            className="flex flex-col items-center gap-1"
            style={{background: 'none', border: 'none', color: currentView === 'driver-dashboard' ? '#10B981' : '#94A3B8', cursor: 'pointer'}}
            onClick={() => setView('driver-dashboard')}
          >
            <MapPin size={24} />
            <span style={{fontSize: '0.75rem'}}>Dashboard</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1"
            style={{background: 'none', border: 'none', color: currentView === 'driver-requests' ? '#10B981' : '#94A3B8', cursor: 'pointer'}}
            onClick={() => setView('driver-requests')}
          >
            <DollarSign size={24} />
            <span style={{fontSize: '0.75rem'}}>Requests</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1"
            style={{background: 'none', border: 'none', color: currentView === 'profile' ? '#10B981' : '#94A3B8', cursor: 'pointer'}}
          >
            <User size={24} />
            <span style={{fontSize: '0.75rem'}}>Profile</span>
          </button>
        </>
      )}
    </div>
  );
};

export default RideShareApp;