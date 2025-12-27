import redis from "../../infrastructure/redisClient.js";

export class RideCompletionService {
  async completeRide({ rideSummary }) {
    if (rideSummary.status !== "completed") {
      throw new Error("Ride is not completed");
    }

    if (!rideSummary.isPaid) {
      throw new Error("Ride is not paid");
    }

    await redis.set(
      `pending_review:${rideSummary.riderId}`,
      rideSummary.rideId,
      "EX",
      60 * 60 * 24 // 24 hours
    );

    return {
      rideId: rideSummary.rideId,
      riderId: rideSummary.riderId,
      driverId: rideSummary.driverId,
      completedAt: rideSummary.completedAt
    };
  }
}
