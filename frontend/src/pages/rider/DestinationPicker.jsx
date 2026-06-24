import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useRideStore } from '../../store/rideStore';
import { estimateRide } from '../../api/rides.api';
import { ArrowLeft, MapPin, Plus, X, ChevronRight } from 'lucide-react';

function LocationInput({ label, value, onChange, placeholder, color = 'gray' }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color === 'indigo' ? 'bg-indigo-500' : color === 'red' ? 'bg-red-500' : 'bg-gray-400'}`} />
      <div className="flex-1">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm text-gray-800 outline-none font-medium placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}

export default function DestinationPicker() {
  const navigate = useNavigate();
  const { pickup, dropoff, stops, setPickup, setDropoff, setStops, setEstimate } = useRideStore();

  const [pickupAddr, setPickupAddr]   = useState(pickup?.address ?? '');
  const [dropoffAddr, setDropoffAddr] = useState(dropoff?.address ?? '');
  const [stopAddrs, setStopAddrs]     = useState(stops.map(s => s.address));
  const [loading, setLoading]         = useState(false);

  const addStop = () => {
    if (stopAddrs.length >= 4) return toast.error('Max 5 stops');
    setStopAddrs(s => [...s, '']);
  };

  const removeStop = (i) => setStopAddrs(s => s.filter((_, idx) => idx !== i));

  const handleSeePrices = async () => {
    if (!pickupAddr.trim() || !dropoffAddr.trim()) return toast.error('Add pickup and dropoff');

    // Use placeholder coords — in real app, geocode the addresses
    const pu = { address: pickupAddr, lat: 27.7172, lng: 85.3240 };
    const dr = { address: dropoffAddr, lat: 27.6727, lng: 85.3222 };
    const st = stopAddrs.filter(Boolean).map((a, i) => ({ address: a, lat: 27.71 + i * 0.01, lng: 85.32 + i * 0.01 }));

    setPickup(pu);
    setDropoff(dr);
    setStops(st);

    setLoading(true);
    try {
      const res = await estimateRide({
        pickup_lat: pu.lat, pickup_lng: pu.lng,
        dropoff_lat: dr.lat, dropoff_lng: dr.lng,
        stops: st,
      });
      setEstimate(res?.data ?? null);
      navigate('/rider/vehicles');
    } catch {
      // Even if estimate fails, go to vehicle selection
      setEstimate(null);
      navigate('/rider/vehicles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-base">Plan your ride</h2>
      </div>

      {/* Location inputs */}
      <div className="px-4 py-2">
        <LocationInput
          label="Pickup"
          value={pickupAddr}
          onChange={setPickupAddr}
          placeholder="Current location"
          color="indigo"
        />

        {stopAddrs.map((addr, i) => (
          <div key={i} className="flex items-center">
            <div className="flex-1">
              <LocationInput
                label={`Stop ${i + 1}`}
                value={addr}
                onChange={val => setStopAddrs(s => s.map((a, idx) => idx === i ? val : a))}
                placeholder="Add a stop"
                color="gray"
              />
            </div>
            <button onClick={() => removeStop(i)} className="p-2 text-gray-400">
              <X size={14} />
            </button>
          </div>
        ))}

        <LocationInput
          label="Dropoff"
          value={dropoffAddr}
          onChange={setDropoffAddr}
          placeholder="Where to?"
          color="red"
        />

        {stopAddrs.length < 4 && (
          <button onClick={addStop} className="flex items-center gap-2 mt-2 text-indigo-600 text-xs font-medium">
            <Plus size={14} /> Add stop
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="px-4 mt-4">
        <p className="text-xs text-gray-400 font-medium mb-2">SUGGESTIONS</p>
        {[
          { name: 'Thamel', sub: 'Popular tourist area', lat: 27.7151, lng: 85.3127 },
          { name: 'New Road', sub: 'City centre', lat: 27.7057, lng: 85.3143 },
          { name: 'Patan', sub: 'Lalitpur', lat: 27.6727, lng: 85.3222 },
        ].map(s => (
          <button
            key={s.name}
            onClick={() => setDropoffAddr(s.name)}
            className="w-full flex items-center gap-3 py-3 border-b border-gray-50"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-gray-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">{s.name}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        ))}
      </div>

      {/* See prices button */}
      <div className="mt-auto px-4 py-4">
        <button
          onClick={handleSeePrices}
          disabled={loading || !pickupAddr.trim() || !dropoffAddr.trim()}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading ? 'Getting prices…' : 'See prices →'}
        </button>
      </div>
    </div>
  );
}
