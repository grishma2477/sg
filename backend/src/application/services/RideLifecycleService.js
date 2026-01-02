// import RideModel from "../../models/ride/Ride.js";
// import redis from "../../infrastructure/redisClient.js";

// export class RideLifecycleService {
//   async createRide({ riderId, driverId }) {
//     return RideModel.create({
//       rider_id: riderId,
//       driver_id: driverId,
//       status: "created",
//       is_paid: false
//     });
//   }

//   async startRide({ rideId }) {
//     return RideModel.findByIdAndUpdate(rideId, {
//       status: "started"
//     });
//   }

//   async completeRide({ rideId }) {
//     const ride = await RideModel.findById(rideId);

//     if (!ride) throw new Error("Ride not found");
//     if (ride.status !== "started") {
//       throw new Error("Ride must be started before completion");
//     }

//     const updated = await RideModel.findByIdAndUpdate(rideId, {
//       status: "completed",
//       is_paid: true
//     });

//     // 🔒 Enforce mandatory review for BOTH parties
//     await redis.set(`pending_review:${ride.rider_id}`, rideId);
//     await redis.set(`pending_review:${ride.driver_id}`, rideId);

//     return updated;
//   }
// }



import RideModel from "../../models/ride/Ride.js";
import DriverModel from "../../models/driver/Driver.js";
import redis from "../../infrastructure/redisClient.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Ride Lifecycle Service
 * 
 * Manages ride state transitions: created → started → completed
 */
export class RideLifecycleService {
  /**
   * Create a new ride
   * 
   * @param {string} riderId - User ID of the rider
   * @param {string} driverId - Driver record ID (from drivers table)
   */
  async createRide({ riderId, driverId }) {
    // Validate driver exists
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      throw new AppError("DRIVER_NOT_FOUND", 404);
    }

    return RideModel.create({
      rider_id: riderId,
      driver_id: driverId,
      status: "requested",
      requested_at: new Date()
    });
  }

  /**
   * Start a ride (driver accepts and begins)
   */
  async startRide({ rideId }) {
    const ride = await RideModel.findById(rideId);

    if (!ride) {
      throw new AppError("RIDE_NOT_FOUND", 404);
    }

    if (ride.status !== "requested" && ride.status !== "accepted") {
      throw new AppError("RIDE_CANNOT_BE_STARTED", 400, {
        currentStatus: ride.status
      });
    }

    return RideModel.findByIdAndUpdate(rideId, {
      status: "started",
      started_at: new Date()
    });
  }

  /**
   * Complete a ride
   * 
   * This triggers the mandatory review flow for both parties.
   */
  async completeRide({ rideId }) {
    const ride = await RideModel.findById(rideId);

    if (!ride) {
      throw new AppError("RIDE_NOT_FOUND", 404);
    }

    if (ride.status !== "started") {
      throw new AppError("RIDE_MUST_BE_STARTED_BEFORE_COMPLETION", 400, {
        currentStatus: ride.status
      });
    }

    // Get the driver to find their user_id
    const driver = await DriverModel.findById(ride.driver_id);
    if (!driver) {
      throw new AppError("DRIVER_NOT_FOUND", 404);
    }

    // Complete the ride
    const updated = await RideModel.findByIdAndUpdate(rideId, {
      status: "completed",
      completed_at: new Date()
    });

    // ═══════════════════════════════════════════════════
    // SET PENDING REVIEW FLAGS IN REDIS
    // Both rider and driver must submit reviews
    // ═══════════════════════════════════════════════════
    
    // Rider's pending review (keyed by rider's user_id)
    await redis.set(
      `pending_review:${ride.rider_id}`,
      rideId,
      "EX",
      60 * 60 * 24 * 7  // Expires in 7 days
    );

    // Driver's pending review (keyed by driver's user_id)
    await redis.set(
      `pending_review:${driver.user_id}`,
      rideId,
      "EX",
      60 * 60 * 24 * 7  // Expires in 7 days
    );

    console.log("🔒 Pending reviews set for:", {
      riderId: ride.rider_id,
      driverUserId: driver.user_id
    });

    return updated;
  }

  /**
   * Get ride details with driver info
   */
  async getRideWithDriver(rideId) {
    const ride = await RideModel.findById(rideId);
    if (!ride) return null;

    const driver = await DriverModel.findById(ride.driver_id);
    
    return {
      ...ride,
      driverUserId: driver?.user_id
    };
  }
}