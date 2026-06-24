import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useRideStore } from '../../store/rideStore';
import { createRideRequest } from '../../api/rides.api';
import { apiRequest as createIdempotencyKeyRaw, createIdempotencyKey } from '../../api/apiClient';
import { ArrowLeft, Clock, ChevronRight, Zap } from 'lucide-react';

const VEHICLES = [
  {
    type: 'bike',
    label: 'Bike',
    icon: '🏍️',
    desc: 'Fast & affordable',
    baseFare: '50–150',
    eta: '3 min',
  },
  {
    type: 'car',
    label: 'Car',
    icon: '🚗',
    desc: 'Comfortable sedan',
    baseFare: '150–350',
    eta: '5 min',
  },
  {
    type: 'suv',
    label: 'SUV',
    icon: '🚙',
    desc: 'Spacious & premium',
    baseFare: '300–600',
    eta: '7 min',
  },
];

export default function VehicleSelect() {
  const navigate = useNavigate();
  const { pickup, dropoff, stops, estimate, selectedVehicle, setSelectedVehicle, setActiveRequest } = useRideStore();
  const [loading, setLoading] = useState(false);
  const [surge,   setSurge]   = useState(null);

  useEffect(() => {
    if (!pickup?.lat || !pickup?.lng) return;
    fetch(`/api/admin/surge/check?lat=${pickup.lat}&lng=${pickup.lng}`)
      .then(r => r.json())
      .then(r => { if (r?.data?.multiplier > 1) setSurge(r.data); })
      .catch(() => {});
  }, [pickup?.lat, pickup?.lng]);

  const getFareRange = (type) => {
    if (!estimate) return VEHICLES.find(v => v.type === type)?.baseFare ?? '–';
    const e = estimate[type];
    if (!e) return '–';
    return `NPR ${e.min ?? e.estimated_min ?? '?'}–${e.max ?? e.estimated_max ?? '?'}`;
  };

  const handleRequest = async () => {
    if (!selectedVehicle) return toast.error('Select a vehicle type');
    setLoading(true);
    const idempotencyKey = createIdempotencyKey('ride');
    try {
      const res = await createRideRequest({
        pickup_address:  pickup.address,
        dropoff_address: dropoff.address,
        pickup_lat:      pickup.lat,
        pickup_lng:      pickup.lng,
        dropoff_lat:     dropoff.lat,
        dropoff_lng:     dropoff.lng,
        stops: stops.map(s => ({
          address: s.address,
          lat: s.lat,
          lng: s.lng,
        })),
        vehicle_type:  selectedVehicle,
        pricing_mode:  'bidding',
      }, idempotencyKey);

      const requestId = res?.data?.id ?? res?.data?.request?.id;
      if (!requestId) throw new Error('No request ID returned');
      setActiveRequest(requestId);
      navigate(`/rider/waiting/${requestId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
        <div>
          <h2 className="font-bold text-base">Choose your ride</h2>
          <p className="text-xs text-gray-400">{pickup?.address} → {dropoff?.address}</p>
        </div>
      </div>

      {/* Surge banner */}
      {surge && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <Zap size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs font-semibold text-amber-700">
            ⚡ High demand in {surge.surgeArea} — fares are {surge.multiplier}×
            {surge.reason ? ` (${surge.reason})` : ''}
          </p>
        </div>
      )}

      {/* Vehicle cards */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {VEHICLES.map(v => {
          const fare = getFareRange(v.type);
          const active = selectedVehicle === v.type;
          return (
            <button
              key={v.type}
              onClick={() => setSelectedVehicle(v.type)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-98 ${
                active ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="text-3xl w-12 text-center">{v.icon}</div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">{v.label}</p>
                  {active && <span className="text-xs bg-indigo-600 text-white rounded-full px-2 py-0.5">Selected</span>}
                </div>
                <p className="text-xs text-gray-500">{v.desc}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">{fare}</p>
                <div className="flex items-center gap-1 justify-end text-xs text-gray-400 mt-0.5">
                  <Clock size={10} />
                  <span>{v.eta}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Route summary */}
      <div className="px-4 pb-2 mx-4 bg-gray-50 rounded-xl p-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">From:</span> {pickup?.address}
        </div>
        {stops.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>Stop {i + 1}:</span> {s.address}
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
          <span className="font-medium">To:</span> {dropoff?.address}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-4">
        <button
          onClick={handleRequest}
          disabled={!selectedVehicle || loading}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-40 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {loading ? 'Requesting…' : <>Request {selectedVehicle ? VEHICLES.find(v => v.type === selectedVehicle)?.label : 'Ride'} <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
}
