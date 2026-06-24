import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications.api';
import { useSocket } from '../../hooks/useSocket';
import { Bell, Check } from 'lucide-react';

const TYPE_ICONS = {
  ride: '🛵', payment: '💰', kyc: '🪪', safety: '🛡️',
  badge: '🏆', default: '🔔',
};

function NotifRow({ notif, onRead }) {
  const icon  = TYPE_ICONS[notif.type] ?? TYPE_ICONS.default;
  const unread = !notif.read_at;

  return (
    <button
      onClick={() => unread && onRead(notif.id)}
      className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 text-left transition-colors ${
        unread ? 'bg-indigo-50' : 'bg-white'
      }`}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${unread ? 'text-gray-900' : 'text-gray-600'}`}>
            {notif.title}
          </p>
          {unread && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-xs text-gray-300 mt-1">
          {new Date(notif.created_at).toLocaleString()}
        </p>
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const [notifs, setNotifs]     = useState([]);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [loading, setLoading]   = useState(false);

  const loadNotifs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getNotifications(p, 20);
      const items  = res?.data?.notifications ?? [];
      const pag    = res?.data?.pagination;
      setNotifs(prev => p === 1 ? items : [...prev, ...items]);
      setHasMore(pag ? p < pag.totalPages : false);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadNotifs(1); }, []);

  // Live notifications via socket
  useSocket({
    notification: (notif) => {
      setNotifs(prev => [notif, ...prev]);
      toast(notif.title, { icon: TYPE_ICONS[notif.type] ?? '🔔' });
    },
  });

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      toast.success('All marked as read');
    } catch {}
  };

  const unreadCount = notifs.filter(n => !n.read_at).length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" />
          <h2 className="font-bold text-base">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifs.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell size={40} strokeWidth={1} />
            <p className="text-sm mt-3">No notifications yet</p>
          </div>
        ) : (
          <>
            {notifs.map(n => <NotifRow key={n.id} notif={n} onRead={handleRead} />)}
            {hasMore && (
              <button
                onClick={() => loadNotifs(page + 1)}
                disabled={loading}
                className="w-full py-3 text-xs text-indigo-600 font-medium"
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
