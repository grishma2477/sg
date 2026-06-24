import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { disconnectSocket } from '../../hooks/useSocket';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../api/apiClient';
import { User, LogOut, Shield, Star, ChevronRight, HelpCircle } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { name, role, userId, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch {}
    disconnectSocket();
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out');
  };

  const menuItems = role === 'driver'
    ? [
        { label: 'KYC Documents', path: '/kyc-upload', icon: '🪪' },
        { label: 'Safety Score', path: '/driver/safety', icon: '🛡️' },
        { label: 'Payment Methods', path: '/payment-methods', icon: '💳' },
        { label: 'Driver Application', path: '/apply-driver', icon: '🚗' },
      ]
    : [
        { label: 'KYC Documents', path: '/kyc-upload', icon: '🪪' },
        { label: 'Payment Methods', path: '/payment-methods', icon: '💳' },
      ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Profile header */}
      <div className="bg-indigo-600 px-5 pt-6 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">{name ?? 'User'}</h2>
            <p className="text-indigo-200 text-xs capitalize">{role ?? 'rider'} account</p>
            <p className="text-indigo-300 text-xs">ID: {userId}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 -mt-4">
        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl w-8">{item.icon}</span>
              <span className="flex-1 text-sm font-medium text-gray-700 text-left">{item.label}</span>
              <ChevronRight size={14} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50">
            <HelpCircle size={18} className="text-gray-400" />
            <span className="flex-1 text-sm font-medium text-gray-700 text-left">Help & Support</span>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-500 py-3.5 rounded-2xl font-semibold text-sm"
        >
          <LogOut size={16} />
          Log out
        </button>

        <p className="text-center text-xs text-gray-300 mt-4">SG v1.0.0</p>
      </div>
    </div>
  );
}
