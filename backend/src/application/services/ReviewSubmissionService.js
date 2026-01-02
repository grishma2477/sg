


// import { ReviewEligibilityValidator } from "../validators/ReviewEligibilityValidator.js";
// import { RatingTapValidator } from "../validators/RatingTapValidator.js";
// import { ReviewFactory } from "../factories/ReviewFactory.js";

// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import { safetyQueue } from "../../infrastructure/queue/safetyQueue.js";
// import redis from "../../infrastructure/redisClient.js";

// import ReviewModel from "../../models/review/Review.js";

// export class ReviewSubmissionService {
//   /**
//    * @param {Object} params
//    * @param {Object} params.rideSummary
//    * @param {Object} params.rating
//    * @param {Array}  params.taps
//    * @param {Object} params.currentUser
//    */
//   async submit({
//     rideSummary,
//     rating,
//     taps,
//     currentUser
//   }) {
//     /* ─────────────────────────────────────────────
//        1️⃣ DERIVE REVIEW STATE FROM DATABASE
//     ───────────────────────────────────────────── */

//     const existingReview = await ReviewModel.findOne({
//       ride_id: rideSummary.rideId,
//       reviewer_id: currentUser.id
//     });

//     const hasReviewed = !!existingReview;

//     /* ─────────────────────────────────────────────
//        2️⃣ BASIC BUSINESS VALIDATIONS
//     ───────────────────────────────────────────── */
//     ReviewEligibilityValidator.validate({
//       rideSummary,
//       hasReviewed
//     });

//     RatingTapValidator.validate(rating, taps);

//     /* ─────────────────────────────────────────────
//        3️⃣ ROLE-DIRECTION ENFORCEMENT
//     ───────────────────────────────────────────── */

//     let reviewerId;
//     let targetUserId;

//     if (currentUser.role === "rider") {
//       // Rider → Driver
//       if (rideSummary.riderId !== currentUser.id) {
//         throw new Error("RIDER_NOT_PART_OF_RIDE");
//       }

//       reviewerId = rideSummary.riderId;
//       targetUserId = rideSummary.driverId;
//     }
//     else if (currentUser.role === "driver") {
//       // Driver → Rider
//       if (rideSummary.driverId !== currentUser.id) {
//         throw new Error("DRIVER_NOT_PART_OF_RIDE");
//       }

//       reviewerId = rideSummary.driverId;
//       targetUserId = rideSummary.riderId;
//     }
//     else {
//       throw new Error("ROLE_NOT_ALLOWED_TO_REVIEW");
//     }

//     /* ─────────────────────────────────────────────
//        4️⃣ CREATE DOMAIN REVIEW OBJECT
//     ───────────────────────────────────────────── */
//     const review = ReviewFactory.create({
//       rideId: rideSummary.rideId,
//       reviewerId,
//       targetUserId,
//       rating,
//       taps
//     });

//     /* ─────────────────────────────────────────────
//        5️⃣ TRANSACTION: SAVE REVIEW
//     ───────────────────────────────────────────── */
//     await withTransaction(async (client) => {
//       await ReviewModel.create(
//         {
//           id: review.id,
//           ride_id: review.rideId,
//           reviewer_id: reviewerId,
//           target_user_id: targetUserId,
//           reviewer_role: currentUser.role,
//           stars: review.rating.stars,
//           taps: JSON.stringify(review.taps),
//           created_at: review.createdAt
//         },
//         client
//       );
//     });

//     /* ─────────────────────────────────────────────
//        6️⃣ CLEAR REDIS PENDING-REVIEW FLAG
//     ───────────────────────────────────────────── */
//     await redis.del(`pending_review:${reviewerId}`);

//     /* ─────────────────────────────────────────────
//        7️⃣ PUSH ASYNC SAFETY JOB
//     ───────────────────────────────────────────── */

//     console.log("📤 ADDING SAFETY JOB", review.id, currentUser.role);
// await safetyQueue.add(
//   `safety-${review.id}`, 
//   { review, reviewerRole: currentUser.role },
//   { attempts: 3, backoff: 3000, removeOnComplete: true }
// );


//     /* ─────────────────────────────────────────────
//        8️⃣ RETURN DOMAIN OBJECT
//     ───────────────────────────────────────────── */
//     return review;
//   }
// }
import { ReviewEligibilityValidator } from "../validators/ReviewEligibilityValidator.js";
import { RatingTapValidator } from "../validators/RatingTapValidator.js";
import { ReviewFactory } from "../factories/ReviewFactory.js";

import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import { safetyQueue } from "../../infrastructure/queue/safetyQueue.js";
import redis from "../../infrastructure/redisClient.js";

import ReviewModel from "../../models/review/Review.js";
import DriverModel from "../../models/driver/Driver.js";
import { AppError } from "../../utils/AppError.js";

