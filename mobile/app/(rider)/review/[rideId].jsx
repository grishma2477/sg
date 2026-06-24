import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from '../../../components/StarRating';
import TapChips from '../../../components/TapChips';
import { submitReview } from '../../../api/rides.api';
import { useRideStore } from '../../../store/rideStore';
import { COLORS, NEGATIVE_TAPS, POSITIVE_TAPS } from '../../../constants';

export default function RideReview() {
  const { rideId }   = useLocalSearchParams();
  const rideDetails  = useRideStore(s => s.rideDetails);
  const clearRide    = useRideStore(s => s.clearRide);
  const clearDest    = useRideStore(s => s.clearDestination);

  const [stars,      setStars]    = useState(0);
  const [taps,       setTaps]     = useState([]);
  const [safety,     setSafety]   = useState(false);
  const [comment,    setComment]  = useState('');
  const [loading,    setLoading]  = useState(false);

  function toggleTap(key) {
    setTaps(t => t.includes(key) ? t.filter(k => k !== key) : [...t, key]);
  }

  async function submit() {
    if (stars === 0) { Alert.alert('Rate your experience first'); return; }
    setLoading(true);
    try {
      await submitReview(rideId, {
        rating:         stars,
        tags:           taps,
        safety_concern: safety,
        comment:        comment.trim() || undefined,
      });
      clearRide();
      clearDest();
      router.replace('/(rider)/');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not submit review');
      setLoading(false);
    }
  }

  const chips = stars >= 4 ? POSITIVE_TAPS : NEGATIVE_TAPS;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.fareCard}>
          <Text style={styles.fareLabel}>Total fare</Text>
          <Text style={styles.fareAmount}>Rs {rideDetails?.fare ?? '—'}</Text>
          <Text style={styles.paidNote}>Paid from wallet</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your ride?</Text>
          <StarRating value={stars} onChange={setStars} size={42} />
        </View>

        {stars > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{stars >= 4 ? 'What went well?' : 'What went wrong?'}</Text>
            <TapChips chips={chips} selected={taps} onToggle={toggleTap} />
          </View>
        )}

        {stars > 0 && stars <= 3 && (
          <View style={styles.safetyRow}>
            <Text style={styles.safetyLabel}>🚨 Report safety concern</Text>
            <Switch value={safety} onValueChange={setSafety} trackColor={{ true: COLORS.danger }} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a comment (optional)</Text>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={3}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us more…"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity onPress={submit} style={[styles.btn, (loading || stars === 0) && styles.btnDim]} disabled={loading || stars === 0}>
          <Text style={styles.btnText}>{loading ? 'Submitting…' : 'Submit Review'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { clearRide(); clearDest(); router.replace('/(rider)/'); }} style={styles.skipBtn}>
          <Text style={styles.skipTxt}>Skip</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.white },
  container:    { padding: 20, gap: 20 },
  fareCard:     { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, alignItems: 'center', gap: 4 },
  fareLabel:    { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  fareAmount:   { color: COLORS.white, fontSize: 36, fontWeight: '900' },
  paidNote:     { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  section:      { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  safetyRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2', borderRadius: 12, padding: 14 },
  safetyLabel:  { fontSize: 14, color: COLORS.danger, fontWeight: '600' },
  textarea:     { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, fontSize: 14, minHeight: 80, color: COLORS.gray900 },
  btn:          { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnDim:       { opacity: 0.5 },
  btnText:      { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  skipBtn:      { alignItems: 'center', padding: 8 },
  skipTxt:      { color: COLORS.gray400, fontSize: 14 },
});
