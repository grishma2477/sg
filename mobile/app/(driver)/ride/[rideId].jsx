import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SGMapView from '../../../components/SGMapView';
import { useSocket } from '../../../hooks/useSocket';
import { useRideStore } from '../../../store/rideStore';
import { arriveAtPickup, arriveAtStop, completeRide, departStop, getRideDetails, startRide, updateDriverLocation } from '../../../api/rides.api';
import { updateLocationInterval } from '../../../tasks/locationTask';
import * as Location from 'expo-location';
import { COLORS } from '../../../constants';

const STEPS = [
  { key: 'confirmed',   label: 'Confirmed',     icon: '✅' },
  { key: 'arrived',     label: 'Arrived',        icon: '📍' },
  { key: 'in_progress', label: 'In Progress',    icon: '🚀' },
  { key: 'completed',   label: 'Completed',      icon: '🏁' },
];

const STEP_ACTIONS = {
  confirmed:   { label: "I've Arrived at Pickup", fn: (id) => arriveAtPickup(id)  },
  arrived:     { label: 'Start Ride',              fn: (id) => startRide(id)       },
  in_progress: { label: 'Complete Ride',           fn: (id) => completeRide(id)    },
};

export default function DriverActiveRide() {
  const { rideId }    = useLocalSearchParams();
  const rideStatus    = useRideStore(s => s.rideStatus);
  const rideDetails   = useRideStore(s => s.rideDetails);
  const setRideStatus = useRideStore(s => s.setRideStatus);
  const setRideDetails= useRideStore(s => s.setRideDetails);
  const clearRide     = useRideStore(s => s.clearRide);

  const [loading,    setLoading]  = useState(false);
  const [myLocation, setMyLoc]    = useState(null);
  const locRef = useRef(null);

  useEffect(() => {
    getRideDetails(rideId)
      .then(r => { setRideDetails(r?.data ?? r); setRideStatus((r?.data ?? r)?.status); })
      .catch(() => {});

    // Send location every 5s while ride is active
    locRef.current = setInterval(async () => {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null);
      if (!loc) return;
      const { latitude: lat, longitude: lng } = loc.coords;
      setMyLoc({ lat, lng });
      await updateDriverLocation(lat, lng).catch(() => {});
    }, 5000);

    return () => { if (locRef.current) clearInterval(locRef.current); };
  }, [rideId]);

  useSocket({
    'ride:cancelled': () => {
      Alert.alert('Ride Cancelled', 'The rider cancelled the ride.');
      clearRide();
      updateLocationInterval(false);
      router.replace('/(driver)/');
    },
  });

  async function doAction() {
    const action = STEP_ACTIONS[rideStatus];
    if (!action) return;
    setLoading(true);
    try {
      const res = await action.fn(rideId);
      if (rideStatus === 'confirmed') setRideStatus('arrived');
      else if (rideStatus === 'arrived')     setRideStatus('in_progress');
      else if (rideStatus === 'in_progress') {
        setRideStatus('completed');
        clearRide();
        updateLocationInterval(false);
        setTimeout(() => router.replace('/(driver)/'), 1500);
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    } finally { setLoading(false); }
  }

  const stops     = rideDetails?.stops ?? [];
  const stopsDone = stops.filter(s => s.departed_at).length;
  const nextStop  = stops.find(s => !s.departed_at);
  const pickup    = rideDetails ? { lat: rideDetails.pickup_lat, lng: rideDetails.pickup_lng } : null;
  const dropoff   = rideDetails ? { lat: rideDetails.dropoff_lat, lng: rideDetails.dropoff_lng } : null;
  const rider     = rideDetails?.rider;

  async function handleStopAction(stop, idx) {
    setLoading(true);
    try {
      if (!stop.arrived_at)  await arriveAtStop(rideId, idx);
      else                   await departStop(rideId, idx);
      const r = await getRideDetails(rideId);
      setRideDetails(r?.data ?? r);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    } finally { setLoading(false); }
  }

  const stepIdx = STEPS.findIndex(s => s.key === rideStatus);

  return (
    <View style={{ flex: 1 }}>
      <SGMapView
        pickup={pickup}
        dropoff={dropoff}
        stops={stops.map(s => ({ lat: s.lat, lng: s.lng }))}
        driverLocation={myLocation}
        polyline={rideDetails?.route_polyline}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Progress steps */}
        <View style={styles.stepsCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STEPS.map((step, i) => (
              <View key={step.key} style={styles.stepItem}>
                <View style={[styles.stepDot, i <= stepIdx && styles.stepDotDone]}>
                  <Text style={{ fontSize: 12 }}>{i <= stepIdx ? step.icon : '○'}</Text>
                </View>
                <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelDone]}>{step.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomCard}>
          {rider && (
            <View style={styles.riderRow}>
              <Text style={styles.riderIcon}>🙋</Text>
              <View>
                <Text style={styles.riderName}>{rider.name}</Text>
                <Text style={styles.riderPhone}>{rider.phone}</Text>
              </View>
            </View>
          )}

          {/* Stop actions (if any) */}
          {rideStatus === 'in_progress' && nextStop && (
            <TouchableOpacity onPress={() => handleStopAction(nextStop, stops.indexOf(nextStop))} style={styles.stopBtn} disabled={loading}>
              <Text style={styles.stopTxt}>
                {!nextStop.arrived_at ? `📍 Arrived at Stop ${stops.indexOf(nextStop) + 1}` : `🚀 Depart Stop ${stops.indexOf(nextStop) + 1}`}
              </Text>
            </TouchableOpacity>
          )}

          {STEP_ACTIONS[rideStatus] && (
            <TouchableOpacity onPress={doAction} style={[styles.actionBtn, loading && styles.btnDim]} disabled={loading}>
              <Text style={styles.actionTxt}>{loading ? 'Processing…' : STEP_ACTIONS[rideStatus].label}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:      { flex: 1, justifyContent: 'space-between' },
  stepsCard:    { margin: 12, backgroundColor: COLORS.white, borderRadius: 14, padding: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  stepItem:     { alignItems: 'center', gap: 4, marginHorizontal: 12 },
  stepDot:      { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  stepDotDone:  { backgroundColor: '#ede9fe' },
  stepLabel:    { fontSize: 11, color: COLORS.gray400 },
  stepLabelDone:{ color: COLORS.primary, fontWeight: '600' },
  bottomCard:   { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  riderRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  riderIcon:    { fontSize: 28 },
  riderName:    { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  riderPhone:   { fontSize: 13, color: COLORS.gray500 },
  stopBtn:      { backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, alignItems: 'center' },
  stopTxt:      { color: '#92400e', fontWeight: '600', fontSize: 14 },
  actionBtn:    { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDim:       { opacity: 0.6 },
  actionTxt:    { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
