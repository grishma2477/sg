import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { estimateRide } from '../../api/rides.api';
import { useRideStore } from '../../store/rideStore';
import { COLORS } from '../../constants';

function LocationInput({ label, value, onChangeText, placeholder }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value?.address ?? ''}
        onChangeText={t => onChangeText({ address: t, lat: 27.7172, lng: 85.3240 })}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
      />
    </View>
  );
}

export default function DestinationPicker() {
  const pickup      = useRideStore(s => s.pickup);
  const dropoff     = useRideStore(s => s.dropoff);
  const stops       = useRideStore(s => s.stops);
  const setPickup   = useRideStore(s => s.setPickup);
  const setDropoff  = useRideStore(s => s.setDropoff);
  const setStops    = useRideStore(s => s.setStops);
  const setEstimate = useRideStore(s => s.setEstimate);
  const [loading, setLoading] = useState(false);

  async function handleEstimate() {
    if (!dropoff?.address) { Alert.alert('Enter a destination'); return; }
    setLoading(true);
    try {
      const body = {
        pickup_lat:   pickup?.lat  ?? 27.7172,
        pickup_lng:   pickup?.lng  ?? 85.3240,
        dropoff_lat:  dropoff.lat,
        dropoff_lng:  dropoff.lng,
        stops: stops.map(s => ({ lat: s.lat, lng: s.lng })),
      };
      const res = await estimateRide(body);
      setEstimate(res?.data ?? res);
      router.push('/(rider)/vehicles');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not get estimate');
    } finally { setLoading(false); }
  }

  function addStop() {
    if (stops.length < 4) setStops([...stops, { address: '', lat: 27.7172, lng: 85.3240 }]);
  }
  function removeStop(i) { setStops(stops.filter((_, idx) => idx !== i)); }
  function updateStop(i, val) { const s = [...stops]; s[i] = val; setStops(s); }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Set your route</Text>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <LocationInput label="📍 Pickup" value={pickup} onChangeText={setPickup} placeholder="Current location" />

        {stops.map((s, i) => (
          <View key={i} style={styles.stopRow}>
            <View style={{ flex: 1 }}>
              <LocationInput label={`🔵 Stop ${i + 1}`} value={s} onChangeText={v => updateStop(i, v)} placeholder={`Stop ${i + 1}`} />
            </View>
            <TouchableOpacity onPress={() => removeStop(i)} style={styles.removeBtn}>
              <Text style={styles.removeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <LocationInput label="🏁 Dropoff" value={dropoff} onChangeText={setDropoff} placeholder="Where to?" />

        {stops.length < 4 && (
          <TouchableOpacity onPress={addStop} style={styles.addStopBtn}>
            <Text style={styles.addStopTxt}>+ Add a stop</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleEstimate} style={[styles.btn, loading && styles.btnDim]} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Getting prices…' : 'See prices →'}</Text>
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
  scroll:     { flex: 1, paddingHorizontal: 16 },
  inputWrap:  { marginBottom: 12 },
  label:      { fontSize: 12, fontWeight: '600', color: COLORS.gray500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:      { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.gray900 },
  stopRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  removeBtn:  { marginBottom: 12, padding: 12, backgroundColor: COLORS.gray100, borderRadius: 10 },
  removeTxt:  { color: COLORS.danger, fontWeight: '700' },
  addStopBtn: { padding: 12, alignItems: 'center' },
  addStopTxt: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  footer:     { padding: 16 },
  btn:        { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnDim:     { opacity: 0.6 },
  btnText:    { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
