import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { apiPost } from '../../api/client';
import { disconnectSocket } from '../../hooks/useSocket';
import { stopBackgroundLocation } from '../../tasks/locationTask';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

const PRIVACY_URL = 'https://sawagaadi.com/privacy';
const TERMS_URL   = 'https://sawagaadi.com/terms';
const SUPPORT_EMAIL = 'help@sawagaadi.com';

function SettingsItem({ icon, label, onPress, danger, detail }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.7}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        {detail && <Text style={styles.itemDetail}>{detail}</Text>}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const role   = useAuthStore(s => s.role);
  const logout = useAuthStore(s => s.logout);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  function openURL(url) {
    Linking.openURL(url).catch(() => Alert.alert('Could not open link'));
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and all ride history. This cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await apiPost('/api/auth/delete-account');
              if (role === 'driver') await stopBackgroundLocation();
              disconnectSocket();
              await logout();
              router.replace('/(auth)/');
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.message || 'Could not delete account. Contact support.');
            }
          },
        },
      ]
    );
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try { await apiPost('/api/auth/logout'); } catch (_) {}
          if (role === 'driver') await stopBackgroundLocation();
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
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <SettingsGroup title="Legal">
          <SettingsItem icon="🔒" label="Privacy Policy"  onPress={() => openURL(PRIVACY_URL)} />
          <SettingsItem icon="📄" label="Terms of Service" onPress={() => openURL(TERMS_URL)} />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsItem icon="💬" label="Help & Support" onPress={() => openURL(`mailto:${SUPPORT_EMAIL}`)} detail={SUPPORT_EMAIL} />
          <SettingsItem icon="⭐" label="Rate the App" onPress={() => Alert.alert('Coming soon', 'We\'ll open the app store page here.')} />
        </SettingsGroup>

        <SettingsGroup title="Notifications">
          <SettingsItem icon="🔔" label="Notification Preferences" onPress={() => Linking.openSettings()} detail="Manage in phone settings" />
        </SettingsGroup>

        <SettingsGroup title="Account">
          <SettingsItem icon="🚪" label="Sign Out" onPress={handleLogout} />
          <SettingsItem icon="🗑️" label="Delete Account" onPress={handleDeleteAccount} danger />
        </SettingsGroup>

        <Text style={styles.version}>SG v{appVersion}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.gray50 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  back:        { fontSize: 16, color: COLORS.primary },
  title:       { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  scroll:      { flex: 1 },
  group:       { marginTop: 20, paddingHorizontal: 16 },
  groupTitle:  { fontSize: 12, fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  groupCard:   { backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden' },
  item:        { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  itemIcon:    { fontSize: 20, width: 32 },
  itemLabel:   { fontSize: 15, color: COLORS.gray900 },
  itemDetail:  { fontSize: 12, color: COLORS.gray400, marginTop: 1 },
  arrow:       { fontSize: 18, color: COLORS.gray300 },
  version:     { textAlign: 'center', color: COLORS.gray300, fontSize: 12, marginTop: 28, marginBottom: 40 },
});
