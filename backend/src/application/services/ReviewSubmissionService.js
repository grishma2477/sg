

// import { ReviewEligibilityValidator } from "../validators/ReviewEligibilityValidator.js";
// import { RatingTapValidator } from "../validators/RatingTapValidator.js";
// import { ReviewFactory } from "../factories/ReviewFactory.js";

// import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
// import { safetyQueue } from "../../infrastructure/queue/safetyQueue.js";
// import redis from "../../infrastructure/redisClient.js";

// import ReviewModel from "../../models/review/Review.js";
// import DriverModel from "../../models/driver/Driver.js";
// import { AppError } from "../../utils/AppError.js";

// export class ReviewSubmissionService {
//   async submit({ rideSummary, rating, taps, currentUser }) {

//     /* ─────────────────────────────────────────────
//        1️⃣ Prevent duplicate review by same user
//     ───────────────────────────────────────────── */
//     const existingReview = await ReviewModel.findOne({
//       ride_id: rideSummary.rideId,
//       reviewer_id: currentUser.id
//     });

//     if (existingReview) {
//       throw new AppError("REVIEW_ALREADY_SUBMITTED", 409);
//     }

//     /* ─────────────────────────────────────────────
//        2️⃣ Validate business rules
//     ───────────────────────────────────────────── */
//     ReviewEligibilityValidator.validate({ rideSummary });
//     RatingTapValidator.validate(rating, taps);

//     /* ─────────────────────────────────────────────
//        3️⃣ Resolve direction & targets
//     ───────────────────────────────────────────── */
//     let reviewerId = currentUser.id;
//     let revieweeDriverId = null;
//     let revieweeUserId = null;
//     let affectsSafety = false;

//     // ───── Rider → Driver ─────
//     if (currentUser.role === "rider") {
//       if (rideSummary.riderId !== currentUser.id) {
//         throw new AppError("RIDER_NOT_PART_OF_RIDE", 403);
//       }

//       // payload MUST send drivers.id
//       const driver = await DriverModel.findById(rideSummary.driverId);
//       if (!driver) {
//         throw new AppError("DRIVER_NOT_FOUND", 404);
//       }

//       revieweeDriverId = driver.id;
//       affectsSafety = true;
//     }

//     // ───── Driver → Rider ─────
//     else if (currentUser.role === "driver") {
//       const driver = await DriverModel.findOne({ user_id: currentUser.id });
//       if (!driver) {
//         throw new AppError("DRIVER_RECORD_NOT_FOUND", 404);
//       }

//       if (rideSummary.driverId !== driver.id) {
//         throw new AppError("DRIVER_NOT_PART_OF_RIDE", 403);
//       }

//       revieweeUserId = rideSummary.riderId;
//     }

//     else {
//       throw new AppError("ROLE_NOT_ALLOWED_TO_REVIEW", 403);
//     }

//     /* ─────────────────────────────────────────────
//        4️⃣ Create domain review object
//     ───────────────────────────────────────────── */
//     const review = ReviewFactory.create({
//       rideId: rideSummary.rideId,
//       reviewerId,
//       rating,
//       taps
//     });

//     const positiveTaps = taps.filter(t => t.category === "positive");
//     const negativeTaps = taps.filter(t => t.category === "negative");

//     /* ─────────────────────────────────────────────
//        5️⃣ Persist review (atomic)
//     ───────────────────────────────────────────── */
//     await withTransaction(async (client) => {
//       await ReviewModel.create(
//         {
//           id: review.id,
//           ride_id: rideSummary.rideId,
//           reviewer_id: reviewerId,

//           reviewee_driver_id: revieweeDriverId,
//           reviewee_user_id: revieweeUserId,

//           star_rating: rating.stars,
//           positive_taps: JSON.stringify(positiveTaps),
//           negative_taps: JSON.stringify(negativeTaps),
//           has_safety_concern: negativeTaps.length > 0,
//           is_processed: false
//         },
//         client
//       );
//     });

//     /* ─────────────────────────────────────────────
//        6️⃣ Redis cleanup
//     ───────────────────────────────────────────── */
//     await redis.del(`pending_review:${reviewerId}`);

//     /* ─────────────────────────────────────────────
//        7️⃣ Queue safety job (ONLY rider → driver)
//     ───────────────────────────────────────────── */
//     if (affectsSafety) {
//       await safetyQueue.add(
//         "process-safety-review",
//         {
//           review: {
//             id: review.id,
//             driverEntityId: revieweeDriverId,
//             rating,
//             taps
//           },
//           reviewerRole: "rider"
//         },
//         { removeOnComplete: true }
//       );
//     }

