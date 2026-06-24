import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { disconnectSocket } from '../../hooks/useSocket';
import { apiRequest } from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Users, FileCheck, Map, CreditCard,
  Shield, LogOut, Car, ChevronRight, BarChart2, Zap, Activity,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/admin',              label: 'Dashboard',          icon: LayoutDashboard, exact: true },
  { to: '/admin/analytics',    label: 'Analytics',          icon: BarChart2 },
  { to: '/admin/surge',        label: 'Surge Pricing',      icon: Zap },
  { to: '/admin/performance',  label: 'Performance',        icon: Activity },
  { to: '/admin/kyc',        label: 'KYC Review',         icon: FileCheck },
  { to: '/admin/drivers',    label: 'Driver Applications', icon: Car },
  { to: '/admin/map',        label: 'Live Rides',         icon: Map },
  { to: '/admin/payouts',    label: 'Payouts',            icon: CreditCard },
  { to: '/admin/users',      label: 'Users',              icon: Users },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch {}
    disconnectSocket();
    logout();
    navigate('/admin/login', { replace: true });
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex flex-col min-h-screen fixed">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">SG</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Sawa Gaadi</p>
            <p className="text-gray-400 text-xs">Admin</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
