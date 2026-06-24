import * as Sentry from '@sentry/react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';

Sentry.init({
  dsn:              process.env.EXPO_PUBLIC_SENTRY_DSN,  // TODO: set EXPO_PUBLIC_SENTRY_DSN in mobile/.env
  environment:      process.env.NODE_ENV || 'development',
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  enabled:          !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const hydrate = useAuthStore(s => s.hydrate);

  useEffect(() => {
    hydrate().finally(() => {
      setReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
