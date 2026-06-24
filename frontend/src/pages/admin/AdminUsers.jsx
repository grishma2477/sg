import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getUsers, lockWallet, unlockWallet } from '../../api/admin.api';
import { Search, Lock, Unlock, RefreshCw, Eye } from 'lucide-react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);

  const load = async (q = search, p = page) => {
    setLoading(true);
    try {
      const res = await getUsers(q, p);
      setUsers(res?.data?.users ?? res?.data ?? []);
      setTotal(res?.data?.pagination?.total ?? 0);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { load('', 1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(search, 1);
  };

  const handleLock = async (userId, isLocked) => {
    try {
      if (isLocked) {
        await unlockWallet(userId);
        toast.success('Wallet unlocked');
      } else {
        await lockWallet(userId);
        toast.success('Wallet locked');
      }
      await load();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total users</p>
        </div>
        <button onClick={() => load()} className="p-2 text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by phone or name…"
            className="flex-1 outline-none text-sm"
          />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ID', 'Role', 'Phone', 'KYC', 'Balance', 'Wallet', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    u.role === 'driver' ? 'bg-blue-100 text-blue-700' : u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{u.phone ?? '–'}</td>
                <td className="px-4 py-3">
                  {u.is_kyc_verified
                    ? <span className="text-green-600 text-xs font-medium">✓ Verified</span>
                    : <span className="text-yellow-600 text-xs font-medium">Pending</span>}
                </td>
                <td className="px-4 py-3 font-medium">NPR {u.wallet_balance ?? '0'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.wallet_locked ? 'text-red-600' : 'text-green-600'}`}>
                    {u.wallet_locked ? '🔒 Locked' : '🔓 Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleLock(u.id, u.wallet_locked)}
                      title={u.wallet_locked ? 'Unlock wallet' : 'Lock wallet'}
                      className={`p-1.5 rounded-lg ${u.wallet_locked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      {u.wallet_locked ? <Unlock size={14} /> : <Lock size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => { setPage(p => p - 1); load(search, page - 1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40">←</button>
              <button disabled={page * 20 >= total} onClick={() => { setPage(p => p + 1); load(search, page + 1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
