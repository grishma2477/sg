import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createRideRequest } from '../../api/rides.api';
import { useRideStore } from '../../store/rideStore';
import { COLORS, VEHICLE_TYPES } from '../../constants';

function createIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function VehicleSelectScreen() {
  const pickup      = useRideStore(s => s.pickup);
  const dropoff     = useRideStore(s => s.dropoff);
  const stops       = useRideStore(s => s.stops);
  const estimate    = useRideStore(s => s.estimate);
  const setVehicle  = useRideStore(s => s.setSelectedVehicle);
  const setActiveRequest = useRideStore(s => s.setActiveRequest);

  const [selected, setSelected]  = useState(null);
  const [loading,  setLoading]   = useState(false);

  const fares = estimate?.fares ?? {};

  async function book() {
    if (!selected) { Alert.alert('Select a vehicle type'); return; }
    setLoading(true);
    try {
      const body = {
        pickup_lat:   pickup.lat,
        pickup_lng:   pickup.lng,
        pickup_address: pickup.address,
        dropoff_lat:  dropoff.lat,
        dropoff_lng:  dropoff.lng,
        dropoff_address: dropoff.address,
        stops:        stops.map(s => ({ lat: s.lat, lng: s.lng, address: s.address })),
        vehicle_type: selected,
        idempotency_key: createIdempotencyKey(),
      };
      const res = await createRideRequest(body);
      const requestId = res?.data?.request?.id ?? res?.data?.id;
      setVehicle(selected);
      setActiveRequest(requestId);
      router.replace(`/(rider)/waiting/${requestId}`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not create request');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Choose your ride</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {VEHICLE_TYPES.map(v => {
          const fareRange = fares[v.type]
            ? `Rs ${Math.round(fares[v.type].min)}–${Math.round(fares[v.type].max)}`
            : `Rs ${v.baseFare}`;
          return (
            <TouchableOpacity
              key={v.type}
              onPress={() => setSelected(v.type)}
              style={[styles.card, selected === v.type && styles.cardActive]}
            >
              <Text style={styles.icon}>{v.icon}</Text>
              <View style={styles.info}>
                <Text style={styles.vname}>{v.label}</Text>
                <Text style={styles.desc}>{v.desc}</Text>
                <Text style={styles.eta}>⏱ {v.eta}</Text>
              </View>
              <View style={styles.fareWrap}>
                <Text style={styles.fare}>{fareRange}</Text>
                <Text style={styles.fareNote}>est.</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={book} style={[styles.btn, (!selected || loading) && styles.btnDim]} disabled={!selected || loading}>
          <Text style={styles.btnText}>{loading ? 'Booking…' : `Book ${selected ?? 'a ride'}`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.white },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  back:       { fontSize: 16, color: COLORS.primary },
  title:      { fontSize: 20, fontWeight: '700', color: COLORS.gray900 },
  scroll:     { flex: 1, paddingHorizontal: 16, gap: 12 },
  card:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  cardActive: { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
  icon:       { fontSize: 36 },
  info:       { flex: 1, gap: 2 },
  vname:      { fontSize: 17, fontWeight: '700', color: COLORS.gray900 },
  desc:       { fontSize: 13, color: COLORS.gray500 },
  eta:        { fontSize: 12, color: COLORS.success, marginTop: 2 },
  fareWrap:   { alignItems: 'flex-end' },
  fare:       { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  fareNote:   { fontSize: 11, color: COLORS.gray400 },
  footer:     { padding: 16 },
  btn:        { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnDim:     { opacity: 0.4 },
  btnText:    { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
