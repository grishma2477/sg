import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { useRideStore } from '../../store/rideStore';
import { getRideDetails, cancelRide } from '../../api/rides.api';
import MapView from '../../components/MapView';
import { Phone, Shield, Star, X, ChevronRight } from 'lucide-react';

const STATUS_LABELS = {
  driver_en_route: { text: 'Driver en route', color: 'bg-blue-100 text-blue-700' },
  arrived:         { text: 'Driver arrived', color: 'bg-green-100 text-green-700' },
  in_progress:     { text: 'Ride in progress', color: 'bg-indigo-100 text-indigo-700' },
  completed:       { text: 'Completed', color: 'bg-gray-100 text-gray-700' },
};

export default function RideInProgress() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { rideStatus, setRideStatus, driverLocation, setDriverLocation, setRideDetails, rideDetails, clearRide } = useRideStore();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getRideDetails(rideId)
      .then(r => {
        const ride = r?.data;
        if (ride) {
          setRideDetails(ride);
          setRideStatus(ride.status);
        }
      })
      .catch(() => {});
  }, [rideId]);

  useEffect(() => {
    if (rideStatus === 'completed') {
      navigate(`/rider/review/${rideId}`, { replace: true });
    }
  }, [rideStatus]);

  useSocket({
    'driver_en_route':    (d) => { if (String(d.rideId) === rideId) { setRideStatus('driver_en_route'); setDriverLocation(d.location ?? null); } },
    'driver_arrived':     (d) => { if (String(d.rideId) === rideId) setRideStatus('arrived'); toast.success('Driver has arrived!', { icon: '🏍️' }); },
    'ride:started':       (d) => { if (String(d.rideId) === rideId) setRideStatus('in_progress'); },
    'ride:completed':     (d) => { if (String(d.rideId) === rideId) { setRideStatus('completed'); } },
    'ride:cancelled':     (d) => { if (String(d.rideId) === rideId) { clearRide(); navigate('/rider', { replace: true }); toast.error('Ride was cancelled'); } },
    'location:update':    (d) => { if (String(d.rideId) === rideId) setDriverLocation({ lat: d.lat, lng: d.lng }); },
  });

  const handleCancel = async () => {
    if (!window.confirm('Cancel this ride?')) return;
    setCancelling(true);
    try {
      await cancelRide(rideId, 'Rider cancelled');
      clearRide();
      navigate('/rider', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Cannot cancel now');
    } finally {
      setCancelling(false);
    }
  };

  const status = STATUS_LABELS[rideStatus] ?? STATUS_LABELS.driver_en_route;
  const driver = rideDetails?.driver;

  const markers = [];
  if (driverLocation) markers.push({ lat: driverLocation.lat, lng: driverLocation.lng, label: { text: '🏍', fontSize: '18px' } });
  if (rideDetails?.pickup_lat) markers.push({ lat: parseFloat(rideDetails.pickup_lat), lng: parseFloat(rideDetails.pickup_lng), label: { text: 'P', color: 'white' } });

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          center={driverLocation ?? { lat: 27.7172, lng: 85.3240 }}
          zoom={15}
          markers={markers}
          height="100%"
        />

        {/* Status chip */}
        <div className="absolute top-3 left-0 right-0 flex justify-center px-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-md ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Driver info card */}
      <div className="bg-white px-4 pt-4 pb-2">
        {driver ? (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl overflow-hidden">
              {driver.photo ? <img src={driver.photo} alt="" className="w-full h-full object-cover" /> : '🧑'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="font-bold text-gray-900">{driver.name ?? 'Your Driver'}</p>
                {driver.has_badge && <Shield size={13} className="text-indigo-500" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span>{driver.rating?.toFixed(1) ?? 'New'}</span>
                <span>•</span>
                <span>{driver.plate ?? 'BA 1 PA 1234'}</span>
              </div>
            </div>
            <a
              href={`tel:${driver.phone}`}
              className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
            >
              <Phone size={16} className="text-green-600" />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
            <div className="flex-1">
              <div className="h-3 bg-gray-100 rounded w-32 mb-1 animate-pulse" />
              <div className="h-2 bg-gray-100 rounded w-20 animate-pulse" />
            </div>
          </div>
        )}

        {/* Route summary */}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-600 mb-3">
          <div><span className="font-medium">📍 From:</span> {rideDetails?.pickup_address ?? '…'}</div>
          <div className="mt-1"><span className="font-medium">🏁 To:</span> {rideDetails?.dropoff_address ?? '…'}</div>
        </div>

        {/* Cancel (only before in_progress) */}
        {rideStatus !== 'in_progress' && rideStatus !== 'completed' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-1.5 border border-red-200 text-red-500 rounded-xl py-2.5 text-sm font-medium"
          >
            <X size={14} />
            {cancelling ? 'Cancelling…' : 'Cancel ride'}
          </button>
        )}
      </div>
    </div>
  );
}
