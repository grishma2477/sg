import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, Clock, Award, Star, TrendingUp,
  User, Car, FileText, Eye, MapPin, AlertCircle
} from 'lucide-react';
import { getToken } from '../utils/CookieUtils';
import './Driverprofile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DriverProfile = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/drivers/verification-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setVerification(data.data.verification);
        setDriver(data.data.driver);
      }
    } catch (error) {
      console.error('❌ Failed to fetch verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const badges = [
    {
      id: 'confirmed_identity',
      label: 'Confirmed Identity',
      icon: User,
      verified: verification?.confirmed_identity,
      verifiedAt: verification?.confirmed_identity_verified_at,
      points: 10,
      color: '#3b82f6'
    },
    {
      id: 'portrait_picture_check',
      label: 'Portrait Picture Check',
      icon: Eye,
      verified: verification?.portrait_picture_check,
      verifiedAt: verification?.portrait_picture_verified_at,
      points: 5,
      color: '#8b5cf6'
    },
    {
      id: 'driver_license_verified',
      label: 'Driver License',
      icon: FileText,
      verified: verification?.driver_license_verified,
      verifiedAt: verification?.driver_license_verified_at,
      points: 15,
      color: '#10b981'
    },
    {
      id: 'authorized_driver',
      label: 'Authorized Driver',
      icon: Shield,
      verified: verification?.authorized_driver,
      verifiedAt: verification?.authorized_driver_verified_at,
      points: 10,
      color: '#f59e0b'
    },
    {
      id: 'driving_history_check',
      label: 'Driving History Check',
      icon: Clock,
      verified: verification?.driving_history_check,
      verifiedAt: verification?.driving_history_verified_at,
      points: 10,
      color: '#06b6d4'
    },
    {
      id: 'national_police_check',
      label: 'National Police Check',
      icon: Shield,
      verified: verification?.national_police_check,
      verifiedAt: verification?.police_check_verified_at,
      points: 15,
      color: '#ef4444'
    },
    {
      id: 'vehicle_inspected',
      label: 'Vehicle Inspected',
      icon: Car,
      verified: verification?.vehicle_inspected,
      verifiedAt: verification?.vehicle_inspection_verified_at,
      points: 10,
      color: '#6366f1'
    },
    {
      id: 'motor_vehicle_insurance',
      label: 'Motor Vehicle Insurance',
      icon: Shield,
      verified: verification?.motor_vehicle_insurance,
      verifiedAt: verification?.insurance_verified_at,
      points: 10,
      color: '#ec4899'
    },
    {
      id: 'ctp_insurance_check',
      label: 'CTP Insurance',
      icon: Shield,
      verified: verification?.ctp_insurance_check,
      verifiedAt: verification?.ctp_verified_at,
      points: 5,
      color: '#14b8a6'
    },
    {
      id: 'vehicle_registration_verified',
      label: 'Vehicle Registration',
      icon: FileText,
      verified: verification?.vehicle_registration_verified,
      verifiedAt: verification?.registration_verified_at,
      points: 5,
      color: '#f97316'
    },
    {
      id: 'blue_book_verified',
      label: 'Blue Book Verified',
      icon: FileText,
      verified: verification?.blue_book_verified,
      verifiedAt: verification?.blue_book_verified_at,
      points: 5,
      color: '#84cc16'
    }
  ];

  const getLevelColor = (level) => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2'
    };
    return colors[level] || '#6b7280';
  };

  const getLevelGradient = (level) => {
    const gradients = {
      bronze: 'linear-gradient(135deg, #cd7f32, #b8860b)',
      silver: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)',
      gold: 'linear-gradient(135deg, #ffd700, #ffed4e)',
      platinum: 'linear-gradient(135deg, #e5e4e2, #b9f2ff)'
    };
    return gradients[level] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  };

  if (loading) {
    return (
      <div className="verification-loading">
        <div className="spinner"></div>
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="verification-empty">
        <AlertCircle size={64} />
        <h3>No Verification Record</h3>
        <p>Your verification badges will appear here after admin approval.</p>
      </div>
    );
  }

  const verifiedCount = badges.filter(b => b.verified).length;
  const totalCount = badges.length;
  const progressPercent = (verifiedCount / totalCount) * 100;

  return (
    <div className="driver-profile-container">
      {/* Verification Level Card */}
      <div className="verification-level-card" style={{ background: getLevelGradient(verification.verification_level) }}>
        <div className="level-content">
          <div className="level-icon">
            <Award size={48} />
          </div>
          <div className="level-info">
            <h2>{verification.verification_level.toUpperCase()} DRIVER</h2>
            <p>Verification Score: {verification.verification_score}/100</p>
          </div>
        </div>
        
        <div className="level-progress">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${verification.verification_score}%` }}></div>
          </div>
          <div className="progress-text">
            {verifiedCount} of {totalCount} badges earned
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {driver && (
        <div className="performance-stats">
          <div className="stat-card">
            <Star size={24} className="stat-icon" />
            <div className="stat-value">{driver.average_rating || '0.00'}</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-card">
            <TrendingUp size={24} className="stat-icon" />
            <div className="stat-value">{driver.total_trips || 0}</div>
            <div className="stat-label">Total Trips</div>
          </div>
          <div className="stat-card">
            <CheckCircle size={24} className="stat-icon" />
            <div className="stat-value">{driver.acceptance_rate || 0}%</div>
            <div className="stat-label">Acceptance</div>
          </div>
        </div>
      )}

      {/* Verification Badges */}
      <div className="badges-section">
        <h3>
          <Shield size={20} />
          Verification Badges
        </h3>
        
        <div className="badges-grid">
          {badges.map(badge => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id} 
                className={`badge-card ${badge.verified ? 'verified' : 'unverified'}`}
              >
                <div className="badge-icon" style={{ 
                  background: badge.verified ? badge.color : '#e5e7eb',
                  color: badge.verified ? 'white' : '#9ca3af'
                }}>
                  <Icon size={24} />
                </div>
                
                <div className="badge-content">
                  <div className="badge-header">
                    <h4>{badge.label}</h4>
                    {badge.verified && (
                      <CheckCircle size={16} className="badge-check" />
                    )}
                  </div>
                  
                  <div className="badge-details">
                    <span className="badge-points">+{badge.points} points</span>
                    {badge.verified && badge.verifiedAt && (
                      <span className="badge-date">
                        {new Date(badge.verifiedAt).toLocaleDateString()}
                      </span>
                    )}
                    {!badge.verified && (
                      <span className="badge-pending">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Status */}
      {verification.all_verifications_complete ? (
        <div className="completion-banner success">
          <CheckCircle size={32} />
          <div>
            <h3>🎉 Fully Verified Driver!</h3>
            <p>You've earned all verification badges. Excellent work!</p>
          </div>
        </div>
      ) : (
        <div className="completion-banner info">
          <AlertCircle size={32} />
          <div>
            <h3>Complete Your Verification</h3>
            <p>
              Earn all {totalCount} badges to unlock full verification benefits. 
              {verifiedCount === 0 ? ' Contact admin to start verification.' : ` You're ${totalCount - verifiedCount} badges away!`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;