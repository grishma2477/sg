import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getDriverApplications, reviewApplication } from '../../api/admin.api';
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function AppModal({ app, onClose, onReviewed }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (approved) => {
    setLoading(true);
    try {
      await reviewApplication(app.id, { approved, remarks });
      toast.success(approved ? 'Application approved!' : 'Application rejected');
      onReviewed();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['Applicant', `User #${app.user_id}`],
    ['Vehicle Type', app.vehicle_type],
    ['License Plate', app.license_plate],
    ['Model', `${app.vehicle_make ?? ''} ${app.vehicle_model ?? ''}`],
    ['License No.', app.license_number],
    ['Status', app.status],
    ['Applied', app.created_at ? new Date(app.created_at).toLocaleDateString() : '–'],
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-base">Driver Application #{app.id}</h3>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {fields.map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-gray-800">{val ?? '–'}</p>
              </div>
            ))}
          </div>

          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Remarks (required for rejection)"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-indigo-500"
          />

          {app.status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={() => handle(true)} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm">
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={() => handle(false)} disabled={loading || !remarks.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40">
                <XCircle size={16} /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDriverApps() {
  const [filter, setFilter]     = useState('');
  const [apps, setApps]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDriverApplications(filter);
      setApps(res?.data?.applications ?? res?.data ?? []);
    } catch { toast.error('Failed to load applications'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Driver Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve driver onboarding</p>
        </div>
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[['', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
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
              {['ID', 'User', 'Vehicle', 'Plate', 'Status', 'Applied', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No applications</td></tr>
            ) : apps.map(a => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">#{a.id}</td>
                <td className="px-4 py-3">#{a.user_id}</td>
                <td className="px-4 py-3 capitalize">{a.vehicle_type}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.license_plate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '–'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(a)} className="flex items-center gap-1 text-indigo-600 text-xs font-medium hover:underline">
                    <Eye size={12} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <AppModal app={selected} onClose={() => setSelected(null)} onReviewed={load} />}
    </div>
  );
}
