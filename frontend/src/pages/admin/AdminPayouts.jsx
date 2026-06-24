import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPayoutRequests, approvePayout, rejectPayout } from '../../api/admin.api';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AdminPayouts() {
  const [filter, setFilter]   = useState('pending');
  const [payouts, setPayouts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPayoutRequests(filter);
      setPayouts(res?.data?.payouts ?? res?.data ?? []);
    } catch { toast.error('Failed to load payouts'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const handleApprove = async (id) => {
    try {
      await approvePayout(id, { remarks: remarks[id] ?? 'Approved' });
      toast.success('Payout approved');
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
      await load();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    if (!remarks[id]?.trim()) return toast.error('Enter rejection reason');
    try {
      await rejectPayout(id, { remarks: remarks[id] });
      toast.success('Payout rejected');
      await load();
    } catch (err) { toast.error(err.message || 'Failed'); }
  };

  const handleBatchApprove = async () => {
    if (selected.size === 0) return;
    for (const id of selected) await handleApprove(id).catch(() => {});
    setSelected(new Set());
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Payout Management</h1>
          <p className="text-gray-500 text-sm mt-1">Approve driver withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleBatchApprove}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              <CheckCircle size={14} /> Approve {selected.size} selected
            </button>
          )}
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[['pending','Pending'],['approved','Approved'],['rejected','Rejected']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {filter === 'pending' && <th className="px-4 py-3 w-10"></th>}
              {['ID', 'Driver', 'Amount', 'Method', 'Requested', 'Remarks', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">No payouts</td></tr>
            ) : payouts.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                {filter === 'pending' && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                      className="w-4 h-4 accent-indigo-600" />
                  </td>
                )}
                <td className="px-4 py-3 text-gray-500">#{p.id}</td>
                <td className="px-4 py-3">#{p.driver_id}</td>
                <td className="px-4 py-3 font-bold text-gray-900">NPR {p.amount}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{p.method ?? 'bank'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '–'}</td>
                <td className="px-4 py-3">
                  {filter === 'pending' && (
                    <input
                      type="text"
                      placeholder="Remarks…"
                      value={remarks[p.id] ?? ''}
                      onChange={e => setRemarks(r => ({ ...r, [p.id]: e.target.value }))}
                      className="text-xs border border-gray-200 rounded px-2 py-1 outline-none w-28"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {filter === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleApprove(p.id)} title="Approve"
                        className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleReject(p.id)} title="Reject"
                        className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
