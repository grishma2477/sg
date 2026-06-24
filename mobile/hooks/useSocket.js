import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '../constants';

let sharedSocket    = null;
let appStateSub     = null;
let lastBackground  = 0; // timestamp when app went to background

async function reAuthenticate() {
  if (!sharedSocket?.connected) return;
  const t  = await SecureStore.getItemAsync('auth_token');
  const id = await SecureStore.getItemAsync('user_id');
  if (t) sharedSocket.emit('authenticate', { token: t, userId: parseInt(id) });
}

async function ensureSocket() {
  if (sharedSocket?.connected) return sharedSocket;

  const token = await SecureStore.getItemAsync('auth_token');
  if (!token) return null;

  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      transports:            ['websocket'],
      reconnection:           true,
      reconnectionAttempts:   Infinity,
      reconnectionDelay:      1000,
      reconnectionDelayMax:   10000,
      randomizationFactor:    0.3,
      auth: { token },
    });

    sharedSocket.on('connect',    reAuthenticate);
    sharedSocket.on('disconnect', (reason) => {
      // If server closed the connection deliberately, don't auto-reconnect
      if (reason === 'io server disconnect') sharedSocket.connect();
    });
  } else {
    // Update token on reconnect (may have been refreshed)
    sharedSocket.auth = { token };
    sharedSocket.connect();
  }

  // AppState: reconnect when app returns from background (handles 5-min background rule)
  if (!appStateSub) {
    appStateSub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        const backgroundDuration = Date.now() - lastBackground;
        if (sharedSocket && !sharedSocket.connected) {
          const freshToken = await SecureStore.getItemAsync('auth_token');
          if (freshToken) {
            sharedSocket.auth = { token: freshToken };
            sharedSocket.connect();
          }
        } else if (backgroundDuration > 30_000) {
          // Been in background > 30s — re-auth even if technically connected
          reAuthenticate();
        }
      } else if (nextState === 'background') {
        lastBackground = Date.now();
      }
    });
  }

  return sharedSocket;
}

export function useSocket(eventHandlers = {}) {
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    let mounted = true;

    async function connect() {
      await ensureSocket();
      if (!mounted || !sharedSocket) return;
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        sharedSocket.on(event, handler);
      });
    }

    connect();

    return () => {
      mounted = false;
      if (sharedSocket) {
        Object.keys(handlersRef.current).forEach(event => {
          sharedSocket.off(event, handlersRef.current[event]);
        });
      }
    };
  }, []);

  return sharedSocket;
}

export function emitSocket(event, data) {
  sharedSocket?.emit(event, data);
}

export function disconnectSocket() {
  sharedSocket?.disconnect();
  sharedSocket = null;
}
