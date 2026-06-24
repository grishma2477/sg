import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import SGMapView from '../../components/SGMapView';
import NotifBanner from '../../components/NotifBanner';
import { useSocket } from '../../hooks/useSocket';
import { useNotificationListeners } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { getNearbyDrivers } from '../../api/rides.api';
import { COLORS, KATHMANDU_CENTER } from '../../constants';

export default function RiderHome() {
  const name          = useAuthStore(s => s.name);
  const activeRideId  = useRideStore(s => s.activeRideId);
  const setPickup     = useRideStore(s => s.setPickup);
  const [location,    setLocation]  = useState(null);
  const [nearbyDrivers,setNearby]   = useState([]);
  const [banner,      setBanner]    = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = loc.coords;
      setLocation({ lat, lng });
      setPickup({ lat, lng, address: 'Current location' });
      getNearbyDrivers(lat, lng).then(r => setNearby(r?.data?.drivers ?? [])).catch(() => {});
    })();
  }, []);

  useEffect(() => {
    if (activeRideId) router.replace(`/(rider)/ride/${activeRideId}`);
  }, [activeRideId]);

  useSocket({ 'new:notification': (n) => setBanner(n) });

  useNotificationListeners({
    onResponse: (r) => {
      const data = r.notification.request.content.data;
      if (data?.ride_id)    router.push(`/(rider)/ride/${data.ride_id}`);
      if (data?.request_id) router.push(`/(rider)/waiting/${data.request_id}`);
    },
  });

  const quickSuggestions = ['Home', 'Office', 'Airport'];

  return (
    <View style={{ flex: 1 }}>
      <SGMapView
        pickup={location}
        driverLocation={nearbyDrivers[0]?.location ?? null}
        style={StyleSheet.absoluteFill}
      />

      <NotifBanner notification={banner} onDismiss={() => setBanner(null)} />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.greeting}>
          <Text style={styles.hi}>Hey {name ?? 'there'} 👋</Text>
          <Text style={styles.sub}>Where are you headed?</Text>
        </View>

        <View style={styles.bottomCard}>
          <TouchableOpacity onPress={() => router.push('/(rider)/destination')} style={styles.whereInput}>
            <Text style={styles.wherePlaceholder}>🔍  Where to?</Text>
          </TouchableOpacity>

          <View style={styles.chips}>
            {quickSuggestions.map(s => (
              <TouchableOpacity key={s} onPress={() => router.push('/(rider)/destination')} style={styles.chip}>
                <Text style={styles.chipText}>📍 {s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.nearby}>
            {nearbyDrivers.length > 0 ? `${nearbyDrivers.length} drivers nearby` : 'Finding drivers…'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'space-between' },
  greeting:   { margin: 16, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  hi:         { fontSize: 22, fontWeight: '700', color: COLORS.gray900 },
  sub:        { fontSize: 14, color: COLORS.gray500, marginTop: 2 },
  bottomCard: { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  whereInput: { backgroundColor: COLORS.gray50, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.gray200 },
  wherePlaceholder: { fontSize: 16, color: COLORS.gray400 },
  chips:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip:       { backgroundColor: COLORS.gray100, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText:   { fontSize: 13, color: COLORS.gray700 },
  nearby:     { fontSize: 13, color: COLORS.gray500, textAlign: 'center' },
});
