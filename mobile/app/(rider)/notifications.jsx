import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllAsRead, markAsRead } from '../../api/notifications.api';
import { useSocket } from '../../hooks/useSocket';
import { COLORS } from '../../constants';

function NotifItem({ item, onRead }) {
  return (
    <TouchableOpacity onPress={() => onRead(item.id)} style={[styles.item, !item.read_at && styles.unread]}>
      {!item.read_at && <View style={styles.dot} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title ?? 'Notification'}</Text>
        <Text style={styles.body}  numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const qc = useQueryClient();
  const [items, setItems] = useState([]);
  const { data, isFetching } = useQuery({
    queryKey: ['notifications'],
    queryFn:  getNotifications,
    onSuccess:(r) => setItems(r?.data?.notifications ?? []),
  });

  const readMut = useMutation({
    mutationFn: markAsRead,
    onSuccess:  (_, id) => {
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    },
  });

  const readAllMut = useMutation({
    mutationFn: markAllAsRead,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['notifications'] }); setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() }))); },
  });

  useSocket({
    notification: (n) => setItems(prev => [n, ...prev]),
  });

  const unread = items.filter(n => !n.read_at).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications {unread > 0 ? `(${unread})` : ''}</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={() => readAllMut.mutate()} disabled={readAllMut.isPending}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <NotifItem item={item} onRead={id => readMut.mutate(id)} />}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
        refreshing={isFetching}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['notifications'] })}
        contentContainerStyle={{ padding: 16, gap: 6 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.gray50 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  title:     { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  markAll:   { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  item:      { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  unread:    { backgroundColor: '#f5f3ff' },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 5 },
  body:      { fontSize: 13, color: COLORS.gray600, marginTop: 2 },
  time:      { fontSize: 11, color: COLORS.gray400, marginTop: 4 },
  empty:     { textAlign: 'center', color: COLORS.gray400, marginTop: 40 },
});
