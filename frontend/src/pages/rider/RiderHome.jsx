import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useRideStore } from '../../store/rideStore';
import { useAuthStore } from '../../store/authStore';
import { getNearbyDrivers } from '../../api/rides.api';
import { MapPin, Search } from 'lucide-react';

export default function RiderHome() {
  const navigate            = useNavigate();
  const { location }        = useGeolocation();
  const { name }            = useAuthStore();
  const { clearDestination, activeRideId } = useRideStore();
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  // Resume active ride if any
  useEffect(() => {
    if (activeRideId) navigate(`/rider/ride/${activeRideId}`);
  }, [activeRideId]);

  useEffect(() => {
    clearDestination();
  }, []);

  useEffect(() => {
    if (!location) return;
    getNearbyDrivers(location.lat, location.lng)
      .then(r => setNearbyDrivers(r?.data ?? []))
      .catch(() => {});
  }, [location]);

  const markers = [
    ...(location ? [{ lat: location.lat, lng: location.lng, label: { text: '•', color: '#6366f1', fontSize: '20px' } }] : []),
    ...nearbyDrivers.slice(0, 10).map(d => ({
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lng),
      label: { text: '🏍', fontSize: '16px' },
    })),
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Map fills most of the screen */}
      <div className="flex-1 relative">
        <MapView
          center={location ?? { lat: 27.7172, lng: 85.3240 }}
          zoom={15}
          markers={markers}
          height="100%"
        />

        {/* Greeting overlay */}
        <div className="absolute top-3 left-0 right-0 px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md">
            <p className="text-xs text-gray-500">Good {getGreeting()}</p>
            <p className="text-base font-bold text-gray-900">{name ?? 'Rider'} 👋</p>
          </div>
        </div>
      </div>

      {/* Bottom "Where to?" card */}
      <div className="bg-white px-4 pt-4 pb-2 shadow-t-lg">
        <button
          onClick={() => navigate('/rider/destination')}
          className="w-full flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Search size={14} color="white" />
          </div>
          <span className="text-gray-500 text-sm font-medium">Where to?</span>
        </button>

        <div className="flex gap-2 mt-3">
          {['Office', 'Home', 'Airport'].map(place => (
            <button
              key={place}
              onClick={() => navigate('/rider/destination')}
              className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              <MapPin size={10} />
              {place}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
