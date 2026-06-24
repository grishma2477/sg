import { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWallet, getTransactions, topUpWallet } from '../../api/wallet.api';
import { COLORS } from '../../constants';

const TX_ICON = { topup: '💳', ride: '🛺', payout: '📤', transfer: '🔄' };
const TOPUP_PRESETS = [100, 200, 500, 1000];

function TransactionItem({ tx }) {
  const isCredit = tx.type === 'topup' || tx.type === 'transfer_in';
  return (
    <View style={styles.txRow}>
      <Text style={styles.txIcon}>{TX_ICON[tx.type] ?? '💰'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.txDesc}>{tx.description}</Text>
        <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isCredit ? COLORS.success : COLORS.danger }]}>
        {isCredit ? '+' : '-'}Rs {Math.abs(tx.amount)}
      </Text>
    </View>
  );
}

export default function WalletScreen() {
  const qc = useQueryClient();
  const { data: wallet }  = useQuery({ queryKey: ['wallet'],  queryFn: getWallet });
  const { data: txData }  = useQuery({ queryKey: ['txns'],    queryFn: () => getTransactions() });

  const [showTopup, setShowTopup] = useState(false);
  const [amount,    setAmount]    = useState('');
  const [method,    setMethod]    = useState('esewa');
  const [filter,    setFilter]    = useState('all');

  const topupMut = useMutation({
    mutationFn: () => topUpWallet({ amount: Number(amount), payment_method: method }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['wallet'] }); qc.invalidateQueries({ queryKey: ['txns'] }); setShowTopup(false); setAmount(''); Alert.alert('Success', 'Wallet topped up!'); },
    onError:    (e) => Alert.alert('Error', e?.response?.data?.message || 'Top-up failed'),
  });

  const balance = wallet?.data?.balance ?? 0;
  const transactions = txData?.data?.transactions ?? [];
  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.balanceCard}>
        <Text style={styles.balLabel}>Wallet Balance</Text>
        <Text style={styles.balAmount}>Rs {Number(balance).toFixed(2)}</Text>
        <TouchableOpacity onPress={() => setShowTopup(true)} style={styles.topupBtn}>
          <Text style={styles.topupTxt}>+ Top Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['all','topup','ride','payout'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterActive]}>
            <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <TransactionItem tx={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet</Text>}
        contentContainerStyle={{ padding: 16, gap: 4 }}
      />

      <Modal visible={showTopup} transparent animationType="slide">
        <View style={styles.sheet}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Top Up Wallet</Text>

            <View style={styles.presetRow}>
              {TOPUP_PRESETS.map(p => (
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

            <View style={styles.methodRow}>
              {['esewa','khalti','bank_transfer'].map(m => (
                <TouchableOpacity key={m} onPress={() => setMethod(m)} style={[styles.method, method === m && styles.methodActive]}>
                  <Text style={[styles.methodTxt, method === m && styles.methodTxtActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => topupMut.mutate()} style={[styles.btn, topupMut.isPending && styles.btnDim]} disabled={topupMut.isPending || !amount}>
              <Text style={styles.btnText}>{topupMut.isPending ? 'Processing…' : `Top Up Rs ${amount || '0'}`}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowTopup(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.gray50 },
  balanceCard:   { backgroundColor: COLORS.primary, padding: 28, alignItems: 'center', gap: 8 },
  balLabel:      { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  balAmount:     { color: COLORS.white, fontSize: 40, fontWeight: '900' },
  topupBtn:      { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginTop: 4 },
  topupTxt:      { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  filterRow:     { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  filterChip:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.gray100 },
  filterActive:  { backgroundColor: COLORS.primary },
  filterTxt:     { fontSize: 12, color: COLORS.gray600, textTransform: 'capitalize' },
  filterTxtActive:{ color: COLORS.white, fontWeight: '600' },
  txRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  txIcon:        { fontSize: 22 },
  txDesc:        { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  txDate:        { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  txAmount:      { fontSize: 15, fontWeight: '700' },
  empty:         { textAlign: 'center', color: COLORS.gray400, marginTop: 40 },
  sheet:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetCard:     { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  sheetTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  presetRow:     { flexDirection: 'row', gap: 8 },
  preset:        { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  presetActive:  { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
  presetTxt:     { fontSize: 14, color: COLORS.gray700, fontWeight: '600' },
  presetTxtActive:{ color: COLORS.primary },
  amtInput:      { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 14, fontSize: 16 },
  methodRow:     { flexDirection: 'row', gap: 8 },
  method:        { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.gray200, alignItems: 'center' },
  methodActive:  { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
  methodTxt:     { fontSize: 12, color: COLORS.gray500 },
  methodTxtActive:{ color: COLORS.primary, fontWeight: '600' },
  btn:           { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnDim:        { opacity: 0.6 },
  btnText:       { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  cancelBtn:     { alignItems: 'center', padding: 8 },
  cancelTxt:     { color: COLORS.gray400, fontSize: 14 },
});
