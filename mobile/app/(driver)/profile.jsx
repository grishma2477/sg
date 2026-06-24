import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiPost } from '../../api/client';
import { disconnectSocket } from '../../hooks/useSocket';
import { stopBackgroundLocation } from '../../tasks/locationTask';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function DriverProfileScreen() {
  const name   = useAuthStore(s => s.name);
  const logout = useAuthStore(s => s.logout);

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try { await apiPost('/api/auth/logout'); } catch (_) {}
          await stopBackgroundLocation();
          disconnectSocket();
          await logout();
          router.replace('/(auth)/');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarEmoji}>🧑‍✈️</Text></View>
        <Text style={styles.name}>{name ?? 'Driver'}</Text>
        <Text style={styles.role}>Driver</Text>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="🪪"  label="KYC Verification"    onPress={() => {}} />
        <MenuItem icon="🚗"  label="Vehicle Details"      onPress={() => {}} />
        <MenuItem icon="💳"  label="Bank Account / Payout" onPress={() => {}} />
        <MenuItem icon="🛡️"  label="Safety Score"         onPress={() => {}} />
        <MenuItem icon="📋"  label="Driver Application"   onPress={() => {}} />
        <MenuItem icon="🔔"  label="Notification Settings" onPress={() => {}} />
        <MenuItem icon="❓"  label="Help & Support"       onPress={() => {}} />
        <MenuItem icon="🚪"  label="Sign Out"             onPress={handleLogout} danger />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.gray50 },
  header:     { backgroundColor: COLORS.white, padding: 24, alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:{ fontSize: 36 },
  name:       { fontSize: 22, fontWeight: '800', color: COLORS.gray900 },
  role:       { fontSize: 13, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 1 },
  menu:       { margin: 16, backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  menuItem:   { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuIcon:   { fontSize: 22, width: 34 },
  menuLabel:  { flex: 1, fontSize: 15, color: COLORS.gray900 },
  arrow:      { fontSize: 20, color: COLORS.gray300 },
});
