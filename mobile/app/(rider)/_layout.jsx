import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getUnreadCount } from '../../api/notifications.api';
import { COLORS } from '../../constants';
import { useSocket } from '../../hooks/useSocket';

function TabIcon({ emoji, label, focused }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  );
}

export default function RiderTabsLayout() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then(r => setUnread(r?.data?.count ?? 0)).catch(() => {});
  }, []);

  useSocket({
    notification: () => setUnread(n => n + 1),
  });

  return (
    <Tabs
      screenOptions={{
        headerShown:       false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle:       { borderTopWidth: 1, borderTopColor: COLORS.gray100, height: 72, paddingBottom: 10 },
        tabBarLabelStyle:  { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="destination" options={{ href: null }} />
      <Tabs.Screen name="vehicles"    options={{ href: null }} />
      <Tabs.Screen name="waiting"     options={{ href: null }} />
      <Tabs.Screen name="ride"        options={{ href: null }} />
      <Tabs.Screen name="review"      options={{ href: null }} />
      <Tabs.Screen name="wallet"      options={{ title: 'Wallet',        tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Wallet" focused={focused} /> }} />
      <Tabs.Screen name="notifications" options={{
        title: 'Alerts',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Alerts" focused={focused} />,
        tabBarBadge: unread > 0 ? unread : undefined,
      }} />
      <Tabs.Screen name="profile"     options={{ title: 'Profile',       tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
      <Tabs.Screen name="settings"    options={{ title: 'Settings',      tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }} />
      <Tabs.Screen name="kyc"         options={{ href: null }} />
    </Tabs>
  );
}
