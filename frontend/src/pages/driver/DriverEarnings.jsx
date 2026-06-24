import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getEarningsSummary, getEarningsHistory, requestPayout } from '../../api/wallet.api';
import { TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'Week' },
  { key: 'month', label: 'Month' },
];

function EarningsCard({ ride, expanded, onToggle }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <TrendingUp size={14} className="text-green-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">{ride.dropoff_address ?? 'Completed ride'}</p>
          <p className="text-xs text-gray-400">{new Date(ride.completed_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-green-600">NPR {ride.net_earned ?? ride.fare_amount}</p>
          {expanded ? <ChevronUp size={14} className="text-gray-400 ml-auto" /> : <ChevronDown size={14} className="text-gray-400 ml-auto" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 text-xs text-gray-500 border-t border-gray-50 pt-2">
          <p>From: {ride.pickup_address}</p>
          <p className="mt-0.5">Gross: NPR {ride.fare_amount} — Platform: NPR {ride.platform_fee ?? 0} = Net NPR {ride.net_earned}</p>
        </div>
      )}
    </div>
  );
}

export default function DriverEarnings() {
  const [period, setPeriod]       = useState('today');
  const [summary, setSummary]     = useState(null);
  const [history, setHistory]     = useState([]);
  const [expanded, setExpanded]   = useState(null);
  const [showPayout, setShowPayout] = useState(false);
  const [payoutAmt, setPayoutAmt] = useState('');
  const [loadingPayout, setLoading] = useState(false);

  useEffect(() => {
    getEarningsSummary(period).then(r => setSummary(r?.data)).catch(() => {});
  }, [period]);

  useEffect(() => {
    getEarningsHistory().then(r => setHistory(r?.data?.rides ?? [])).catch(() => {});
  }, []);

  const handlePayout = async () => {
    if (!payoutAmt || Number(payoutAmt) < 100) return toast.error('Minimum payout NPR 100');
    setLoading(true);
    try {
      await requestPayout({ amount: Number(payoutAmt), bank_name: 'Manual', account_number: '000' });
      toast.success('Payout requested!');
      setShowPayout(false);
      setPayoutAmt('');
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 px-5 pt-6 pb-8">
        <h2 className="text-white text-lg font-bold mb-4">Earnings</h2>
        <div className="flex gap-1 bg-indigo-700/50 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                period === p.key ? 'bg-white text-indigo-600' : 'text-indigo-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 -mt-4 flex flex-col gap-4">
        {/* Summary cards */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-500">Net Earned</p>
              <p className="text-xl font-black text-green-600">NPR {summary.net_earned ?? 0}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-gray-500">Rides</p>
              <p className="text-xl font-black text-blue-600">{summary.completed_rides ?? 0}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Gross</p>
              <p className="text-base font-bold text-gray-700">NPR {summary.gross_earned ?? 0}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-gray-500">Platform Fee</p>
              <p className="text-base font-bold text-red-500">NPR {summary.total_deductions ?? 0}</p>
            </div>
          </div>
        )}

        {/* Payout button */}
        <button
          onClick={() => setShowPayout(s => !s)}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-sm"
        >
          Request Payout ↑
        </button>

        {showPayout && (
          <div className="bg-white rounded-xl p-4 flex flex-col gap-3 border border-green-100">
            <p className="text-sm font-semibold text-gray-700">Payout Amount</p>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 gap-2">
              <span className="text-gray-500 text-sm">NPR</span>
              <input
                type="number"
                value={payoutAmt}
                onChange={e => setPayoutAmt(e.target.value)}
                placeholder="500"
                className="flex-1 outline-none text-sm font-bold"
              />
            </div>
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000].map(a => (
                <button key={a} onClick={() => setPayoutAmt(String(a))}
                  className="flex-1 border border-gray-200 rounded-lg py-1 text-xs font-medium">
                  {a}
                </button>
              ))}
            </div>
            <button
              onClick={handlePayout}
              disabled={loadingPayout}
              className="bg-green-500 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {loadingPayout ? 'Requesting…' : 'Submit Request'}
            </button>
          </div>
        )}

        {/* Ride history */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">RIDE HISTORY</p>
          {history.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">No rides yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((ride, i) => (
                <EarningsCard
                  key={ride.id ?? i}
                  ride={ride}
                  expanded={expanded === i}
                  onToggle={() => setExpanded(expanded === i ? null : i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
