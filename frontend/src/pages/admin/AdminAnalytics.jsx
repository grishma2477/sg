import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/apiClient';

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: '7 Days' },
  { value: 'month', label: '30 Days' },
];

function Stat({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green:  'bg-green-50 text-green-700',
    amber:  'bg-amber-50 text-amber-700',
    red:    'bg-red-50 text-red-700',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${colors[color].split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBarChart({ data, keyX, keyY, color = '#6366f1' }) {
  if (!data?.length) return <p className="text-xs text-gray-400 text-center py-4">No data</p>;
  const max = Math.max(...data.map(d => Number(d[keyY])));
  return (
    <div className="flex items-end gap-1 h-20 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-t"
            style={{ height: `${max > 0 ? (Number(d[keyY]) / max) * 64 : 4}px`, backgroundColor: color }}
          />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d[keyX]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [period,    setPeriod]    = useState('today');
  const [overview,  setOverview]  = useState(null);
  const [rides,     setRides]     = useState(null);
  const [finance,   setFinance]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  async function fetchAll() {
    setLoading(true);
    try {
      const params = dateRange.from
        ? `?from=${dateRange.from}&to=${dateRange.to}`
        : `?period=${period}`;

      const [ov, ri, fi] = await Promise.all([
        apiRequest(`/api/admin/analytics/overview?period=${period}`),
        apiRequest(`/api/admin/analytics/rides${params}`),
        apiRequest(`/api/admin/analytics/finance${params}`),
      ]);
      setOverview(ov?.data);
      setRides(ri?.data);
      setFinance(fi?.data);
    } catch { /* show stale data */ }
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, [period, dateRange.from, dateRange.to]);

  const fmt   = (n) => n == null ? '–' : Number(n).toLocaleString();
  const fmtNPR = (n) => n == null ? '–' : `NPR ${Number(n).toLocaleString()}`;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400">Platform performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => { setPeriod(p.value); setDateRange({ from: '', to: '' }); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value && !dateRange.from
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600"
          />
          <span className="text-gray-400 text-sm">→</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600"
          />
        </div>
      </div>

      {loading && <div className="text-center text-gray-400 py-12">Loading…</div>}

      {!loading && <>
        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="Active Rides"     value={fmt(overview?.active_rides)}     color="green" />
          <Stat label="Completed"        value={fmt(overview?.completed_rides)}  color="indigo" sub={`of ${fmt(overview?.total_rides)} total`} />
          <Stat label="Total Revenue"    value={fmtNPR(overview?.total_revenue)} color="green" />
          <Stat label="Platform Fees"    value={fmtNPR(overview?.platform_fees)} color="amber" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="New Riders"       value={fmt(overview?.new_riders)}       color="indigo" />
          <Stat label="New Drivers"      value={fmt(overview?.new_drivers)}      color="indigo" />
          <Stat label="Cancelled Rides"  value={fmt(overview?.cancelled_rides)}  color="red" />
          <Stat label="Cancellation Rate" value={`${rides?.cancellation_rate ?? '–'}%`} color="red" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Peak hours */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">Ride Volume by Hour</h3>
            <p className="text-xs text-gray-400 mb-2">Completed rides per hour of day</p>
            <MiniBarChart data={rides?.peak_hours} keyX="hour" keyY="count" />
          </div>

          {/* By vehicle */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">Rides by Vehicle</h3>
            <div className="flex flex-col gap-2 mt-3">
              {rides?.by_vehicle?.map(v => (
                <div key={v.vehicle_type} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 w-12 capitalize">{v.vehicle_type}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.round((v.count / (rides?.by_vehicle?.reduce((a,b)=>a+Number(b.count),0)||1))*100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{fmt(v.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Finance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Financial Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Gross Bookings',       val: finance?.gross_bookings },
              { label: 'Platform Fees',         val: finance?.platform_fees_collected },
              { label: 'Driver Payouts',        val: finance?.payout_volume },
              { label: 'Wallet Top-ups',        val: finance?.wallet_top_ups },
              { label: 'Refunds Issued',        val: finance?.refunds_issued },
              { label: 'Net Revenue',           val: finance?.net_revenue },
            ].map(({ label, val }) => (
              <div key={label} className="border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-bold text-gray-900">{fmtNPR(val)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-1">Average Metrics</h3>
          <div className="flex gap-8 mt-2">
            <div><p className="text-xs text-gray-400">Avg Fare</p><p className="font-bold text-gray-900">{fmtNPR(rides?.average_fare)}</p></div>
            <div><p className="text-xs text-gray-400">Avg Rating</p><p className="font-bold text-gray-900">{rides?.average_rating ?? '–'} ⭐</p></div>
          </div>
        </div>
      </>}
    </div>
  );
}
