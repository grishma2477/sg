import React, { useState, useEffect } from 'react';
import { 
  Award, Shield, CheckCircle, XCircle, X, Loader2, RefreshCw,
  User, Car, FileText, Eye, Clock, Search, AlertCircle
} from 'lucide-react';
import { getToken } from '../utils/CookieUtils';
import './AdminBadgeManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminBadgeManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [badges, setBadges] = useState({
    confirmed_identity: false,
    portrait_picture_check: false,
    driver_license_verified: false,
    authorized_driver: false,
    driving_history_check: false,
    national_police_check: false,
    vehicle_inspected: false,
    motor_vehicle_insurance: false,
    ctp_insurance_check: false,
    vehicle_registration_verified: false,
    blue_book_verified: false
  });

  const badgeDefinitions = [
    { id: 'confirmed_identity', label: 'Confirmed Identity', icon: User, points: 10, color: '#3b82f6' },
    { id: 'portrait_picture_check', label: 'Portrait Picture Check', icon: Eye, points: 5, color: '#8b5cf6' },
    { id: 'driver_license_verified', label: 'Driver License', icon: FileText, points: 15, color: '#10b981' },
    { id: 'authorized_driver', label: 'Authorized Driver', icon: Shield, points: 10, color: '#f59e0b' },
    { id: 'driving_history_check', label: 'Driving History', icon: Clock, points: 10, color: '#06b6d4' },
    { id: 'national_police_check', label: 'National Police Check', icon: Shield, points: 15, color: '#ef4444' },
    { id: 'vehicle_inspected', label: 'Vehicle Inspected', icon: Car, points: 10, color: '#6366f1' },
    { id: 'motor_vehicle_insurance', label: 'Motor Vehicle Insurance', icon: Shield, points: 10, color: '#ec4899' },
    { id: 'ctp_insurance_check', label: 'CTP Insurance', icon: Shield, points: 5, color: '#14b8a6' },
    { id: 'vehicle_registration_verified', label: 'Vehicle Registration', icon: FileText, points: 5, color: '#f97316' },
    { id: 'blue_book_verified', label: 'Blue Book', icon: FileText, points: 5, color: '#84cc16' }
  ];

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/drivers/badges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setDrivers(data.data.drivers || []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBadgeModal = (driver) => {
    setSelectedDriver(driver);
    setBadges({
      confirmed_identity: driver.confirmed_identity || false,
      portrait_picture_check: driver.portrait_picture_check || false,
      driver_license_verified: driver.driver_license_verified || false,
      authorized_driver: driver.authorized_driver || false,
      driving_history_check: driver.driving_history_check || false,
      national_police_check: driver.national_police_check || false,
      vehicle_inspected: driver.vehicle_inspected || false,
      motor_vehicle_insurance: driver.motor_vehicle_insurance || false,
      ctp_insurance_check: driver.ctp_insurance_check || false,
      vehicle_registration_verified: driver.vehicle_registration_verified || false,
      blue_book_verified: driver.blue_book_verified || false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
  };

  const handleBadgeToggle = (badgeId) => {
    setBadges({
      ...badges,
      [badgeId]: !badges[badgeId]
    });
  };

  const handleSaveBadges = async () => {
    if (!confirm('💾 Save badge changes for this driver?')) {
      return;
    }

    setProcessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/drivers/${selectedDriver.driver_id}/badges`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(badges)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Badges updated successfully!');
        closeModal();
        fetchDrivers();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Update badges error:', error);
      alert('Failed to update badges');
    } finally {
      setProcessing(false);
    }
  };

  const handleResetBadges = async () => {
    if (!confirm('⚠️ Reset ALL badges for this driver? This cannot be undone!')) {
      return;
    }

    setProcessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/drivers/${selectedDriver.driver_id}/badges/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ All badges reset!');
        closeModal();
        fetchDrivers();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Reset badges error:', error);
      alert('Failed to reset badges');
    } finally {
      setProcessing(false);
    }
  };

  const getLevelBadge = (level) => {
    const badges = {
      bronze: { bg: '#cd7f32', label: '🥉 Bronze' },
      silver: { bg: '#c0c0c0', label: '🥈 Silver' },
      gold: { bg: '#ffd700', label: '🥇 Gold' },
      platinum: { bg: '#e5e4e2', label: '💎 Platinum' }
    };
    const badge = badges[level] || badges.bronze;
    return (
      <span className="level-badge" style={{ background: badge.bg }}>
        {badge.label}
      </span>
    );
  };

  const filteredDrivers = drivers.filter(driver => {
    const searchLower = searchTerm.toLowerCase();
    return (
      driver.first_name?.toLowerCase().includes(searchLower) ||
      driver.last_name?.toLowerCase().includes(searchLower) ||
      driver.email?.toLowerCase().includes(searchLower)
    );
  });

  const calculateCurrentScore = () => {
    return badgeDefinitions.reduce((total, def) => {
      return total + (badges[def.id] ? def.points : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="badge-loading">
        <Loader2 className="spinner" size={48} />
        <p>Loading drivers...</p>
      </div>
    );
  }

  return (
    <div className="badge-management-container">
      {/* Header */}
      <div className="badge-header">
        <div>
          <h1><Award size={32} /> Driver Badge Management</h1>
          <p>Manage verification badges for all drivers</p>
        </div>
        <button onClick={fetchDrivers} className="btn-refresh">
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="badge-search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Drivers Grid */}
      <div className="drivers-grid">
        {filteredDrivers.length === 0 ? (
          <div className="no-drivers">
            <AlertCircle size={48} />
            <p>No drivers found</p>
          </div>
        ) : (
          filteredDrivers.map(driver => (
            <div key={driver.driver_id} className="driver-card">
              <div className="driver-header">
                <div className="driver-avatar">
                  {driver.profile_url ? (
                    <img src={driver.profile_url} alt={driver.first_name} />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="driver-info">
                  <h3>{driver.first_name} {driver.last_name}</h3>
                  <p>{driver.email}</p>
                </div>
              </div>

              <div className="driver-stats">
                <div className="stat">
                  <span className="stat-label">Level</span>
                  {getLevelBadge(driver.verification_level)}
                </div>
                <div className="stat">
                  <span className="stat-label">Score</span>
                  <span className="stat-value">{driver.dv_score || 0}/100</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Trips</span>
                  <span className="stat-value">{driver.total_trips || 0}</span>
                </div>
              </div>

              <div className="driver-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${driver.dv_score || 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">{driver.dv_score || 0}% Complete</span>
              </div>

              <button 
                onClick={() => openBadgeModal(driver)} 
                className="btn-manage-badges"
              >
                <Shield size={16} />
                Manage Badges
              </button>
            </div>
          ))
        )}
      </div>

      {/* Badge Modal */}
      {showModal && selectedDriver && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h2>🎖️ Manage Verification Badges</h2>
                <p>{selectedDriver.first_name} {selectedDriver.last_name}</p>
              </div>
              <button onClick={closeModal} className="modal-close">
                <X size={24} />
              </button>
            </div>

            {/* Current Score */}
            <div className="current-score">
              <div className="score-display">
                <Award size={32} />
                <div>
                  <div className="score-value">{calculateCurrentScore()}/100</div>
                  <div className="score-label">Verification Score</div>
                </div>
              </div>
              {getLevelBadge(selectedDriver.verification_level)}
            </div>

            {/* Badges Grid */}
            <div className="modal-content">
              <div className="badges-toggle-grid">
                {badgeDefinitions.map(badgeDef => {
                  const Icon = badgeDef.icon;
                  const isChecked = badges[badgeDef.id];

                  return (
                    <div 
                      key={badgeDef.id}
                      className={`badge-toggle-card ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleBadgeToggle(badgeDef.id)}
                    >
                      <div className="badge-toggle-header">
                        <div 
                          className="badge-toggle-icon"
                          style={{ 
                            background: isChecked ? badgeDef.color : '#e5e7eb',
                            color: isChecked ? 'white' : '#9ca3af'
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="badge-checkbox">
                          {isChecked ? (
                            <CheckCircle size={20} color="#10b981" />
                          ) : (
                            <XCircle size={20} color="#d1d5db" />
                          )}
                        </div>
                      </div>
                      <h4>{badgeDef.label}</h4>
                      <span className="badge-points">+{badgeDef.points} points</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                onClick={handleResetBadges}
                disabled={processing}
                className="btn-reset"
              >
                <XCircle size={20} />
                Reset All Badges
              </button>
              <button 
                onClick={handleSaveBadges}
                disabled={processing}
                className="btn-save-badges"
              >
                {processing ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadgeManagement;