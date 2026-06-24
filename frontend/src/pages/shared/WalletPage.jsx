import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWallet, getTransactions, topUpWallet } from '../../api/wallet.api';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronRight } from 'lucide-react';

const FILTERS = ['All', 'Top-up', 'Ride', 'Payout', 'Transfer'];
const PAYMENT_METHODS = ['esewa', 'khalti', 'bank_transfer'];

function TxRow({ tx }) {
  const isCredit = parseFloat(tx.amount) > 0;
  const typeIcons = { ride: '🛵', top_up: '⬆️', payout: '⬇️', transfer: '↔️', credit: '➕', debit: '➖' };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${isCredit ? 'bg-green-100' : 'bg-gray-100'}`}>
        {typeIcons[tx.type] ?? (isCredit ? '➕' : '➖')}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{tx.description ?? tx.type}</p>
        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
      </div>
      <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-gray-700'}`}>
        {isCredit ? '+' : ''}NPR {Math.abs(parseFloat(tx.amount)).toFixed(0)}
      </p>
    </div>
  );
}

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet]         = useState(null);
  const [txs, setTxs]               = useState([]);
  const [filter, setFilter]         = useState('All');
  const [showTopUp, setShowTopUp]   = useState(false);
  const [amount, setAmount]         = useState('');
  const [method, setMethod]         = useState('esewa');
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const [w, t] = await Promise.all([getWallet(), getTransactions()]);
      setWallet(w?.data);
      setTxs(t?.data?.transactions ?? t?.data ?? []);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const handleTopUp = async () => {
    if (!amount || Number(amount) < 10) return toast.error('Minimum top-up NPR 10');
    setLoading(true);
    try {
      await topUpWallet({
        amount: Number(amount),
        paymentMethod: method,
        paymentGateway: method,
        gatewayTransactionId: `MANUAL-${Date.now()}`,
      });
      toast.success(`NPR ${amount} added to wallet!`);
      setShowTopUp(false);
      setAmount('');
      await load();
    } catch (err) {
      toast.error(err.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  const balance = wallet ? parseFloat(wallet.balance).toFixed(0) : '–';
  const filteredTxs = filter === 'All' ? txs : txs.filter(t => t.type?.includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Balance header */}
      <div className="bg-indigo-600 px-5 pt-6 pb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-bold text-lg">My Wallet</h2>
          <button onClick={load} className={`text-indigo-200 ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={16} />
          </button>
        </div>
        <p className="text-indigo-200 text-xs mb-1">Available balance</p>
        <p className="text-white text-4xl font-black">NPR {balance}</p>

        {/* Quick actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setShowTopUp(true)}
            className="flex-1 flex flex-col items-center gap-1 bg-white/20 rounded-xl py-3 text-white text-xs font-medium"
          >
            <ArrowUpRight size={18} />
            Top Up
          </button>
          <button
            onClick={() => navigate('/rider/history')}
            className="flex-1 flex flex-col items-center gap-1 bg-white/20 rounded-xl py-3 text-white text-xs font-medium"
          >
            <ArrowDownLeft size={18} />
            History
          </button>
        </div>
      </div>

      {/* Top-up modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Top Up Wallet</h3>
              <button onClick={() => setShowTopUp(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {/* Preset amounts */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Select amount</p>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      amount === String(a) ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Payment method */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Payment method</p>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border capitalize transition-colors ${
                      method === m ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTopUp}
              disabled={loading || !amount}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40"
            >
              {loading ? 'Processing…' : `Pay NPR ${amount || 0}`}
            </button>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="flex-1 overflow-y-auto px-4 py-4 -mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* Filter tabs */}
          <div className="flex gap-1 overflow-x-auto mb-3">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-colors ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredTxs.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No transactions</p>
          ) : (
            filteredTxs.slice(0, 30).map((tx, i) => <TxRow key={tx.id ?? i} tx={tx} />)
          )}
        </div>
      </div>
    </div>
  );
}
