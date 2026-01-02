

import { ReviewEligibilityValidator } from "../validators/ReviewEligibilityValidator.js";
import { RatingTapValidator } from "../validators/RatingTapValidator.js";
import { ReviewFactory } from "../factories/ReviewFactory.js";

import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import { safetyQueue } from "../../infrastructure/queue/safetyQueue.js";
import redis from "../../infrastructure/redisClient.js";

import ReviewModel from "../../models/review/Review.js";

export class ReviewSubmissionService {
  /**
   * @param {Object} params
   * @param {Object} params.rideSummary
   * @param {Object} params.userReviewState
   * @param {Object} params.rating
   * @param {Array}  params.taps
   * @param {Object} params.currentUser  // <-- MUST be passed from controller
   */
  async submit({
    rideSummary,
    userReviewState,
    rating,
    taps,
    currentUser
  }) {
    /* ─────────────────────────────────────────────
       1️⃣ BASIC BUSINESS VALIDATIONS
    ───────────────────────────────────────────── */
    ReviewEligibilityValidator.validate({ rideSummary, userReviewState });
    RatingTapValidator.validate(rating, taps);

    /* ─────────────────────────────────────────────
       2️⃣ ROLE-DIRECTION ENFORCEMENT (CRITICAL)
    ───────────────────────────────────────────── */

    let reviewerId;
    let targetUserId;

    if (currentUser.role === "rider") {
      // Rider → Driver
      if (rideSummary.riderId !== currentUser.id) {
        throw new Error("Rider does not belong to this ride");
      }

      reviewerId = rideSummary.riderId;
      targetUserId = rideSummary.driverId;
    }
    else if (currentUser.role === "driver") {
      // Driver → Rider
      if (rideSummary.driverId !== currentUser.id) {
        throw new Error("Driver does not belong to this ride");
      }

      reviewerId = rideSummary.driverId;
      targetUserId = rideSummary.riderId;
    }
    else {
      // Admin or unknown role
      throw new Error("This role cannot submit reviews");
    }

    /* ─────────────────────────────────────────────
       3️⃣ CREATE DOMAIN REVIEW OBJECT
    ───────────────────────────────────────────── */
    const review = ReviewFactory.create({
      rideId: rideSummary.rideId,
      reviewerId,
      driverId: targetUserId, // target user (driver or rider)
      rating,
      taps
    });

    /* ─────────────────────────────────────────────
       4️⃣ TRANSACTION: SAVE REVIEW
    ───────────────────────────────────────────── */
    await withTransaction(async (client) => {
      await ReviewModel.create(
        {
          id: review.id,
          ride_id: review.rideId,
          reviewer_id: review.reviewerId,
          target_user_id: targetUserId,
          reviewer_role: currentUser.role,
          stars: review.rating.stars,
          taps: JSON.stringify(review.taps),
          created_at: review.createdAt
        },
        client
      );
    });

    /* ─────────────────────────────────────────────
       5️⃣ CLEAR REDIS PENDING-REVIEW FLAG
    ───────────────────────────────────────────── */
    await redis.del(`pending_review:${reviewerId}`);

    /* ─────────────────────────────────────────────
       6️⃣ PUSH ASYNC SAFETY JOB
       (Worker decides what to update based on role)
    ───────────────────────────────────────────── */
    await safetyQueue.add(
      {
        review,
        reviewerRole: currentUser.role
      },
      {
        attempts: 3,
        backoff: 3000,
        removeOnComplete: true
      }
    );

    /* ─────────────────────────────────────────────
       7️⃣ RETURN DOMAIN OBJECT
    ───────────────────────────────────────────── */
    return review;
  }
}
