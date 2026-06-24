import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Client sends { userId, role, driverId } to join their rooms
    socket.on("authenticate", ({ userId, role, driverId }) => {
      socket.userId = userId;
      socket.userRole = role;
      socket.driverId = driverId;

      if (userId) socket.join(`user:${userId}`);
      if (driverId) socket.join(`driver:${driverId}`);
      if (role === "admin") socket.join("admin");

      socket.emit("authenticated", { success: true });
    });

    socket.on("disconnect", () => {
      // socket.io auto-leaves rooms on disconnect
    });
  });

  return io;
};

export const getIo = () => io;

// ─── Low-level emitters ────────────────────────────────────────────────────────

export const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

export const emitToDriver = (driverId, event, data) => {
  if (io) io.to(`driver:${driverId}`).emit(event, data);
};

export const emitToRoom = (room, event, data) => {
  if (io) io.to(room).emit(event, data);
};

export const emitToAll = (event, data) => {
  if (io) io.emit(event, data);
};

// ─── Ride request lifecycle ────────────────────────────────────────────────────

// new_ride_request → nearby online drivers when rider creates request
export const broadcastRideRequest = (requestData, driverIds) => {
  driverIds.forEach((driverId) => {
    emitToDriver(driverId, "new_ride_request", requestData);
  });
};

// bid_placed → rider room when driver submits bid
export const notifyBidPlaced = (riderId, bidData) => {
  emitToUser(riderId, "bid_placed", bidData);
};

// bid_accepted → driver room when rider accepts their bid
export const notifyBidAccepted = (driverId, rideData) => {
  emitToDriver(driverId, "bid_accepted", rideData);
};

// ride_request_cancelled → drivers who bid when rider cancels
export const notifyRequestCancelled = (driverIds, requestId) => {
  driverIds.forEach((driverId) => {
    emitToDriver(driverId, "ride_request_cancelled", { requestId });
  });
};

// ─── Active ride events ────────────────────────────────────────────────────────

// driver_en_route → rider location updates during active ride
export const notifyDriverEnRoute = (riderId, locationData) => {
  emitToUser(riderId, "driver_en_route", locationData);
};

// Legacy aliases kept for existing callers
export const notifyDriverLocationUpdate = notifyDriverEnRoute;
export const notifyBidSubmitted = notifyBidPlaced;
export const notifyBidRejected = (driverId, requestId) =>
  emitToDriver(driverId, "bid_rejected", { requestId });
export const notifyRideStatusChange = (riderId, driverId, status, rideData) => {
  emitToUser(riderId, "ride:status:changed", { status, ...rideData });
  if (driverId) emitToDriver(driverId, "ride:status:changed", { status, ...rideData });
};

export { io };
