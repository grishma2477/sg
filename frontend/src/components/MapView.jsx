import { useCallback } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from '@react-google-maps/api';

// TODO: Set VITE_GOOGLE_MAPS_API_KEY in frontend/.env
// Get from: https://console.cloud.google.com/ → APIs → Maps JavaScript API + Places API + Geocoding API
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const KATHMANDU_CENTER = { lat: 27.7172, lng: 85.3240 };

const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
];

function MapPlaceholder({ center }) {
  return (
    <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />
      <div className="bg-white rounded-full p-3 shadow-md">
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <p className="text-sm text-gray-500 font-medium">Map View</p>
      {center && (
        <p className="text-xs text-gray-400">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
      )}
      <p className="text-xs text-gray-400 mt-1">Set VITE_GOOGLE_MAPS_API_KEY to enable</p>
    </div>
  );
}

export default function MapView({
  center = KATHMANDU_CENTER,
  zoom = 14,
  markers = [],
  polyline = null,
  height = '100%',
  onClick,
}) {
  const onLoad = useCallback(() => {}, []);

  if (!MAPS_API_KEY || MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return <div style={{ height }}><MapPlaceholder center={center} /></div>;
  }

  return (
    <LoadScript googleMapsApiKey={MAPS_API_KEY} libraries={['places']}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height }}
        center={center}
        zoom={zoom}
        options={{ styles: MAP_STYLES, disableDefaultUI: true, zoomControl: true }}
        onClick={onClick}
        onLoad={onLoad}
      >
        {markers.map((m, i) => (
          <Marker
            key={i}
            position={{ lat: m.lat, lng: m.lng }}
            label={m.label}
            icon={m.icon}
          />
        ))}
        {polyline && (
          <Polyline
            path={polyline}
            options={{ strokeColor: '#6366f1', strokeWeight: 4, strokeOpacity: 0.8 }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
