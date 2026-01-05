import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Star, Shield } from 'lucide-react';

const ProfilePage = ({ auth, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <h1 className="header-title">Profile</h1>
        <p className="text-dim mt-1">Manage your account</p>
      </div>

      <div className="p-4">
        {/* Profile Card */}
        <div className="card mb-4 text-center">
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            {auth.userId?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="font-bold" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
            User #{auth.userId?.slice(0, 8)}
          </h2>
          <div className="badge" style={{
            background: auth.userRole === 'rider' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
            color: auth.userRole === 'rider' ? '#10B981' : '#8B5CF6',
            textTransform: 'capitalize'
          }}>
            {auth.userRole}
          </div>
        </div>

        {/* Account Info */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Account Information</h3>
          
          <div className="flex items-center gap-3 mb-3 p-3" style={{background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px'}}>
            <Mail size={20} color="#94A3B8" />
            <div>
              <div className="text-dim" style={{fontSize: '0.75rem'}}>Email</div>
              <div>user@example.com</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3 p-3" style={{background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px'}}>
            <Phone size={20} color="#94A3B8" />
            <div>
              <div className="text-dim" style={{fontSize: '0.75rem'}}>Phone</div>
              <div>+1234567890</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3" style={{background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px'}}>
            <User size={20} color="#94A3B8" />
            <div>
              <div className="text-dim" style={{fontSize: '0.75rem'}}>User ID</div>
              <div style={{fontSize: '0.875rem'}}>{auth.userId}</div>
            </div>
          </div>
        </div>

        {/* Stats (Driver only) */}
        {auth.userRole === 'driver' && (
          <div className="card mb-4">
            <h3 className="font-bold mb-3">Driver Stats</h3>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="p-3" style={{background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px'}}>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <div className="text-dim" style={{fontSize: '0.75rem'}}>Rating</div>
                </div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#F59E0B'}}>4.8</div>
              </div>

              <div className="p-3" style={{background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px'}}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} color="#10B981" />
                  <div className="text-dim" style={{fontSize: '0.75rem'}}>Safety Points</div>
                </div>
                <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>1150</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Actions</h3>
          
          <button className="btn btn-secondary w-full mb-2">
            Edit Profile
          </button>
          
          <button className="btn btn-secondary w-full mb-2">
            Change Password
          </button>
          
          <button className="btn btn-secondary w-full">
            Privacy Settings
          </button>
        </div>

        {/* Logout */}
        <button 
          className="btn btn-danger w-full"
          onClick={handleLogout}
          style={{padding: '1.25rem', fontSize: '1.125rem'}}
        >
          <LogOut size={24} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;