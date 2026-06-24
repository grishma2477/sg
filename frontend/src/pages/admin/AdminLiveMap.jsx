import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getActiveRides, forceCompleteRide } from '../../api/admin.api';
import MapView from '../../components/MapView';
import { useSocket } from '../../hooks/useSocket';
import { RefreshCw, X } from 'lucide-react';

export default function AdminLiveMap() {
  const [rides, setRides]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getActiveRides();
      setRides(res?.data?.rides ?? res?.data ?? []);
    } catch { toast.error('Failed to load rides'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Live updates via socket
  useSocket({
    'admin:ride_update': (data) => {
      setRides(prev => {
        const idx = prev.findIndex(r => r.id === data.rideId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...data };
        return updated;
      });
    },
  });

  const markers = rides.flatMap(r => {
    const pts = [];
    if (r.driver_lat && r.driver_lng)
      pts.push({ lat: parseFloat(r.driver_lat), lng: parseFloat(r.driver_lng), label: { text: '🏍', fontSize: '16px' } });
    if (r.pickup_lat && r.pickup_lng)
      pts.push({ lat: parseFloat(r.pickup_lat), lng: parseFloat(r.pickup_lng) });
    return pts;
  });

  const handleForceComplete = async (rideId) => {
    setCompleting(true);
    try {
      await forceCompleteRide(rideId);
      toast.success('Ride force-completed');
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          center={{ lat: 27.7172, lng: 85.3240 }}
          zoom={13}
          markers={markers}
          height="100%"
        />

        {/* Refresh */}
        <button
          onClick={load}
          className="absolute top-4 right-4 bg-white shadow-md rounded-xl p-2.5 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Ride count */}
        <div className="absolute top-4 left-4 bg-white shadow-md rounded-xl px-3 py-2">
          <p className="text-xs text-gray-500">Active Rides</p>
          <p className="text-xl font-black text-indigo-600">{rides.length}</p>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-72 bg-white border-l border-gray-100 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-bold text-base">Live Rides</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rides.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No active rides</p>
          ) : rides.map(ride => (
            <button
              key={ride.id}
              onClick={() => setSelected(selected?.id === ride.id ? null : ride)}
              className={`w-full px-4 py-3 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors ${
                selected?.id === ride.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">Ride #{ride.id}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  ride.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{ride.status}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{ride.pickup_address}</p>
              <p className="text-xs text-gray-400 truncate">→ {ride.dropoff_address}</p>
            </button>
          ))}
        </div>

        {/* Selected ride detail */}
        {selected && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Ride #{selected.id}</h3>
              <button onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div className="text-xs text-gray-600 flex flex-col gap-1 mb-3">
              <p><span className="font-medium">Rider:</span> #{selected.rider_id}</p>
              <p><span className="font-medium">Driver:</span> #{selected.driver_id}</p>
              <p><span className="font-medium">Fare:</span> NPR {selected.fare_amount ?? '–'}</p>
            </div>
            <button
              onClick={() => handleForceComplete(selected.id)}
              disabled={completing}
              className="w-full bg-red-500 text-white py-2 rounded-xl text-xs font-semibold"
            >
              {completing ? '…' : 'Force Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
