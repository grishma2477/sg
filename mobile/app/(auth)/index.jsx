import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';

export default function SplashScreen() {
  const token = useAuthStore(s => s.token);
  const role  = useAuthStore(s => s.role);

  useEffect(() => {
    const t = setTimeout(() => {
      if (token) {
        router.replace(role === 'driver' ? '/(driver)/' : '/(rider)/');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.sg}>SG</Text>
        <Text style={styles.tagline}>Sawa Gaadi</Text>
      </View>
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', gap: 32 },
  logo:      { alignItems: 'center', gap: 8 },
  sg:        { fontSize: 64, fontWeight: '900', color: COLORS.white, letterSpacing: -2 },
  tagline:   { fontSize: 18, color: 'rgba(255,255,255,0.75)', letterSpacing: 2 },
  dots:      { flexDirection: 'row', gap: 8 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white },
});
