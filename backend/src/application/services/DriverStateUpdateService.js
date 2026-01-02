// import DriverModel from "../../models/driver/Driver.js";

// const MAX_SAFETY = 100;
// const MIN_SAFETY = -100;

// export class DriverStateUpdateService {
//   async apply({ driverId, totalImpact }) {
//     const driver = await DriverModel.findById(driverId);

//     const previousPoints = driver.safety_points || 0;
//     let newPoints = previousPoints + totalImpact;

//     /* GLOBAL SAFETY CAPPING */
//     newPoints = Math.min(newPoints, MAX_SAFETY);
//     newPoints = Math.max(newPoints, MIN_SAFETY);

//     /* DRIVER STATUS LOGIC */
//     let status = "active";

//     if (newPoints <= -80) status = "suspended";
//     else if (newPoints <= -50) status = "restricted";
//     else if (newPoints >= 70) status = "priority";

//     await DriverModel.findByIdAndUpdate(driverId, {
//       safety_points: newPoints,
//       status
//     });

//     return {
//       previousPoints,
//       newPoints,
//       status
//     };
//   }
// }



import DriverSafetyStats from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
import DriverModel from "../../models/driver/Driver.js";

/**
 * Global safety point bounds
 */
const MAX_SAFETY = 2000;  // Theoretical maximum
const MIN_SAFETY = 700;     

/**
 * Driver State Update Service
 * 
 * Updates driver safety state based on review impacts.
 * Handles status transitions (active, restricted, suspended, priority).
 */
export class DriverStateUpdateService {
  /**
   * Apply safety point changes to a driver
   * 
   * @param {string} driverId - The driver record ID (not user_id)
   * @param {number} totalImpact - Points to add (positive or negative)
   */
  async apply({ driverId, totalImpact }) {
    // Get current safety stats
    let stats = await DriverSafetyStats.findOne({ driver_id: driverId });

    // Initialize if not exists
    if (!stats) {
      stats = await DriverSafetyStats.create({
        driver_id: driverId,
        current_points: 1000,
        average_rating: 0,
        completed_rides: 0,
        total_safety_concerns: 0,
        verified_safe_badge: false
      });
    }

    const previousPoints = stats.current_points || 1000;
    let newPoints = previousPoints + totalImpact;

    // Apply global bounds
    newPoints = Math.min(newPoints, MAX_SAFETY);
    newPoints = Math.max(newPoints, MIN_SAFETY);

    // Determine driver status based on points
    let status = "active";
    
    if (newPoints <= 200) {
      status = "suspended";  // Very low points - account suspended
    } else if (newPoints <= 500) {
      status = "restricted"; // Low points - limited visibility
    } else if (newPoints >= 1200) {
      status = "priority";   // High points - priority matching
    }

    // Update safety stats
    await DriverSafetyStats.updateOne(
      { driver_id: driverId },
      {
        current_points: newPoints,
        updated_at: new Date()
      }
    );

    // Update driver status
    await DriverModel.updateOne(
      { id: driverId },
      { status }
    );

    return {
      previousPoints,
      newPoints,
      status,
      pointChange: totalImpact
    };
  }

  /**
   * Get driver's current safety state
   */
  async getState(driverId) {
    const stats = await DriverSafetyStats.findOne({ driver_id: driverId });
    const driver = await DriverModel.findById(driverId);

    return {
      driverId,
      currentPoints: stats?.current_points || 1000,
      averageRating: stats?.average_rating || 0,
      completedRides: stats?.completed_rides || 0,
      status: driver?.status || "active",
      verifiedBadge: stats?.verified_safe_badge || false
    };
  }
}
