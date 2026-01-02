// import DriverSafetyModel from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
// import SafetyAuditModel from "../../models/safety/SafetyAuditLog.js";
// import { SafetyCalculationService } from "../services/SafetyCalculationService.js";

// export async function runSafetyWorker({ review, reviewerRole }) {
//   // Only rider → driver affects driver safety
//   if (reviewerRole !== "rider") {
//     console.log("ℹ️ No safety impact for reviewer role:", reviewerRole);
//     return;
//   }

//   const safetyService = new SafetyCalculationService();
//   const impact = safetyService.calculate(review);
// console.log("👤 Reviewer role:", reviewerRole);
// console.log("🎯 Target user:", review.targetUserId);

//   // Fetch current points
//   const stats = await DriverSafetyModel.findOne({
//     driver_id: review.targetUserId
//   });

//   const before = stats.safety_points;
//   const after = before + impact.totalImpact;

//   // Update driver points
//   await DriverSafetyModel.updateOne(
//     { driver_id: review.targetUserId },
//     { safety_points: after }
//   );

//   // Write audit log
//   await SafetyAuditModel.create({
//     review_id: review.id,
//     before_points: before,
//     after_points: after
//   });
//   console.log("📝 Audit log inserted for review:", review.id);

// console.log("🧮 Calculated impact:", impact);
// console.log("✅ Updated safety points:", before, "→", after);

//   console.log("✅ Safety updated:", before, "→", after);
// }


import DriverModel from "../../models/driver/Driver.js";
import DriverSafetyStats from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
import SafetyAuditLog from "../../models/safety/SafetyAuditLog.js";
import { SafetyCalculationService } from "../services/SafetyCalculationService.js";

/**
 * Safety Worker
 * 
 * Processes reviews and updates driver safety points.
 * Only rider → driver reviews affect driver safety scores.
 * 
 * @param {Object} params
 * @param {Object} params.review - The review domain object
 * @param {string} params.reviewerRole - "rider" or "driver"
 */
export async function runSafetyWorker({ review, reviewerRole }) {
  console.log("🔄 Safety worker started for review:", review.id);
  console.log("👤 Reviewer role:", reviewerRole);

  // ═══════════════════════════════════════════════════
  // 1️⃣ ONLY RIDER → DRIVER REVIEWS AFFECT SAFETY
  // ═══════════════════════════════════════════════════
  if (reviewerRole !== "rider") {
    console.log("ℹ️ Skipping: Driver reviews don't affect safety scores");
    return { skipped: true, reason: "DRIVER_REVIEW_NO_IMPACT" };
  }

  // ═══════════════════════════════════════════════════
  // 2️⃣ FIND THE DRIVER RECORD
  // ═══════════════════════════════════════════════════
  // The review.driverId is actually the user_id of the driver
  // We need to find the driver record to get the driver.id
  const driver = await DriverModel.findOne({ user_id: review.driverId });
  
  if (!driver) {
    console.error("❌ Driver not found for user_id:", review.driverId);
    throw new Error(`Driver not found for user_id: ${review.driverId}`);
  }

  console.log("🚗 Found driver record:", driver.id);

  // ═══════════════════════════════════════════════════
  // 3️⃣ CALCULATE SAFETY IMPACT
  // ═══════════════════════════════════════════════════
  const safetyService = new SafetyCalculationService();
  const impact = safetyService.calculate(review);
  
  console.log("🧮 Calculated impact:", impact);

  // ═══════════════════════════════════════════════════
  // 4️⃣ GET CURRENT SAFETY STATS
  // ═══════════════════════════════════════════════════
  let stats = await DriverSafetyStats.findOne({ driver_id: driver.id });
  
  // If no stats exist yet, create them with default 1000 points
  if (!stats) {
    console.log("📊 Creating initial safety stats for driver:", driver.id);
    stats = await DriverSafetyStats.create({
      driver_id: driver.id,
      current_points: 1000,
      average_rating: 0,
      completed_rides: 0,
      total_safety_concerns: 0,
      verified_safe_badge: false
    });
  }

  const beforePoints = stats.current_points;
  const afterPoints = beforePoints + impact.totalImpact;

  console.log("📈 Points change:", beforePoints, "→", afterPoints, `(${impact.totalImpact >= 0 ? '+' : ''}${impact.totalImpact})`);

  // ═══════════════════════════════════════════════════
  // 5️⃣ UPDATE DRIVER SAFETY STATS
  // ═══════════════════════════════════════════════════
  const newCompletedRides = (stats.completed_rides || 0) + 1;
  const newSafetyConcerns = impact.negativeImpact < 0 
    ? (stats.total_safety_concerns || 0) + 1 
    : stats.total_safety_concerns;

  // Calculate new average rating
  const currentTotal = (stats.average_rating || 0) * (stats.completed_rides || 0);
  const newAverage = newCompletedRides > 0 
    ? (currentTotal + review.rating.stars) / newCompletedRides 
    : review.rating.stars;

  // Check for verified safe badge (e.g., 50+ rides with 1100+ points)
  const earnsBadge = newCompletedRides >= 50 && afterPoints >= 1100;

  await DriverSafetyStats.updateOne(
    { driver_id: driver.id },
    {
      current_points: afterPoints,
      average_rating: Math.round(newAverage * 100) / 100, // 2 decimal places
      completed_rides: newCompletedRides,
      total_safety_concerns: newSafetyConcerns,
      verified_safe_badge: earnsBadge || stats.verified_safe_badge,
      updated_at: new Date()
    }
  );

  console.log("✅ Updated safety stats:", {
    points: afterPoints,
    rides: newCompletedRides,
    avgRating: newAverage.toFixed(2)
  });

  // ═══════════════════════════════════════════════════
  // 6️⃣ CREATE AUDIT LOG
  // ═══════════════════════════════════════════════════
  await SafetyAuditLog.create({
    driver_id: driver.id,
    event_type: "REVIEW_IMPACT",
    points_before: beforePoints,
    points_after: afterPoints,
    points_delta: impact.totalImpact,
    triggered_by_review_id: review.id,
    reason: `Review from rider: ${review.rating.stars}★, impact: ${impact.totalImpact >= 0 ? '+' : ''}${impact.totalImpact}`
  });

  console.log("📝 Audit log created");

  return {
    driverId: driver.id,
    beforePoints,
    afterPoints,
    impact,
    completedRides: newCompletedRides
  };
}