import { useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPost } from '../../api/client';
import { registerForPushNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function LoginScreen() {
  const [role,       setRole]      = useState('rider');
  const [phone,      setPhone]     = useState('');
  const [step,       setStep]      = useState('phone');
  const [otp,        setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,    setLoading]   = useState(false);
  const [devOtp,     setDevOtp]    = useState(null);
  const [countdown,  setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const login = useAuthStore(s => s.login);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { Alert.alert('Enter a valid phone number'); return; }
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/send-otp', { phone: `+977${digits}`, role });
      setDevOtp(res?.data?.otp ?? null);
      setStep('otp');
      setCountdown(60);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not send OTP');
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    const code = otp.join('');
    if (code.length < 6) { Alert.alert('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await apiPost('/api/auth/verify-otp', { phone: `+977${phone.replace(/\D/g, '')}`, otp: code });
      const d = res?.data ?? res;
      await login(d);
      await registerForPushNotifications();
      router.replace(d.isNewUser ? '/(auth)/name' : (d.role === 'driver' ? '/(driver)/' : '/(rider)/'));
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  }

  function handleOtpChange(text, i) {
    const next = [...otp];
    next[i] = text.slice(-1);
    setOtp(next);
    if (text && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyPress(e, i) {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome to SG</Text>
          <Text style={styles.subtitle}>Your ride, your price</Text>

          {step === 'phone' && (
            <>
              <View style={styles.roleRow}>
                {['rider', 'driver'].map(r => (
                  <TouchableOpacity key={r} onPress={() => setRole(r)}
                    style={[styles.roleBtn, role === r && styles.roleBtnActive]}>
                    <Text style={[styles.roleLabel, role === r && styles.roleLabelActive]}>
                      {r === 'rider' ? '🛺 Rider' : '🚗 Driver'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.phoneRow}>
                <View style={styles.prefix}><Text style={styles.prefixText}>🇳🇵 +977</Text></View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98XXXXXXXX"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={sendOtp}
                />
              </View>

              <TouchableOpacity onPress={sendOtp} style={[styles.btn, loading && styles.btnDim]} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Sending…' : 'Send OTP'}</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'otp' && (
            <>
              <Text style={styles.hint}>Enter the 6-digit code sent to +977 {phone}</Text>

              {devOtp && (
                <View style={styles.devBox}>
                  <Text style={styles.devText}>Dev OTP: {devOtp}</Text>
                </View>
              )}

              <View style={styles.otpRow}>
                {otp.map((v, i) => (
                  <TextInput
                    key={i}
                    ref={r => inputRefs.current[i] = r}
                    style={[styles.otpBox, v && styles.otpBoxFilled]}
                    value={v}
                    onChangeText={t => handleOtpChange(t, i)}
                    onKeyPress={e => handleOtpKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={i === 0}
                  />
                ))}
              </View>

              <TouchableOpacity onPress={verifyOtp} style={[styles.btn, loading && styles.btnDim]} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Verifying…' : 'Verify OTP'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={countdown > 0 ? undefined : sendOtp}
                style={{ marginTop: 16, alignItems: 'center' }}
                disabled={countdown > 0}
              >
                <Text style={{ color: countdown > 0 ? COLORS.gray400 : COLORS.primary, fontSize: 14 }}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setStep('phone'); setOtp(['','','','','','']); }} style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gray500, fontSize: 13 }}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.white },
  container:      { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 20 },
  title:          { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  subtitle:       { fontSize: 16, color: COLORS.gray500, marginTop: -12 },
  roleRow:        { flexDirection: 'row', gap: 12 },
  roleBtn:        { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: COLORS.gray200, alignItems: 'center' },
  roleBtnActive:  { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
  roleLabel:      { fontSize: 15, color: COLORS.gray500, fontWeight: '600' },
  roleLabelActive:{ color: COLORS.primary },
  phoneRow:       { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 12, overflow: 'hidden' },
  prefix:         { backgroundColor: COLORS.gray50, padding: 14, justifyContent: 'center' },
  prefixText:     { fontSize: 14, color: COLORS.gray700 },
  phoneInput:     { flex: 1, padding: 14, fontSize: 16 },
  btn:            { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnDim:         { opacity: 0.6 },
  btnText:        { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  hint:           { fontSize: 14, color: COLORS.gray500, textAlign: 'center' },
  devBox:         { backgroundColor: '#fef3c7', padding: 12, borderRadius: 10 },
  devText:        { color: '#92400e', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  otpRow:         { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  otpBox:         { width: 46, height: 54, borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 10, fontSize: 22, fontWeight: '700', textAlign: 'center', color: COLORS.gray900 },
  otpBoxFilled:   { borderColor: COLORS.primary, backgroundColor: '#ede9fe' },
});
