// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';

// const SocketContext = createContext(null);

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return context;
// };

// export const SocketProvider = ({ children, auth }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [driverId, setDriverId] = useState(null);
//   const socketRef = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const maxReconnectAttempts = 5;

//   useEffect(() => {
//     // Don't create socket if no auth or socket already exists
//     if (!auth || !auth.user || !auth.user.id || socketRef.current) {
//       return;
//     }

//     console.log('🔌 Initializing Socket.IO connection...');
//     console.log('User ID:', auth.user.id);
//     console.log('Role:', auth.user.role);

//     // Create socket with reconnection settings
//     const newSocket = io('http://localhost:5000', {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: maxReconnectAttempts,
//       timeout: 20000,
//       autoConnect: true
//     });

//     socketRef.current = newSocket;

//     // Connection event handlers
//     newSocket.on('connect', async () => {
//       console.log('✅ Socket connected:', newSocket.id);
//       setIsConnected(true);
//       reconnectAttempts.current = 0;

//       // Fetch driver ID if user is a driver
//       let fetchedDriverId = null;
//       if (auth.user.role === 'driver') {
//         try {
//           console.log('🔍 Fetching driver database ID...');
          
//           // Try to get from auth first (if already stored)
//           if (auth.driverId) {
//             fetchedDriverId = auth.driverId;
//             console.log('✅ Driver ID from auth:', fetchedDriverId);
//           } else {
//             // Fetch from API
//             const response = await fetch('http://localhost:5000/api/drivers/profile', {
//               headers: {
//                 'Authorization': `Bearer ${auth.token}`
//               }
//             });
            
//             if (response.ok) {
//               const data = await response.json();
//               fetchedDriverId = data.data?.id;
//               console.log('✅ Driver database ID fetched from API:', fetchedDriverId);
//             } else {
//               console.error('⚠️ Failed to fetch driver profile:', response.status);
//             }
//           }
          
//           setDriverId(fetchedDriverId);
//         } catch (error) {
//           console.error('⚠️ Failed to fetch driver ID:', error);
//         }
//       }

//       // Authenticate the socket
//       console.log('📤 Authenticating socket...');
//       console.log('   User ID:', auth.user.id);
//       console.log('   Role:', auth.user.role);
//       console.log('   Driver ID:', fetchedDriverId);
      
//       newSocket.emit('authenticate', {
//         userId: auth.user.id,
//         role: auth.user.role,
//         driverId: fetchedDriverId
//       });

//       console.log('🔐 Authentication data sent to server');
//     });

//     newSocket.on('authenticated', (data) => {
//       console.log('✅ Server confirmed authentication:', data);
//     });

//     newSocket.on('disconnect', (reason) => {
//       console.log('❌ Socket disconnected:', reason);
//       setIsConnected(false);

//       if (reason === 'io server disconnect') {
//         // Server disconnected, manually reconnect
//         console.log('🔄 Server disconnected, attempting to reconnect...');
//         newSocket.connect();
//       }
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('❌ Connection error:', error.message);
//       reconnectAttempts.current++;
      
//       if (reconnectAttempts.current >= maxReconnectAttempts) {
//         console.error('❌ Max reconnection attempts reached');
//       }
//     });

//     newSocket.on('reconnect', (attemptNumber) => {
//       console.log(`✅ Reconnected after ${attemptNumber} attempts`);
//       reconnectAttempts.current = 0;
//     });

//     newSocket.on('reconnect_attempt', (attemptNumber) => {
//       console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
//     });

//     newSocket.on('reconnect_error', (error) => {
//       console.error('❌ Reconnection error:', error.message);
//     });

//     newSocket.on('reconnect_failed', () => {
//       console.error('❌ Reconnection failed after max attempts');
//     });

//     // Heartbeat to keep connection alive
//     const heartbeatInterval = setInterval(() => {
//       if (newSocket.connected) {
//         newSocket.emit('heartbeat');
//       }
//     }, 30000); // Every 30 seconds

//     setSocket(newSocket);

//     // Cleanup on unmount
//     return () => {
//       console.log('🧹 Cleaning up socket connection...');
//       clearInterval(heartbeatInterval);
      
//       if (socketRef.current) {
//         socketRef.current.removeAllListeners();
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [auth]); // Re-run if auth changes

//   const value = {
//     socket,
//     isConnected,
//     driverId
//   };

//   return (
//     <SocketContext.Provider value={value}>
//       {children}
//     </SocketContext.Provider>
//   );
// };



// >> new code from gpt to fix lets test it upper code was working fine

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../api/apiClient";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children, auth }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!auth?.token || !auth?.userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return undefined;
    }

    const nextSocket = io(SOCKET_URL, {
      auth: { token: auth.token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socketRef.current = nextSocket;
    setSocket(nextSocket);

    nextSocket.on("connect", () => {
      setIsConnected(true);
      nextSocket.emit("authenticate", {
        userId: auth.userId,
        role: auth.userRole,
        driverId: auth.driverId || null,
      });
    });

    nextSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    nextSocket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
    });

    return () => {
      nextSocket.removeAllListeners();
      nextSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [auth?.token, auth?.userId, auth?.userRole, auth?.driverId]);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      driverId: auth?.driverId || null,
    }),
    [socket, isConnected, auth?.driverId],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
