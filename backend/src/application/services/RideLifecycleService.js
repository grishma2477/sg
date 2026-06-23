


// import RideModel from "../../models/ride/Ride.js";
// import DriverModel from "../../models/driver/Driver.js";
// import redis from "../../infrastructure/redisClient.js";
// import { AppError } from "../../utils/AppError.js";

// /**
//  * Ride Lifecycle Service
//  * 
//  * Manages ride state transitions: created → started → completed
//  */
// export class RideLifecycleService {
//   /**
//    * Create a new ride
//    * 
//    * @param {string} riderId - User ID of the rider
//    * @param {string} driverId - Driver record ID (from drivers table)
//    */
//   async createRide({ riderId, driverId }) {
//     // Validate driver exists
//     const driver = await DriverModel.findById(driverId);
//     if (!driver) {
//       throw new AppError("DRIVER_NOT_FOUND", 404);
//     }

//     return RideModel.create({
//       rider_id: riderId,
//       driver_id: driverId,
//       status: "requested",
//       requested_at: new Date()
//     });
//   }

//   /**
//    * Start a ride (driver accepts and begins)
//    */
//   async startRide({ rideId }) {
//     const ride = await RideModel.findById(rideId);

//     if (!ride) {
//       throw new AppError("RIDE_NOT_FOUND", 404);
//     }

//     if (ride.status !== "requested" && ride.status !== "accepted") {
//       throw new AppError("RIDE_CANNOT_BE_STARTED", 400, {
//         currentStatus: ride.status
//       });
//     }

//     return RideModel.findByIdAndUpdate(rideId, {
//       status: "started",
//       started_at: new Date()
//     });
//   }

//   /**
//    * Complete a ride
//    * 
//    * This triggers the mandatory review flow for both parties.
//    */
//   // async completeRide({ rideId }) {
//   //   const ride = await RideModel.findById(rideId);

//   //   if (!ride) {
//   //     throw new AppError("RIDE_NOT_FOUND", 404);
//   //   }

//   //   if (ride.status !== "started") {
//   //     throw new AppError("RIDE_MUST_BE_STARTED_BEFORE_COMPLETION", 400, {
//   //       currentStatus: ride.status
//   //     });
//   //   }

//   //   // Get the driver to find their user_id
//   //   const driver = await DriverModel.findById(ride.driver_id);
//   //   if (!driver) {
//   //     throw new AppError("DRIVER_NOT_FOUND", 404);
//   //   }

//   //   // Complete the ride
//   //   const updated = await RideModel.findByIdAndUpdate(rideId, {
//   //     status: "completed",
//   //     completed_at: new Date()
//   //   });

//   //   // ═══════════════════════════════════════════════════
//   //   // SET PENDING REVIEW FLAGS IN REDIS
//   //   // Both rider and driver must submit reviews
//   //   // ═══════════════════════════════════════════════════
    
//   //   // Rider's pending review (keyed by rider's user_id)
//   //   await redis.set(
//   //     `pending_review:${ride.rider_id}`,
//   //     rideId,
//   //     "EX",
//   //     60 * 60 * 24 * 7  // Expires in 7 days
//   //   );

//   //   // Driver's pending review (keyed by driver's user_id)
//   //   await redis.set(
//   //     `pending_review:${driver.user_id}`,
//   //     rideId,
//   //     "EX",
//   //     60 * 60 * 24 * 7  // Expires in 7 days
//   //   );

//   //   console.log("🔒 Pending reviews set for:", {
//   //     riderId: ride.rider_id,
//   //     driverUserId: driver.user_id
//   //   });

//   //   return updated;
//   // }

//   async completeRide({ rideId }) {
//   const ride = await RideModel.findById(rideId);

//   if (!ride) {
//     throw new AppError("RIDE_NOT_FOUND", 404);
//   }

//   if (ride.status !== "started") {
//     throw new AppError("RIDE_MUST_BE_STARTED_BEFORE_COMPLETION", 400, {
//       currentStatus: ride.status
//     });
//   }

//   return RideModel.findByIdAndUpdate(rideId, {
//     status: "completed",
//     completed_at: new Date()
//   });
// }

//   /**
//    * Get ride details with driver info
//    */
//   async getRideWithDriver(rideId) {
//     const ride = await RideModel.findById(rideId);
//     if (!ride) return null;

//     const driver = await DriverModel.findById(ride.driver_id);
    
//     return {
//       ...ride,
//       driverUserId: driver?.user_id
//     };
//   }
// }


