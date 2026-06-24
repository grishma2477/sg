import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getKycList, verifyKyc } from '../../api/admin.api';
import { CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function KycModal({ kyc, onClose, onVerified }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (approved) => {
    setLoading(true);
    try {
      await verifyKyc(kyc.user_id, { approved, remarks });
      toast.success(approved ? 'KYC approved!' : 'KYC rejected');
      onVerified();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-base">KYC Review — User #{kyc.user_id}</h3>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Name', `${kyc.first_name ?? ''} ${kyc.last_name ?? ''}`],
              ['NIN', kyc.national_identity_number],
              ['DOB', kyc.date_of_birth],
              ['Phone', kyc.phone_number],
              ['Address', kyc.address],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-gray-800">{val ?? '–'}</p>
              </div>
            ))}
          </div>

          {/* Documents */}
          {kyc.profile_url && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">Profile Photo</p>
              <img src={kyc.profile_url} alt="profile" className="h-28 object-cover rounded-xl border border-gray-200" />
            </div>
          )}
          {kyc.document_url && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">ID Document</p>
              <img src={kyc.document_url} alt="document" className="h-28 object-cover rounded-xl border border-gray-200" />
            </div>
          )}

          {/* Remarks */}
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="Remarks (required for rejection)"
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-indigo-500"
          />

          <div className="flex gap-3">
            <button
              onClick={() => handle(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm"
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              onClick={() => handle(false)}
              disabled={loading || !remarks.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminKYC() {
  const [filter, setFilter]     = useState('pending');
  const [kycs, setKycs]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getKycList(filter);
      setKycs(res?.data?.kycs ?? res?.data ?? []);
    } catch {
      toast.error('Failed to load KYC list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">KYC Review</h1>
          <p className="text-gray-500 text-sm mt-1">Review identity documents</p>
        </div>
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['User ID', 'Name', 'Phone', 'NIN', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kycs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No KYC records</td></tr>
            ) : kycs.map(k => (
              <tr key={k.user_id ?? k.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">#{k.user_id}</td>
                <td className="px-4 py-3 font-medium">{k.first_name} {k.last_name}</td>
                <td className="px-4 py-3 text-gray-500">{k.phone_number}</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">{k.national_identity_number}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[k.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {k.status ?? 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(k)}
                    className="flex items-center gap-1 text-indigo-600 text-xs font-medium hover:underline"
                  >
                    <Eye size={12} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <KycModal kyc={selected} onClose={() => setSelected(null)} onVerified={load} />}
    </div>
  );
}
