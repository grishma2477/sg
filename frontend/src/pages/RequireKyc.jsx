import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { getToken } from '../utils/CookieUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * KYC Guard - Blocks access until KYC is verified
 * Wrap any component that requires KYC verification
 */
const RequireKYC = ({ children }) => {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkKYCStatus();
  }, []);

  const checkKYCStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/kyc/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setKycStatus(data.data);
        
        // If KYC doesn't exist or not verified, block access
        if (!data.data.kycExists || !data.data.isVerified) {
          // Don't allow access
          setLoading(false);
          return;
        }
        
        // KYC verified - allow access
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setLoading(false);
    }
  };

  // Show loading spinner while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <Loader2 className="w-16 h-16 animate-spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  // KYC not submitted - Force to upload
  if (!kycStatus?.kycExists) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f172a' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <Shield size={48} className="text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            KYC Verification Required
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            You must complete your KYC (Know Your Customer) verification to access the rider dashboard and book rides.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <div className="font-semibold text-red-900 mb-1">Access Restricted</div>
                <div className="text-sm text-red-700">
                  Complete your identity verification to unlock all features.
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/kyc-upload')}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg mb-3 transition-all"
          >
            Complete KYC Verification
          </button>
          
          <button
            onClick={() => navigate('/rider/profile')}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  // KYC submitted but not verified - Show pending message
  if (!kycStatus?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f172a' }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <Loader2 size={48} className="text-yellow-600 animate-spin" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            KYC Under Review
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your KYC documents are currently being verified by our team. This process usually takes 24-72 hours.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <div className="font-semibold text-yellow-900 mb-1">Verification Pending</div>
                <div className="text-sm text-yellow-700">
                  You'll receive a notification once your KYC is approved.
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/rider/profile')}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
          >
            Go to Profile
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Check back later or contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // KYC verified - Allow access
  return <>{children}</>;
};

export default RequireKYC;