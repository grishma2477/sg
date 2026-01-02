
// import DriverSafetyStats from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
// import SafetyAuditLog from "../../models/safety/SafetyAuditLog.js";
// import { SafetyCalculationService } from "../services/SafetyCalculationService.js";
// import Review from "../../models/review/Review.js";
// /**
//  * Safety Worker
//  * review.driverEntityId === drivers.id
//  */
// // export async function runSafetyWorker({ review, reviewerRole }) {
// //   console.log("🔄 Safety worker started for review:", review.id);

// //   // 1️⃣ Only rider → driver affects safety
// //   if (reviewerRole !== "rider") {
// //     console.log("ℹ️ Skipping safety impact");
// //     return { skipped: true };
// //   }

// //   const driverId = review.driverEntityId; // ✅ drivers.id

// //   // 2️⃣ Calculate impact
// //   const safetyService = new SafetyCalculationService();
// //   const impact = safetyService.calculate(review);

// //   console.log("🧮 Calculated impact:", impact);

// //   // 3️⃣ Fetch or create safety stats
// //   let stats = await DriverSafetyStats.findOne({ driver_id: driverId });

// //   if (!stats) {
// //     stats = await DriverSafetyStats.create({
// //       driver_id: driverId,
// //       current_points: 1000,
// //       average_rating: 0,
// //       completed_rides: 0,
// //       total_safety_concerns: 0,
// //       verified_safe_badge: false
// //     });
// //   }

// //   const beforePoints = stats.current_points;
// //   const afterPoints = beforePoints + impact.totalImpact;

// //   // 4️⃣ Update stats
// //   await DriverSafetyStats.updateOne(
// //     { driver_id: driverId },
// //     {
// //       current_points: afterPoints,
// //       completed_rides: stats.completed_rides + 1,
// //       updated_at: new Date()
// //     }
// //   );

// //   // 5️⃣ Audit log
// //   await SafetyAuditLog.create({
// //     driver_id: driverId,
// //     event_type: "REVIEW_IMPACT",
// //     points_before: beforePoints,
// //     points_after: afterPoints,
// //     points_delta: impact.totalImpact,
// //     triggered_by_review_id: review.id
// //   });

// //   console.log("✅ Safety updated:", beforePoints, "→", afterPoints);

// //   await Review.updateOne(
// //   { id: review.id },
// //   {
// //     calculated_impact: impact.totalImpact,
// //     is_processed: true
// //   }
// // );

// // console.log("🧾 Review marked as processed:", {
// //   reviewId: review.id,
// //   impact: impact.totalImpact
// // });
// //   return {
// //     driverId,
// //     beforePoints,
// //     afterPoints,
// //     impact
// //   };
// // }


// export async function runSafetyWorker({ review, reviewerRole }) {
//   console.log("🔄 Safety worker started for review:", review.id);

//   let impact = null;

//   if (reviewerRole === "rider") {
//     const safetyService = new SafetyCalculationService();
//     impact = safetyService.calculate(review);

//     let stats = await DriverSafetyStats.findOne({
//       driver_id: review.driverEntityId
//     });

//     if (!stats) {
//       stats = await DriverSafetyStats.create({
//         driver_id: review.driverEntityId,
//         current_points: 1000,
//         completed_rides: 0
//       });
//     }

//     await DriverSafetyStats.updateOne(
//       { driver_id: review.driverEntityId },
//       {
//         current_points: stats.current_points + impact.totalImpact,
//         completed_rides: stats.completed_rides + 1
//       }
//     );

//     await SafetyAuditLog.create({
//       driver_id: review.driverEntityId,
//       event_type: "REVIEW_IMPACT",
//       points_before: stats.current_points,
//       points_after: stats.current_points + impact.totalImpact,
//       points_delta: impact.totalImpact,
//       triggered_by_review_id: review.id
//     });
//   }

//   // ✅ ALWAYS mark review as processed
//   await Review.updateOne(
//     { id: review.id },
//     {
//       calculated_impact: impact?.totalImpact ?? 0,
//       is_processed: true
//     }
//   );

//   console.log("🧾 Review processed:", review.id);

//   return { processed: true };
// }



import DriverSafetyStats from "../../models/driver/driver_safety_stats/DriverSafetyStats.js";
import SafetyAuditLog from "../../models/safety/SafetyAuditLog.js";
import ReviewModel from "../../models/review/Review.js";
import { SafetyCalculationService } from "../services/SafetyCalculationService.js";

/**
 * Safety Worker
 *
 * Runs ONLY for rider → driver reviews
 * review.driverEntityId === drivers.id
 */
export async function runSafetyWorker({ review, reviewerRole }) {
  console.log("🔄 Safety worker started for review:", review.id);

  /* ─────────────────────────────────────────────
     1️⃣ Guard: Only rider reviews affect safety
  ───────────────────────────────────────────── */
  if (reviewerRole !== "rider") {
    console.log("ℹ️ Skipping safety (non-rider review)");
    return { skipped: true };
  }

  const driverId = review.driverEntityId; // ✅ drivers.id ONLY

  /* ─────────────────────────────────────────────
     2️⃣ Calculate safety impact
  ───────────────────────────────────────────── */
  const safetyService = new SafetyCalculationService();
  const impact = safetyService.calculate(review);

  console.log("🧮 Safety impact:", impact);

  /* ─────────────────────────────────────────────
     3️⃣ Fetch or initialize safety stats
  ───────────────────────────────────────────── */
  let stats = await DriverSafetyStats.findOne({ driver_id: driverId });

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

  const beforePoints = stats.current_points;
  const afterPoints = beforePoints + impact.totalImpact;

  /* ─────────────────────────────────────────────
     4️⃣ Update safety stats
  ───────────────────────────────────────────── */
  await DriverSafetyStats.updateOne(
    { driver_id: driverId },
    {
      current_points: afterPoints,
      completed_rides: stats.completed_rides + 1,
      total_safety_concerns:
        impact.negativeImpact < 0
          ? stats.total_safety_concerns + 1
          : stats.total_safety_concerns,
      updated_at: new Date()
    }
  );

  /* ─────────────────────────────────────────────
     5️⃣ Persist audit log
  ───────────────────────────────────────────── */
  await SafetyAuditLog.create({
    driver_id: driverId,
    event_type: "REVIEW_IMPACT",
    points_before: beforePoints,
    points_after: afterPoints,
    points_delta: impact.totalImpact,
    triggered_by_review_id: review.id,
    reason: `Rider review (${impact.totalImpact >= 0 ? "+" : ""}${impact.totalImpact})`
  });

  /* ─────────────────────────────────────────────
     6️⃣ Mark review as processed
  ───────────────────────────────────────────── */
  await ReviewModel.updateOne(
    { id: review.id },
    {
      calculated_impact: impact.totalImpact,
      is_processed: true
    }
  );

  console.log(
    `✅ Safety updated for driver ${driverId}: ${beforePoints} → ${afterPoints}`
  );

  return {
    driverId,
    beforePoints,
    afterPoints,
    impact
  };
}
