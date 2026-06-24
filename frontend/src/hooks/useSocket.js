import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

let sharedSocket = null;

export function useSocket(eventHandlers = {}) {
  const { token, userId, role, driverId } = useAuthStore();
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    if (!token || !userId) return;

    if (!sharedSocket) {
      sharedSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      });

      sharedSocket.on('connect', () => {
        sharedSocket.emit('authenticate', { userId, role, driverId });
      });

      sharedSocket.on('disconnect', () => {
        console.log('[socket] disconnected');
      });
    }

    const socket = sharedSocket;

    // Register event handlers
    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [token, userId, role, driverId]);

  return sharedSocket;
}

export function disconnectSocket() {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
}

export function getSocket() {
  return sharedSocket;
}
