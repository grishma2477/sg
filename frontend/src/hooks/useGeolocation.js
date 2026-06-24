import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        // Fall back to Kathmandu centre
        setLocation({ lat: 27.7172, lng: 85.3240 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { location, error, loading };
}
