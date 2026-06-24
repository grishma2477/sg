import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export function useNetworkStatus() {
  const [isOnline, setIsOnline]       = useState(true);
  const [justReconnected, setJustBack]= useState(false);
  const wasOffline = useRef(false);

  async function check() {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/health`,
        { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(4000) }
      );
      const online = res.ok;
      if (!online && isOnline)    setIsOnline(false);
      if (online  && !isOnline) { setIsOnline(true); setJustBack(true); setTimeout(() => setJustBack(false), 2500); }
      wasOffline.current = !online;
    } catch {
      if (isOnline) setIsOnline(false);
      wasOffline.current = true;
    }
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, 8000);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });

    return () => { clearInterval(interval); sub.remove(); };
  }, [isOnline]);

  return { isOnline, justReconnected };
}
