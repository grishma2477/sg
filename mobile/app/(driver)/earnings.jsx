import { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEarningsHistory, getEarningsSummary, requestPayout } from '../../api/wallet.api';
import { COLORS } from '../../constants';

const PERIODS = ['today', 'week', 'month'];
const PAYOUTS = [500, 1000, 2000, 5000];

function EarningsCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.description ?? 'Ride'}</Text>
        <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.cardAmt}>+Rs {item.driver_earnings ?? item.amount}</Text>
    </View>
  );
}

export default function DriverEarnings() {
  const qc = useQueryClient();
  const [period,     setPeriod]    = useState('today');
  const [showPayout, setShowPayout]= useState(false);
  const [amount,     setAmount]    = useState('');

  const { data: summary } = useQuery({
    queryKey: ['earnings', period],
    queryFn:  () => getEarningsSummary(period),
  });
  const { data: history } = useQuery({
    queryKey: ['earnings-history'],
    queryFn:  getEarningsHistory,
  });

  const payoutMut = useMutation({
    mutationFn: () => requestPayout({ amount: Number(amount) }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['earnings'] }); setShowPayout(false); setAmount(''); Alert.alert('Success', 'Payout requested!'); },
    onError:    (e) => Alert.alert('Error', e?.response?.data?.message || 'Payout failed'),
  });

  const s = summary?.data ?? {};
  const rides = history?.data?.rides ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <TouchableOpacity onPress={() => setShowPayout(true)} style={styles.payoutBtn}>
          <Text style={styles.payoutTxt}>Request Payout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {PERIODS.map(p => (
          <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.tab, period === p && styles.tabActive]}>
            <Text style={[styles.tabTxt, period === p && styles.tabTxtActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.grid}>
        {[
          { label: 'Net Earnings', value: `Rs ${s.net ?? 0}`,        color: COLORS.success },
          { label: 'Gross',        value: `Rs ${s.gross ?? 0}`,      color: COLORS.gray700 },
          { label: 'Rides',        value: String(s.rides ?? 0),       color: COLORS.primary },
          { label: 'Platform Fee', value: `Rs ${s.platform_fee ?? 0}`,color: COLORS.danger  },
        ].map(item => (
          <View key={item.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.historyTitle}>Ride History</Text>

      <FlatList
        data={rides}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <EarningsCard item={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No rides yet</Text>}
        contentContainerStyle={{ padding: 16, gap: 8 }}
      />

      <Modal visible={showPayout} transparent animationType="slide">
        <View style={styles.sheet}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Request Payout</Text>
            <View style={styles.presetRow}>
              {PAYOUTS.map(p => (
                <TouchableOpacity key={p} onPress={() => setAmount(String(p))} style={[styles.preset, amount === String(p) && styles.presetActive]}>
                  <Text style={[styles.presetTxt, amount === String(p) && styles.presetTxtActive]}>Rs {p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.amtInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Custom amount"
            />
            <TouchableOpacity onPress={() => payoutMut.mutate()} style={[styles.btn, payoutMut.isPending && styles.btnDim]} disabled={payoutMut.isPending || !amount}>
              <Text style={styles.btnText}>{payoutMut.isPending ? 'Processing…' : `Request Rs ${amount || '0'}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPayout(false)} style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: COLORS.gray400 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.gray50 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.white },
  title:        { fontSize: 22, fontWeight: '800', color: COLORS.gray900 },
  payoutBtn:    { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  payoutTxt:    { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  tabs:         { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  tab:          { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.gray100, alignItems: 'center' },
  tabActive:    { backgroundColor: COLORS.primary },
  tabTxt:       { fontSize: 13, color: COLORS.gray600, textTransform: 'capitalize', fontWeight: '600' },
  tabTxtActive: { color: COLORS.white },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard:     { width: '47%', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, gap: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue:    { fontSize: 22, fontWeight: '800' },
  statLabel:    { fontSize: 12, color: COLORS.gray500 },
  historyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray700, paddingHorizontal: 16, paddingTop: 4 },
  card:         { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, alignItems: 'center' },
  cardTitle:    { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  cardDate:     { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  cardAmt:      { fontSize: 16, fontWeight: '700', color: COLORS.success },
  empty:        { textAlign: 'center', color: COLORS.gray400, marginTop: 40 },
  sheet:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetCard:    { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  sheetTitle:   { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  presetRow:    { flexDirection: 'row', gap: 8 },
  preset:       { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  presetActive: { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
  presetTxt:    { fontSize: 14, color: COLORS.gray700, fontWeight: '600' },
  presetTxtActive:{ color: COLORS.primary },
  amtInput:     { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, fontSize: 16 },
  btn:          { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnDim:       { opacity: 0.6 },
  btnText:      { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
