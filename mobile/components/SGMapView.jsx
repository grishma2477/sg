import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { KATHMANDU_CENTER, COLORS } from '../constants';

function decodePolyline(encoded) {
  if (!encoded) return [];
  let idx = 0, lat = 0, lng = 0;
  const coords = [];
  while (idx < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
}

export default function SGMapView({
  pickup,
  dropoff,
  stops = [],
  driverLocation,
  polyline,
  style,
  children,
}) {
  const mapRef = useRef(null);

  const initialRegion = pickup
    ? { latitude: pickup.lat, longitude: pickup.lng, latitudeDelta: 0.015, longitudeDelta: 0.015 }
    : { ...KATHMANDU_CENTER, latitudeDelta: 0.08, longitudeDelta: 0.08 };

  const routeCoords = polyline ? decodePolyline(polyline) : [];

  useEffect(() => {
    if (!mapRef.current) return;
    const points = [];
    if (pickup)         points.push({ latitude: pickup.lat,  longitude: pickup.lng });
    if (dropoff)        points.push({ latitude: dropoff.lat, longitude: dropoff.lng });
    if (driverLocation) points.push({ latitude: driverLocation.lat, longitude: driverLocation.lng });
    stops.forEach(s => points.push({ latitude: s.lat, longitude: s.lng }));
    if (points.length > 1) mapRef.current.fitToCoordinates(points, { edgePadding: { top: 80, right: 40, bottom: 200, left: 40 }, animated: true });
  }, [pickup, dropoff, driverLocation, stops]);

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
    >
      {pickup && (
        <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
          title="Pickup" pinColor={COLORS.success} />
      )}
      {dropoff && (
        <Marker coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
          title="Dropoff" pinColor={COLORS.danger} />
      )}
      {stops.map((s, i) => (
        <Marker key={i} coordinate={{ latitude: s.lat, longitude: s.lng }}
          title={`Stop ${i + 1}`} pinColor={COLORS.warning} />
      ))}
      {driverLocation && (
        <Marker coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}
          title="Driver">
          <View style={styles.driverDot}><Text style={styles.driverEmoji}>🚗</Text></View>
        </Marker>
      )}
      {routeCoords.length > 1 && (
        <Polyline coordinates={routeCoords} strokeColor={COLORS.primary} strokeWidth={4} />
      )}
      {children}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map:        { flex: 1 },
  driverDot:  { backgroundColor: COLORS.primary, borderRadius: 16, padding: 4 },
  driverEmoji:{ fontSize: 18 },
});
