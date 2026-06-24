import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/admin.api';
import { Users, Car, MapPin, CreditCard, TrendingUp, Activity } from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900">{value ?? '–'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r?.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard title="Total Riders"   value={stats?.total_riders}  icon={Users}   color="bg-blue-500" />
        <StatCard title="Total Drivers"  value={stats?.total_drivers} icon={Car}     color="bg-green-500" />
        <StatCard title="Active Rides"   value={stats?.active_rides}  icon={MapPin}  color="bg-orange-500" />
        <StatCard title="Pending KYC"    value={stats?.pending_kyc}   icon={CreditCard} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard title="Today's Rides"    value={stats?.today_rides}    icon={Activity}  color="bg-indigo-500" sub="completed today" />
        <StatCard title="Today's Revenue"  value={stats?.today_revenue ? `NPR ${stats.today_revenue}` : '–'} icon={TrendingUp} color="bg-emerald-500" sub="gross fare" />
        <StatCard title="Pending Payouts"  value={stats?.pending_payouts}  icon={CreditCard} color="bg-red-500" sub="awaiting approval" />
      </div>

      {stats === null && (
        <div className="mt-6 text-center text-gray-400 text-sm">
          No stats available (GET /api/admin/stats not implemented yet)
        </div>
      )}
    </div>
  );
}
