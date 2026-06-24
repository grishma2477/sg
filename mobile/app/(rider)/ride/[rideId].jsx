import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SGMapView from '../../../components/SGMapView';
import { useSocket } from '../../../hooks/useSocket';
import { useRideStore } from '../../../store/rideStore';
import { cancelRide, getRideDetails } from '../../../api/rides.api';
import { COLORS } from '../../../constants';

const STATUS_LABELS = {
  confirmed:   '✅ Driver is coming',
  en_route:    '🚗 Driver is on the way',
  arrived:     '📍 Driver has arrived',
  in_progress: '🚀 Ride in progress',
  completed:   '🏁 Ride completed',
  cancelled:   '❌ Ride cancelled',
};

export default function RideInProgress() {
  const { rideId }      = useLocalSearchParams();
  const rideStatus      = useRideStore(s => s.rideStatus);
  const driverLocation  = useRideStore(s => s.driverLocation);
  const rideDetails     = useRideStore(s => s.rideDetails);
  const setRideStatus   = useRideStore(s => s.setRideStatus);
  const setDriverLoc    = useRideStore(s => s.setDriverLocation);
  const setRideDetails  = useRideStore(s => s.setRideDetails);
  const clearRide       = useRideStore(s => s.clearRide);
  const [cancelling,    setCancelling] = useState(false);

  useEffect(() => {
    getRideDetails(rideId)
      .then(r => { setRideDetails(r?.data ?? r); setRideStatus(r?.data?.status ?? r?.status); })
      .catch(() => {});
  }, [rideId]);

  useSocket({
    'location:update':    (d) => { if (String(d.ride_id) === String(rideId)) setDriverLoc({ lat: d.lat, lng: d.lng }); },
    'driver_en_route':    ()  => setRideStatus('en_route'),
    'driver_arrived':     ()  => setRideStatus('arrived'),
    'ride:started':       ()  => setRideStatus('in_progress'),
    'ride:completed':     ()  => { setRideStatus('completed'); setTimeout(() => router.replace(`/(rider)/review/${rideId}`), 1200); },
    'ride:cancelled':     ()  => { setRideStatus('cancelled'); clearRide(); setTimeout(() => router.replace('/(rider)/'), 2000); },
  });

  async function handleCancel() {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'No' },
      {
        text: 'Yes, cancel', style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelRide(rideId, 'Rider cancelled');
            clearRide();
            router.replace('/(rider)/');
          } catch (e) {
            Alert.alert('Error', e?.response?.data?.message || 'Cannot cancel now');
            setCancelling(false);
          }
        },
      },
    ]);
  }

  const driver   = rideDetails?.driver;
  const pickup   = rideDetails?.pickup_location   ? { lat: rideDetails.pickup_lat,  lng: rideDetails.pickup_lng  } : null;
  const dropoff  = rideDetails?.dropoff_location  ? { lat: rideDetails.dropoff_lat, lng: rideDetails.dropoff_lng } : null;
  const canCancel= rideStatus && !['in_progress','completed','cancelled'].includes(rideStatus);

  return (
    <View style={{ flex: 1 }}>
      <SGMapView
        pickup={pickup}
        dropoff={dropoff}
        driverLocation={driverLocation}
        polyline={rideDetails?.route_polyline}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.statusChip}>
          <Text style={styles.statusText}>{STATUS_LABELS[rideStatus] ?? '⏳ Loading…'}</Text>
        </View>

        <View style={styles.bottomCard}>
          {driver && (
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}><Text style={{ fontSize: 24 }}>🧑</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverMeta}>⭐ {driver.rating?.toFixed(1) ?? '4.5'} · {rideDetails?.vehicle_type}</Text>
                <Text style={styles.plateNum}>{driver.vehicle_number ?? '—'}</Text>
              </View>
            </View>
          )}

          {canCancel && (
            <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} disabled={cancelling}>
              <Text style={styles.cancelTxt}>{cancelling ? 'Cancelling…' : 'Cancel Ride'}</Text>
            </TouchableOpacity>
          )}

          {rideStatus === 'completed' && (
            <TouchableOpacity onPress={() => router.replace(`/(rider)/review/${rideId}`)} style={styles.reviewBtn}>
              <Text style={styles.reviewTxt}>Rate your ride →</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:     { flex: 1, justifyContent: 'space-between', pointerEvents: 'box-none' },
  statusChip:  { margin: 16, alignSelf: 'center', backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  statusText:  { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  bottomCard:  { margin: 16, backgroundColor: COLORS.white, borderRadius: 20, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  driverRow:   { flexDirection: 'row', gap: 12, alignItems: 'center' },
  driverAvatar:{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  driverName:  { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  driverMeta:  { fontSize: 13, color: COLORS.gray500 },
  plateNum:    { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  cancelBtn:   { borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 12, padding: 12, alignItems: 'center' },
  cancelTxt:   { color: COLORS.danger, fontWeight: '600', fontSize: 14 },
  reviewBtn:   { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  reviewTxt:   { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
