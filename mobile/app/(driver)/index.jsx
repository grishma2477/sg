import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import SGMapView from '../../components/SGMapView';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { setDriverOnlineStatus } from '../../api/rides.api';
import { startBackgroundLocation, stopBackgroundLocation, updateLocationInterval } from '../../tasks/locationTask';
import { COLORS } from '../../constants';

function IncomingCard({ req, onBid, onDismiss }) {
  const [bidAmt, setBidAmt] = useState('');
  const [loading, setLoading] = useState(false);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 0, duration: 30000, useNativeDriver: false }).start(
      ({ finished }) => { if (finished) onDismiss(req.id); }
    );
  }, []);

  async function submit() {
    if (!bidAmt) { Alert.alert('Enter bid amount'); return; }
    setLoading(true);
    await onBid(req.id, Number(bidAmt));
    setLoading(false);
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.inCard}>
      <Animated.View style={[styles.inTimer, { width: barWidth }]} />
      <Text style={styles.inTitle}>New Ride Request</Text>
      <Text style={styles.inMeta}>📍 {req.pickup_address ?? 'Pickup'}</Text>
      <Text style={styles.inMeta}>🏁 {req.dropoff_address ?? 'Dropoff'}</Text>
      <Text style={styles.inMeta}>🚗 {req.vehicle_type} · Rs {req.estimated_fare_min}–{req.estimated_fare_max}</Text>

      <View style={styles.inRow}>
        <TextInput
          style={styles.bidInput}
          value={bidAmt}
          onChangeText={setBidAmt}
          keyboardType="numeric"
          placeholder="Your bid (Rs)"
        />
        <TouchableOpacity onPress={submit} style={styles.bidBtn} disabled={loading}>
          <Text style={styles.bidBtnTxt}>{loading ? '…' : 'Bid'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => onDismiss(req.id)} style={styles.skipBtn}>
        <Text style={styles.skipTxt}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DriverHome() {
  const driverId   = useAuthStore(s => s.driverId);
  const requests   = useRideStore(s => s.incomingRequests);
  const addReq     = useRideStore(s => s.addIncomingRequest);
  const removeReq  = useRideStore(s => s.removeIncomingRequest);
  const setActive  = useRideStore(s => s.setActiveRide);

  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const locInterval = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
    return () => { if (locInterval.current) clearInterval(locInterval.current); };
  }, []);

  async function toggleOnline() {
    const next = !isOnline;
    try {
      await setDriverOnlineStatus(next);
      if (next) {
        await startBackgroundLocation(false);
      } else {
        await stopBackgroundLocation();
      }
      setIsOnline(next);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not update status');
    }
  }

  async function handleBid(requestId, amount) {
    const { submitBid } = await import('../../api/rides.api');
    try {
      await submitBid(requestId, { amount });
      removeReq(requestId);
      Alert.alert('Bid placed!', `You bid Rs ${amount}`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Bid failed');
    }
  }

  useSocket({
    new_ride_request: (data) => { if (isOnline) addReq(data); },
    'ride:bid:accepted': (data) => {
      removeReq(data.request_id);
      const rideId = data.ride_id;
      setActive(rideId, 'confirmed');
      updateLocationInterval(true);
      router.push(`/(driver)/ride/${rideId}`);
    },
  });

  const current = requests[0] ?? null;

  return (
    <View style={{ flex: 1 }}>
      <SGMapView driverLocation={location} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Text style={styles.topLabel}>{isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
          <TouchableOpacity onPress={toggleOnline} style={[styles.toggleBtn, isOnline && styles.toggleBtnOn]}>
            <Text style={styles.toggleTxt}>{isOnline ? 'Go Offline' : 'Go Online'}</Text>
          </TouchableOpacity>
        </View>

        {current && (
          <View style={styles.cardWrap}>
            <IncomingCard
              req={current}
              onBid={handleBid}
              onDismiss={removeReq}
            />
          </View>
        )}

        {!current && isOnline && (
          <View style={styles.waiting}>
            <Text style={styles.waitingTxt}>Waiting for ride requests…</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:     { flex: 1 },
  topBar:      { margin: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  topLabel:    { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  toggleBtn:   { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  toggleBtnOn: { backgroundColor: COLORS.danger },
  toggleTxt:   { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  cardWrap:    { position: 'absolute', bottom: 100, left: 16, right: 16 },
  inCard:      { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, gap: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  inTimer:     { position: 'absolute', top: 0, left: 0, height: 4, backgroundColor: COLORS.primary },
  inTitle:     { fontSize: 17, fontWeight: '800', color: COLORS.gray900 },
  inMeta:      { fontSize: 13, color: COLORS.gray600 },
  inRow:       { flexDirection: 'row', gap: 8, marginTop: 4 },
  bidInput:    { flex: 1, borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 10, padding: 12, fontSize: 15 },
  bidBtn:      { backgroundColor: COLORS.primary, paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  bidBtnTxt:   { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  skipBtn:     { alignItems: 'center', padding: 4 },
  skipTxt:     { color: COLORS.gray400, fontSize: 13 },
  waiting:     { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  waitingTxt:  { fontSize: 14, color: COLORS.gray500 },
});
