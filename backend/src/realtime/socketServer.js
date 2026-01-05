import { Server } from "socket.io";

let io;
const connectedUsers = new Map(); // userId -> socketId
const connectedDrivers = new Map(); // driverId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // User authentication
    socket.on("authenticate", ({ userId, role, driverId }) => {
      socket.userId = userId;
      socket.userRole = role;
      socket.driverId = driverId;

      connectedUsers.set(userId, socket.id);
      if (driverId) {
        connectedDrivers.set(driverId, socket.id);
      }

      socket.join(`user:${userId}`);
      if (driverId) {
        socket.join(`driver:${driverId}`);
      }

      console.log(`🔐 User authenticated: ${userId} (${role})`);
    });

    // Driver location update
    socket.on("driver:location:update", ({ driverId, location }) => {
      io.emit("driver:location:changed", { driverId, location });
    });

    // Driver online status
    socket.on("driver:status:update", ({ driverId, isOnline, isAvailable }) => {
      io.emit("driver:status:changed", { driverId, isOnline, isAvailable });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
      if (socket.driverId) {
        connectedDrivers.delete(socket.driverId);
      }
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Emit functions
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToDriver = (driverId, event, data) => {
  if (io) {
    io.to(`driver:${driverId}`).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Ride request events
export const broadcastRideRequest = (requestData, eligibleDriverIds) => {
  eligibleDriverIds.forEach(driverId => {
    emitToDriver(driverId, "ride:request:new", requestData);
  });
};

export const notifyBidSubmitted = (riderId, bidData) => {
  emitToUser(riderId, "ride:bid:new", bidData);
};

export const notifyBidAccepted = (driverId, rideData) => {
  emitToDriver(driverId, "ride:bid:accepted", rideData);
};

export const notifyBidRejected = (driverId, requestId) => {
  emitToDriver(driverId, "ride:bid:rejected", { requestId });
};

export const notifyRideStatusChange = (riderId, driverId, status, rideData) => {
  emitToUser(riderId, "ride:status:changed", { status, ...rideData });
  if (driverId) {
    emitToDriver(driverId, "ride:status:changed", { status, ...rideData });
  }
};

export const notifyDriverLocationUpdate = (riderId, location) => {
  emitToUser(riderId, "driver:location:update", location);
};

export { io };


// import { Server } from "socket.io";

// let io = null;

// export const initSocket = (httpServer) => {
//   io = new Server(httpServer, {
//     cors: { origin: "*" }
//   });

//   io.on("connection", (socket) => {
//     const { userId } = socket.handshake.query;
//     if (userId) {
//       socket.join(userId); 
//     }
//   });
// };

// export const getIO = () => {
//   if (!io) throw new Error("Socket.io not initialized");
//   return io;
// };
