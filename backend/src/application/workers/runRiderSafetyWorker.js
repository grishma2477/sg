import RiderSafetyStats from "../../models/ride/rider_safety_stats/RiderSafetyStats.js";
import SafetyAuditLog from "../../models/safety/SafetyAuditLog.js";
import ReviewModel from "../../models/review/Review.js";
import { SafetyCalculationService } from "../services/SafetyCalculationService.js";

/**
 * Rider Safety Worker
 *
 * Runs ONLY for driver → rider reviews
 * review.userEntityId === users.id
 */
export async function runRiderSafetyWorker({ review, reviewerRole }) {
  console.log("🔄 Rider safety worker started for review:", review.id);

  /* ─────────────────────────────────────────────
     1️⃣ Guard: Only driver reviews affect rider safety
  ───────────────────────────────────────────── */
  if (reviewerRole !== "driver") {
    console.log("ℹ️ Skipping rider safety (non-driver review)");
    return { skipped: true };
  }

  const riderId = review.userEntityId; // ✅ users.id ONLY

  /* ─────────────────────────────────────────────
     2️⃣ Calculate safety impact
  ───────────────────────────────────────────── */
  const safetyService = new SafetyCalculationService();
  const impact = safetyService.calculate(review);

  console.log("🧮 Rider safety impact:", impact);

  /* ─────────────────────────────────────────────
     3️⃣ Fetch or initialize safety stats
  ───────────────────────────────────────────── */
  let stats = await RiderSafetyStats.findOne({ user_id: riderId });

  if (!stats) {
    stats = await RiderSafetyStats.create({
      user_id: riderId,
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
  await RiderSafetyStats.updateOne(
    { user_id: riderId },
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
    user_id: riderId, // Using user_id instead of driver_id
    event_type: "RIDER_REVIEW_IMPACT",
    points_before: beforePoints,
    points_after: afterPoints,
    points_delta: impact.totalImpact,
    triggered_by_review_id: review.id,
    reason: `Driver review (${impact.totalImpact >= 0 ? "+" : ""}${impact.totalImpact})`
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
    `✅ Rider safety updated for user ${riderId}: ${beforePoints} → ${afterPoints}`
  );

  return {
    riderId,
    beforePoints,
    afterPoints,
    impact
  };
}