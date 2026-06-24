import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, Navigation, Wallet, Bell, User } from 'lucide-react';
import { getUnreadCount } from '../api/notifications.api';
import { useState, useEffect } from 'react';

function StatusBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-black text-white text-xs font-medium select-none">
      <span>{time}</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5 items-end">
          {[2, 3, 4, 5].map(h => (
            <div key={h} className="w-1 bg-white rounded-sm" style={{ height: `${h * 2}px` }} />
          ))}
        </div>
        <svg className="w-3 h-3 ml-1" viewBox="0 0 24 24" fill="white">
          <path d="M1.5 8.5A13 13 0 0 1 12 4a13 13 0 0 1 10.5 4.5L12 20.5z" />
        </svg>
        <div className="flex items-center border border-white rounded-sm ml-1" style={{ width: 18, height: 9 }}>
          <div className="bg-white rounded-sm m-0.5" style={{ width: 12, height: 5 }} />
          <div className="w-0.5 h-2 bg-white rounded-r-sm -ml-px" />
        </div>
      </div>
    </div>
  );
}

function BottomNav({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount()
      .then(r => setUnread(r?.data?.count ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  const riderTabs = [
    { label: 'Home',    icon: Home,       path: '/rider' },
    { label: 'Rides',   icon: Navigation, path: '/rider/history' },
    { label: 'Wallet',  icon: Wallet,     path: '/rider/wallet' },
    { label: 'Alerts',  icon: Bell,       path: '/rider/notifications', badge: unread },
    { label: 'Profile', icon: User,       path: '/rider/profile' },
  ];

  const driverTabs = [
    { label: 'Home',     icon: Home,       path: '/driver' },
    { label: 'Rides',    icon: Navigation, path: '/driver/history' },
    { label: 'Earnings', icon: Wallet,     path: '/driver/earnings' },
    { label: 'Alerts',   icon: Bell,       path: '/driver/notifications', badge: unread },
    { label: 'Profile',  icon: User,       path: '/driver/profile' },
  ];

  const tabs = role === 'driver' ? driverTabs : riderTabs;

  return (
    <div className="flex border-t border-gray-200 bg-white">
      {tabs.map(({ label, icon: Icon, path, badge }) => {
        const active = location.pathname === path || location.pathname.startsWith(path + '/');
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
              active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function PhoneFrame({ children, hideNav = false }) {
  const { role } = useAuthStore();
  const showNav  = !hideNav && role;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4">
      <div
        className="relative bg-white overflow-hidden flex flex-col"
        style={{
          width: '390px',
          height: '844px',
          borderRadius: '44px',
          boxShadow: '0 0 0 10px #1a1a1a, 0 30px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-50" />

        {/* Status bar */}
        <StatusBar />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingTop: '12px' }}>
          {children}
        </div>

        {/* Bottom nav */}
        {showNav && <BottomNav role={role} />}

        {/* Home indicator */}
        <div className="flex justify-center pb-1 pt-0.5 bg-white">
          <div className="w-24 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