import RideModel from "../../models/ride/Ride.js";
import DriverModel from "../../models/driver/Driver.js";
import redis from "../../infrastructure/redisClient.js";
import { AppError } from "../../utils/AppError.js";
import { LedgerService } from "./LedgerService.js";
import RideRequestModel from "../../models/ride/RideRequest.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";

/**
 * Ride Lifecycle Service
 *
 * Handles ride state transitions AND payment settlement.
 */

export class RideLifecycleService {

  /**
   * Create ride when driver accepts request
   */
  async createRide({ riderId, driverId, rideRequestId }) {

    const driver = await DriverModel.findById(driverId);

    if (!driver) {
      throw new AppError("DRIVER_NOT_FOUND", 404);
    }

    const rideRequest = await RideRequestModel.findById(rideRequestId);

    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }

    return RideModel.create({
      rider_id: riderId,
      driver_id: driverId,
      ride_request_id: rideRequestId,
      status: "accepted",
      requested_at: new Date()
    });

  }

  /**
   * Driver starts ride
   */
  async startRide({ rideId }) {

    const ride = await RideModel.findById(rideId);

    if (!ride) {
      throw new AppError("RIDE_NOT_FOUND", 404);
    }

    if (ride.status !== "accepted") {
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
   * Complete ride → settle escrow
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

    const driver = await DriverModel.findById(ride.driver_id);

    if (!driver) {
      throw new AppError("DRIVER_NOT_FOUND", 404);
    }

    const rideRequest = await RideRequestModel.findById(ride.ride_request_id);

    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }

    const totalAmount = rideRequest.estimated_total;
    const platformFee = rideRequest.platform_fee;

    // 🔐 Escrow → Driver + Platform
    // await LedgerService.settlePayment({
    //   rideId,
    //   driverId: ride.driver_id,
    //   totalAmount,
    //   platformFee
    // });

    const updated = await RideModel.findByIdAndUpdate(rideId, {
      status: "completed",
      completed_at: new Date()
    });

    // Set pending reviews

    await redis.set(
      `pending_review:${ride.rider_id}`,
      rideId,
      "EX",
      60 * 60 * 24 * 7
    );

    await redis.set(
      `pending_review:${driver.user_id}`,
      rideId,
      "EX",
      60 * 60 * 24 * 7
    );

    console.log("💰 Ride settled:", {
      rideId,
      driverId: ride.driver_id
    });

    return updated;

  }

  /**
   * Cancel ride before start → refund escrow
   */

  // async cancelRide({ rideId, cancelledBy }) {

  //   const ride = await RideModel.findById(rideId);

  //   if (!ride) {
  //     throw new AppError("RIDE_NOT_FOUND", 404);
  //   }

  //   if (ride.status === "completed") {
  //     throw new AppError("CANNOT_CANCEL_COMPLETED_RIDE", 400);
  //   }

  //   const rideRequest = await RideRequestModel.findById(ride.ride_request_id);

  //   if (!rideRequest) {
  //     throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
  //   }

  //   const amount = rideRequest.estimated_total;

  //   // refund escrow → rider

  //   await LedgerService.refundPayment({
  //     userId: ride.rider_id,
  //     amount,
  //     rideId,
  //     paymentSource: "wallet"
  //   });

  //   return RideModel.findByIdAndUpdate(rideId, {
  //     status: "cancelled",
  //     cancelled_by: cancelledBy,
  //     cancelled_at: new Date()
  //   });

  // }


async cancelRide({ rideId, cancelledBy }) {

  return await withTransaction(async (client) => {

    const ride = await RideModel.findById(rideId, client);

    if (!ride) {
      throw new AppError("RIDE_NOT_FOUND", 404);
    }

    if (ride.status === "completed") {
      throw new AppError("CANNOT_CANCEL_COMPLETED_RIDE", 400);
    }

    const rideRequest = await RideRequestModel.findById(ride.ride_request_id, client);

    if (!rideRequest) {
      throw new AppError("RIDE_REQUEST_NOT_FOUND", 404);
    }

    const amount = rideRequest.estimated_total;

    // Refund escrow → rider (ledger transaction)
    await LedgerService.refundPayment({
      userId: ride.rider_id,
      amount,
      rideId,
      paymentSource: "wallet",
      client
    });

    // Update ride status
    return await RideModel.findByIdAndUpdate(
      rideId,
      {
        status: "cancelled",
        cancelled_by: cancelledBy,
        cancelled_at: new Date()
      },
      client
    );

  });

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
