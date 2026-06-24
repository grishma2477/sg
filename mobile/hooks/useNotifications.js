import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiPost } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:        'default',
      importance:  Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:  '#4f46e5',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  try {
    await apiPost('/api/auth/register-device', {
      fcm_token:   token,
      device_type: Platform.OS,
    });
  } catch (_) {}

  return token;
}

export function useNotificationListeners({ onNotification, onResponse } = {}) {
  const notifRef   = useRef(onNotification);
  const responseRef= useRef(onResponse);
  notifRef.current    = onNotification;
  responseRef.current = onResponse;

  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(n => {
      notifRef.current?.(n);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(r => {
      responseRef.current?.(r);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);
}
