import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { acceptBid, cancelRideRequest } from '../../../api/rides.api';
import { useSocket } from '../../../hooks/useSocket';
import { useRideStore } from '../../../store/rideStore';
import { COLORS } from '../../../constants';

function BidCard({ bid, onAccept }) {
  return (
    <View style={styles.bidCard}>
      <View style={styles.bidLeft}>
        <Text style={styles.bidDriver}>{bid.driver_name ?? 'Driver'}</Text>
        <Text style={styles.bidMeta}>⭐ {bid.rating?.toFixed(1) ?? '4.5'} · {bid.vehicle_type}</Text>
        <Text style={styles.bidEta}>🕐 ETA {bid.eta_minutes ?? '?'} min</Text>
      </View>
      <View style={styles.bidRight}>
        <Text style={styles.bidAmount}>Rs {bid.amount}</Text>
        <TouchableOpacity onPress={() => onAccept(bid.id)} style={styles.acceptBtn}>
          <Text style={styles.acceptTxt}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WaitingForBids() {
  const { requestId } = useLocalSearchParams();
  const bids       = useRideStore(s => s.bids);
  const addBid     = useRideStore(s => s.addBid);
  const clearRide  = useRideStore(s => s.clearRide);
  const setActive  = useRideStore(s => s.setActiveRide);

  const [loading, setLoading] = useState(false);
  const cancelProgress = useRef(new Animated.Value(0)).current;
  const cancelTimer    = useRef(null);

  useSocket({
    bid_placed: (data) => {
      if (String(data.request_id) === String(requestId)) addBid(data);
    },
  });

  function startCancelHold() {
    cancelProgress.setValue(0);
    cancelTimer.current = Animated.timing(cancelProgress, {
      toValue: 1, duration: 3000, useNativeDriver: false,
    });
    cancelTimer.current.start(({ finished }) => { if (finished) doCancel(); });
  }

  function stopCancelHold() {
    cancelTimer.current?.stop();
    cancelProgress.setValue(0);
  }

  async function doCancel() {
    setLoading(true);
    try {
      await cancelRideRequest(requestId);
      clearRide();
      router.replace('/(rider)/');
    } catch (_) {
      Alert.alert('Error', 'Could not cancel — try again');
    } finally { setLoading(false); }
  }

  async function handleAccept(bidId) {
    setLoading(true);
    try {
      const res = await acceptBid(bidId);
      const rideId = res?.data?.ride_id ?? res?.data?.ride?.id;
      setActive(rideId, 'confirmed');
      router.replace(`/(rider)/ride/${rideId}`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not accept bid');
      setLoading(false);
    }
  }

  const cancelWidth = cancelProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Waiting for drivers…</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map(i => <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.25 }]} />)}
        </View>
      </View>

      {bids.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Searching for nearby drivers 🔍</Text>
          <Text style={styles.emptyHint}>This usually takes less than 30 seconds</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          <Text style={styles.bidCount}>{bids.length} bid{bids.length > 1 ? 's' : ''} received</Text>
          {bids.map(b => (
            <BidCard key={b.id} bid={b} onAccept={handleAccept} />
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          onPressIn={startCancelHold}
          onPressOut={stopCancelHold}
          style={styles.cancelBtn}
          disabled={loading}
        >
          <Animated.View style={[styles.cancelProgress, { width: cancelWidth }]} />
          <Text style={styles.cancelTxt}>Hold to cancel request</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.white },
  header:        { padding: 24, alignItems: 'center', gap: 16 },
  title:         { fontSize: 22, fontWeight: '700', color: COLORS.gray900 },
  dots:          { flexDirection: 'row', gap: 6 },
  dot:           { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText:     { fontSize: 16, color: COLORS.gray700, fontWeight: '600' },
  emptyHint:     { fontSize: 13, color: COLORS.gray400 },
  scroll:        { flex: 1, padding: 16 },
  bidCount:      { fontSize: 14, color: COLORS.gray500, marginBottom: 12 },
  bidCard:       { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 14, padding: 16, marginBottom: 12, alignItems: 'center' },
  bidLeft:       { flex: 1, gap: 3 },
  bidDriver:     { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
  bidMeta:       { fontSize: 13, color: COLORS.gray500 },
  bidEta:        { fontSize: 13, color: COLORS.success },
  bidRight:      { alignItems: 'flex-end', gap: 8 },
  bidAmount:     { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  acceptBtn:     { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  acceptTxt:     { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  footer:        { padding: 16 },
  cancelBtn:     { overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 14, padding: 16, alignItems: 'center' },
  cancelProgress:{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#fee2e2' },
  cancelTxt:     { color: COLORS.danger, fontWeight: '600', fontSize: 14 },
});
