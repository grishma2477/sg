import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPost } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function NameEntryScreen() {
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const role      = useAuthStore(s => s.role);
  const setStoredName = useAuthStore(s => s.setName);

  async function submit() {
    if (!name.trim()) { Alert.alert('Please enter your name'); return; }
    setLoading(true);
    try {
      await apiPost('/api/auth/profile', { name: name.trim() });
      await setStoredName(name.trim());
      router.replace(role === 'driver' ? '/(driver)/' : '/(rider)/');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not save name');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.sub}>We'll use this on your profile and receipts</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <TouchableOpacity onPress={submit} style={[styles.btn, loading && styles.btnDim]} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Saving…' : 'Continue →'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  emoji:     { fontSize: 52, textAlign: 'center' },
  title:     { fontSize: 28, fontWeight: '800', color: COLORS.gray900, textAlign: 'center' },
  sub:       { fontSize: 15, color: COLORS.gray500, textAlign: 'center', marginTop: -8 },
  input:     { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, padding: 16, fontSize: 18, marginTop: 8 },
  btn:       { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnDim:    { opacity: 0.6 },
  btnText:   { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