export class ReviewSubmissionService {
  /**
   * Submit a review for a completed ride
   * 
   * @param {Object} params
   * @param {Object} params.rideSummary - Ride details
   * @param {Object} params.rating - Rating object with stars
   * @param {Array}  params.taps - Array of tap feedback
   * @param {Object} params.currentUser - Authenticated user from JWT
   */
  async submit({ rideSummary, rating, taps, currentUser }) {

    // ═══════════════════════════════════════════════════
    // 1️⃣ CHECK IF USER ALREADY REVIEWED THIS RIDE
    // ═══════════════════════════════════════════════════
    const existingReview = await ReviewModel.findOne({
      ride_id: rideSummary.rideId,
      reviewer_id: currentUser.id
    });

    const hasReviewed = !!existingReview;

    // ═══════════════════════════════════════════════════
    // 2️⃣ VALIDATE ELIGIBILITY
    // ═══════════════════════════════════════════════════
    ReviewEligibilityValidator.validate({
      rideSummary,
      hasReviewed
    });

    RatingTapValidator.validate(rating, taps);

    // ═══════════════════════════════════════════════════
    // 3️⃣ DETERMINE REVIEWER/REVIEWEE DIRECTION
    // ═══════════════════════════════════════════════════
    let reviewerId;
    let targetDriverId;  // The driver record ID
    let targetUserId;    // The user_id of the target

    if (currentUser.role === "rider") {
      if (rideSummary.riderId !== currentUser.id) {
        throw new AppError("RIDER_NOT_PART_OF_RIDE", 403);
      }

      reviewerId = currentUser.id;

      // IMPORTANT: driverId from payload is ALREADY drivers.id
      targetDriverId = rideSummary.driverId;

      // Optional sanity check
      const driver = await DriverModel.findById(targetDriverId);
      if (!driver) {
        throw new AppError("DRIVER_NOT_FOUND", 404);
      }
    }
    else if (currentUser.role === "driver") {
      // Driver → Rider (doesn't affect safety score)
      if (rideSummary.driverId !== currentUser.id) {
        throw new AppError("DRIVER_NOT_PART_OF_RIDE", 403);
      }

      reviewerId = currentUser.id;
      targetUserId = rideSummary.riderId;

      // For driver reviews, we still need a driver_id for the schema
      // Use the current driver's record
      // const driver = await DriverModel.findOne({ user_id: currentUser.id });
      // if (!driver) {
      //   throw new AppError("DRIVER_RECORD_NOT_FOUND", 404);
      // }
      // targetDriverId = driver.id;

      // Resolve driver ONCE from current user
      const driver = await DriverModel.findOne({ user_id: currentUser.id });
      if (!driver) {
        throw new AppError("DRIVER_RECORD_NOT_FOUND", 404);
      }
      targetDriverId = driver.id;

    } else {
      throw new AppError("ROLE_NOT_ALLOWED_TO_REVIEW", 403);
    }

    // ═══════════════════════════════════════════════════
    // 4️⃣ CREATE DOMAIN REVIEW OBJECT
    // ═══════════════════════════════════════════════════
    const review = ReviewFactory.create({
      rideId: rideSummary.rideId,
      reviewerId,
      driverId: targetUserId,  // Store user_id for worker lookup
      rating,
      taps
    });

    // ═══════════════════════════════════════════════════
    // 5️⃣ SEPARATE TAPS BY CATEGORY
    // ═══════════════════════════════════════════════════
    const positiveTaps = (taps || []).filter(t => t.category === "positive");
    const negativeTaps = (taps || []).filter(t => t.category === "negative");
    const hasSafetyConcern = negativeTaps.length > 0;

    // ═══════════════════════════════════════════════════
    // 6️⃣ SAVE TO DATABASE (TRANSACTION)
    // ═══════════════════════════════════════════════════
    await withTransaction(async (client) => {
      await ReviewModel.create(
        {
          id: review.id,
          ride_id: rideSummary.rideId,
          reviewer_id: reviewerId,
          reviewee_driver_id: targetDriverId,  // Correct column name
          star_rating: rating.stars,            // Correct column name
          positive_taps: JSON.stringify(positiveTaps),
          negative_taps: JSON.stringify(negativeTaps),
          has_safety_concern: hasSafetyConcern,
          is_processed: false,
          created_at: review.createdAt
        },
        client
      );
    });

    console.log("✅ Review saved:", review.id);

    // ═══════════════════════════════════════════════════
    // 7️⃣ CLEAR PENDING REVIEW FLAG IN REDIS
    // ═══════════════════════════════════════════════════
    await redis.del(`pending_review:${reviewerId}`);
    console.log("🔓 Cleared pending review for user:", reviewerId);

    // ═══════════════════════════════════════════════════
    // 8️⃣ QUEUE SAFETY CALCULATION (ASYNC)
    // ═══════════════════════════════════════════════════
    console.log("📤 Adding safety job to queue...");

    await safetyQueue.add(
      `safety-${review.id}`,
      {
        review: {
          id: review.id,
          rideId: review.rideId,
          reviewerId: review.reviewerId,
          driverId: review.driverId,  // user_id of target
          rating: review.rating,
          taps: review.taps
        },
        reviewerRole: currentUser.role
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true
      }
    );

    console.log("✅ Safety job queued for review:", review.id);

    // ═══════════════════════════════════════════════════
    // 9️⃣ RETURN REVIEW
    // ═══════════════════════════════════════════════════
    return review;
  }
}