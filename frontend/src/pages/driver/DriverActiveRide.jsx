import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { useRideStore } from '../../store/rideStore';
import { getRideDetails, arriveAtPickup, startRide, arriveAtStop, departStop, completeRide } from '../../api/rides.api';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { updateDriverLocation } from '../../api/rides.api';
import { Phone, ChevronRight } from 'lucide-react';

const STEPS = ['pickup', 'in_progress', 'completed'];

export default function DriverActiveRide() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { location } = useGeolocation();
  const { setRideStatus, rideStatus, setRideDetails, rideDetails, clearRide } = useRideStore();
  const [loading, setLoading] = useState(false);
  const [stopStep, setStopStep] = useState(0); // current stop index

  useEffect(() => {
    getRideDetails(rideId)
      .then(r => {
        const ride = r?.data;
        if (ride) { setRideDetails(ride); setRideStatus(ride.status); }
      })
      .catch(() => {});
  }, [rideId]);

  // Send location every 5s
  useEffect(() => {
    if (!location) return;
    updateDriverLocation(location.lat, location.lng).catch(() => {});
    const id = setInterval(() => {
      if (location) updateDriverLocation(location.lat, location.lng).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [location]);

  useSocket({
    'ride:cancelled': (d) => {
      if (String(d.rideId) === rideId) {
        clearRide();
        navigate('/driver', { replace: true });
        toast.error('Rider cancelled the ride');
      }
    },
  });

  const act = async (fn, successMsg, nextRoute) => {
    setLoading(true);
    try {
      await fn();
      if (successMsg) toast.success(successMsg);
      if (nextRoute) { clearRide(); navigate(nextRoute, { replace: true }); }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const stops = rideDetails?.stops ?? [];
  const atPickup  = rideStatus === 'driver_en_route' || rideStatus === 'accepted';
  const arrived   = rideStatus === 'arrived';
  const inProg    = rideStatus === 'in_progress';
  const atStop    = inProg && stopStep < stops.length;
  const atDropoff = inProg && stopStep >= stops.length;

  const progressSteps = ['Pickup', ...stops.map((_, i) => `Stop ${i + 1}`), 'Drop Off'];
  const currentStep   = arrived || atPickup ? 0 : stopStep + 1;

  const rider = rideDetails?.rider;
  const markers = [];
  if (location) markers.push({ lat: location.lat, lng: location.lng });

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          center={location ?? { lat: 27.7172, lng: 85.3240 }}
          zoom={15}
          markers={markers}
          height="100%"
        />
      </div>

      <div className="bg-white px-4 pt-4 pb-2">
        {/* Progress steps */}
        <div className="flex items-center mb-4 overflow-x-auto gap-1">
          {progressSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                i === currentStep ? 'bg-indigo-600 text-white' : i < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {step}
              </div>
              {i < progressSteps.length - 1 && <div className="w-3 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Rider info */}
        {rider && (
          <div className="flex items-center gap-3 mb-3 bg-gray-50 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
              {rider.photo ? <img src={rider.photo} alt="" className="w-full h-full rounded-full object-cover" /> : '🧑'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{rider.name ?? 'Rider'}</p>
              <p className="text-xs text-gray-500">{rideDetails?.pickup_address}</p>
            </div>
            <a href={`tel:${rider.phone}`} className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <Phone size={14} className="text-green-600" />
            </a>
          </div>
        )}

        {/* Action button */}
        {atPickup && (
          <button
            onClick={() => act(() => arriveAtPickup(rideId), "Arrived at pickup!", null).then(() => setRideStatus('arrived'))}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? '…' : <>I've Arrived at Pickup <ChevronRight size={16} /></>}
          </button>
        )}

        {arrived && (
          <button
            onClick={() => act(() => startRide(rideId), "Ride started!", null).then(() => setRideStatus('in_progress'))}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? '…' : <>Start Ride <ChevronRight size={16} /></>}
          </button>
        )}

        {atStop && (
          <div className="flex gap-2">
            <button
              onClick={() => act(() => arriveAtStop(rideId, stopStep), `Arrived at stop ${stopStep + 1}`, null).then(() => {})}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold"
            >
              {loading ? '…' : 'Arrived at Stop'}
            </button>
            <button
              onClick={() => { setStopStep(s => s + 1); departStop(rideId, stopStep).catch(() => {}); }}
              disabled={loading}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl text-sm font-semibold"
            >
              Departed →
            </button>
          </div>
        )}

        {atDropoff && (
          <button
            onClick={() => act(() => completeRide(rideId), 'Ride completed! 🎉', '/driver')}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Completing…' : <>Complete Ride <ChevronRight size={16} /></>}
          </button>
        )}
      </div>
    </div>
  );
}