//     /* ─────────────────────────────────────────────
//        8️⃣ Return domain object
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
  async submit({ rideSummary, rating, taps, currentUser }) {

    /* ─────────────────────────────────────────────
       1️⃣ Prevent duplicate review by same user
    ───────────────────────────────────────────── */
    const existingReview = await ReviewModel.findOne({
      ride_id: rideSummary.rideId,
      reviewer_id: currentUser.id
    });

    if (existingReview) {
      throw new AppError("REVIEW_ALREADY_SUBMITTED", 409);
    }

    /* ─────────────────────────────────────────────
       2️⃣ Validate business rules
    ───────────────────────────────────────────── */
    ReviewEligibilityValidator.validate({ rideSummary });
    RatingTapValidator.validate(rating, taps);

    /* ─────────────────────────────────────────────
       3️⃣ Resolve direction & targets
    ───────────────────────────────────────────── */
    let reviewerId = currentUser.id;
    let revieweeDriverId = null;
    let revieweeUserId = null;
    let affectsDriverSafety = false;
    let affectsRiderSafety = false; // ✅ NEW

    // ───── Rider → Driver ─────
    if (currentUser.role === "rider") {
      if (rideSummary.riderId !== currentUser.id) {
        throw new AppError("RIDER_NOT_PART_OF_RIDE", 403);
      }

      // payload MUST send drivers.id
      const driver = await DriverModel.findById(rideSummary.driverId);
      if (!driver) {
        throw new AppError("DRIVER_NOT_FOUND", 404);
      }

      revieweeDriverId = driver.id;
      affectsDriverSafety = true;
    }

    // ───── Driver → Rider ─────
    else if (currentUser.role === "driver") {
      const driver = await DriverModel.findOne({ user_id: currentUser.id });
      if (!driver) {
        throw new AppError("DRIVER_RECORD_NOT_FOUND", 404);
      }

      if (rideSummary.driverId !== driver.id) {
        throw new AppError("DRIVER_NOT_PART_OF_RIDE", 403);
      }

      revieweeUserId = rideSummary.riderId;
      affectsRiderSafety = true; // ✅ NEW
    }

    else {
      throw new AppError("ROLE_NOT_ALLOWED_TO_REVIEW", 403);
    }

    /* ─────────────────────────────────────────────
       4️⃣ Create domain review object
    ───────────────────────────────────────────── */
    const review = ReviewFactory.create({
      rideId: rideSummary.rideId,
      reviewerId,
      rating,
      taps
    });

    const positiveTaps = taps.filter(t => t.category === "positive");
    const negativeTaps = taps.filter(t => t.category === "negative");

    /* ─────────────────────────────────────────────
       5️⃣ Persist review (atomic)
    ───────────────────────────────────────────── */
    await withTransaction(async (client) => {
      await ReviewModel.create(
        {
          id: review.id,
          ride_id: rideSummary.rideId,
          reviewer_id: reviewerId,

          reviewee_driver_id: revieweeDriverId,
          reviewee_user_id: revieweeUserId, // ✅ NOW SAVES TO DB

          star_rating: rating.stars,
          positive_taps: JSON.stringify(positiveTaps),
          negative_taps: JSON.stringify(negativeTaps),
          has_safety_concern: negativeTaps.length > 0,
          is_processed: false
        },
        client
      );
    });

    /* ─────────────────────────────────────────────
       6️⃣ Redis cleanup
    ───────────────────────────────────────────── */
    await redis.del(`pending_review:${reviewerId}`);

    /* ─────────────────────────────────────────────
       7️⃣ Queue safety jobs (BOTH directions) ✅ UPDATED
    ───────────────────────────────────────────── */
    
    // Rider → Driver: Queue driver safety job
    if (affectsDriverSafety) {
      await safetyQueue.add(
        "process-driver-safety",
        {
          review: {
            id: review.id,
            driverEntityId: revieweeDriverId,
            rating,
            taps
          },
          reviewerRole: "rider"
        },
        { removeOnComplete: true }
      );
      
      console.log("📤 Driver safety job queued for driver:", revieweeDriverId);
    }

    // ✅ NEW: Driver → Rider: Queue rider safety job
    if (affectsRiderSafety) {
      await safetyQueue.add(
        "process-rider-safety",
        {
          review: {
            id: review.id,
            userEntityId: revieweeUserId,
            rating,
            taps
          },
          reviewerRole: "driver"
        },
        { removeOnComplete: true }
      );
      
      console.log("📤 Rider safety job queued for rider:", revieweeUserId);
    }

    /* ─────────────────────────────────────────────
       8️⃣ Return domain object
    ───────────────────────────────────────────── */
    return review;
  }
}