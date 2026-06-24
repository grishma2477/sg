import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../hooks/useSocket';
import { useRideStore } from '../../store/rideStore';
import { useAuthStore } from '../../store/authStore';
import { setDriverOnlineStatus, updateDriverLocation, submitBid } from '../../api/rides.api';
import { getEarningsSummary } from '../../api/wallet.api';
import { MapPin, X, Star, Clock, ChevronRight } from 'lucide-react';

function IncomingRequestCard({ req, onBid, onSkip }) {
  const [bidAmount, setBidAmount] = useState(req.estimated_total ?? 0);
  const [showBid, setShowBid]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [timeLeft, setTimeLeft]   = useState(30);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); onSkip(req.id); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);

  const handleBid = async () => {
    if (!bidAmount || bidAmount <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const res = await submitBid(req.id, {
        bidAmount,
        estimatedArrivalMinutes: 5,
        driverMessage: '',
      });
      toast.success('Bid placed!');
      onSkip(req.id);
    } catch (err) {
      toast.error(err.message || 'Failed to bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Timer bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-indigo-500 transition-all duration-1000"
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <MapPin size={10} /> <span>{req.distance_km ?? '?'} km away</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">📍 {req.pickup_address}</p>
              {req.stops?.map((s, i) => (
                <p key={i} className="text-gray-500 ml-4">→ {s.address}</p>
              ))}
              <p className="font-medium text-gray-800">🏁 {req.dropoff_address}</p>
            </div>
          </div>
          <div className="text-right ml-3">
            <p className="text-lg font-black text-gray-900">NPR {req.estimated_total ?? '–'}</p>
            <p className="text-xs text-gray-400">{timeLeft}s left</p>
          </div>
        </div>

        {!showBid ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowBid(true)}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold"
            >
              Place Bid
            </button>
            <button
              onClick={() => onSkip(req.id)}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <div className="flex-1 border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-1">
              <span className="text-xs text-gray-500">NPR</span>
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(Number(e.target.value))}
                className="flex-1 outline-none text-sm font-bold"
              />
            </div>
            <button
              onClick={handleBid}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {loading ? '…' : 'Send'}
            </button>
            <button onClick={() => setShowBid(false)} className="p-2">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriverHome() {
  const navigate   = useNavigate();
  const { location } = useGeolocation();
  const { name }   = useAuthStore();
  const { incomingRequests, addIncomingRequest, removeIncomingRequest, activeRideId } = useRideStore();
  const [isOnline, setIsOnline]   = useState(false);
  const [toggling, setToggling]   = useState(false);
  const [todayEarnings, setEarnings] = useState(null);
  const locationInterval = useRef(null);

  // Resume active ride
  useEffect(() => {
    if (activeRideId) navigate(`/driver/ride/${activeRideId}`);
  }, [activeRideId]);

  useEffect(() => {
    getEarningsSummary('today')
      .then(r => setEarnings(r?.data))
      .catch(() => {});
  }, []);

  // Send location while online
  useEffect(() => {
    if (isOnline && location) {
      updateDriverLocation(location.lat, location.lng).catch(() => {});
    }
    if (isOnline) {
      locationInterval.current = setInterval(() => {
        if (location) updateDriverLocation(location.lat, location.lng).catch(() => {});
      }, 10000);
    }
    return () => clearInterval(locationInterval.current);
  }, [isOnline, location]);

  useSocket({
    new_ride_request: (data) => {
      if (isOnline) {
        addIncomingRequest(data);
        toast.success('New ride request!', { icon: '🛵' });
      }
    },
    'ride:bid:accepted': (data) => {
      navigate(`/driver/ride/${data.rideId}`);
    },
  });

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      await setDriverOnlineStatus(!isOnline);
      setIsOnline(v => !v);
      toast.success(!isOnline ? "You're online! 🟢" : "You're offline 🔴");
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const markers = location ? [{ lat: location.lat, lng: location.lng }] : [];

  return (
    <div className="flex flex-col h-full relative">
      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          center={location ?? { lat: 27.7172, lng: 85.3240 }}
          zoom={14}
          markers={markers}
          height="100%"
        />

        {/* Online toggle overlay */}
        <div className="absolute top-3 left-0 right-0 px-4 flex justify-between items-start">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-md">
            <p className="text-xs text-gray-500">Hi, {name ?? 'Driver'}</p>
            {todayEarnings && (
              <p className="text-sm font-bold text-gray-900">NPR {todayEarnings.net_earned ?? 0} today</p>
            )}
          </div>

          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 ${
              isOnline ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {toggling ? '…' : isOnline ? '🟢 Online' : '⚫ Go Online'}
          </button>
        </div>
      </div>

      {/* Incoming requests */}
      {isOnline && incomingRequests.length > 0 && (
        <div className="px-4 pt-3 pb-2 flex flex-col gap-3 max-h-64 overflow-y-auto">
          {incomingRequests.map(req => (
            <IncomingRequestCard
              key={req.id}
              req={req}
              onBid={(id) => {}}
              onSkip={(id) => removeIncomingRequest(id)}
            />
          ))}
        </div>
      )}

      {/* Offline message */}
      {!isOnline && (
        <div className="px-4 py-4 text-center">
          <p className="text-sm text-gray-400">Go online to start accepting rides</p>
        </div>
      )}
    </div>
  );
}
