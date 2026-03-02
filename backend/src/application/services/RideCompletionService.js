// import redis from "../../infrastructure/redisClient.js";

// export class RideCompletionService {
//   async completeRide({ rideSummary }) {
//     if (rideSummary.status !== "completed") {
//       throw new Error("Ride is not completed");
//     }

//     if (!rideSummary.isPaid) {
//       throw new Error("Ride is not paid");
//     }

//     await redis.set(
//       `pending_review:${rideSummary.riderId}`,
//       rideSummary.rideId,
//       "EX",
//       60 * 60 * 24 // 24 hours
//     );

//     return {
//       rideId: rideSummary.rideId,
//       riderId: rideSummary.riderId,
//       driverId: rideSummary.driverId,
//       completedAt: rideSummary.completedAt
//     };
//   }
// }

export class RideCompletionService {

  async completeRide({ rideId }) {

    const result = await withTransaction(async (client) => {

      const ride = await RideModel.findById(rideId, client);
      if (!ride) {
        throw new AppError("RIDE_NOT_FOUND", 404);
      }

      if (ride.status !== "started") {
        throw new AppError("RIDE_NOT_IN_PROGRESS", 400);
      }

      const estimatedFare = parseFloat(ride.estimated_fare);

      // For now: final fare = estimated
      // Later we plug actual_distance logic
      const finalFare = estimatedFare;

      // 1️⃣ Update ride
      const updatedRide = await RideModel.findByIdAndUpdate(
        rideId,
        {
          status: "completed",
          completed_at: new Date(),
          final_fare: finalFare,
          is_paid: true
        },
        client
      );

      // 2️⃣ Capture escrow → Driver + Platform
      await RidePaymentService.completeRidePayment(rideId);

      return {
        ride: updatedRide,
        riderId: ride.rider_id,
        driverId: ride.driver_id
      };
    });

    notifyRideStatusChange(
      result.riderId,
      result.driverId,
      "completed",
      result.ride
    );

    return result;
  }
}