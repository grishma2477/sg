import { getIO } from "./socketServer.js";

export const notifyReviewRequired = (userId, rideId) => {
  getIO().to(userId).emit("REVIEW_REQUIRED", {
    rideId,
    message: "Please review your previous ride"
  });
};

export const notifySafetyUpdated = (driverId, points) => {
  getIO().to(driverId).emit("SAFETY_UPDATED", {
    points,
    message: "Your safety score has been updated"
  });
};
