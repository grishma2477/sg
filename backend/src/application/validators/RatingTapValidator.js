

// import { AppError } from "../../utils/AppError.js";

// /**
//  * Rating and Tap Validator
//  * 
//  * Validates the rating and tap feedback in a review submission.
//  */
// export class RatingTapValidator {
//   /**
//    * Validate rating and taps
//    * 
//    * @param {Object} ratingValue - Rating object with stars property
//    * @param {Array} taps - Array of tap feedback objects
//    */
//   static validate(ratingValue, taps) {
//     // Rating is required
//     if (!ratingValue) {
//       throw new AppError("RATING_REQUIRED", 400);
//     }

//     // Stars must be 1-5
//     const stars = ratingValue.stars;
//     if (!stars || stars < 1 || stars > 5) {
//       throw new AppError("INVALID_STAR_RATING", 400, {
//         provided: stars,
//         allowed: "1-5"
//       });
//     }

//     // Taps should be an array
//     const tapArray = taps || [];

//     // Low ratings (1-2 stars) require at least one negative tap for feedback
//     if (stars <= 2) {
//       const hasNegativeTap = tapArray.some(t => t.category === "negative");
//       if (!hasNegativeTap) {
//         throw new AppError("LOW_RATING_REQUIRES_FEEDBACK", 400, {
//           message: "Low ratings (1-2 stars) require selecting at least one issue"
//         });
//       }
//     }

//     // Validate tap structure
//     for (const tap of tapArray) {
//       if (!tap.key) {
//         throw new AppError("INVALID_TAP_STRUCTURE", 400, {
//           message: "Each tap must have a key"
//         });
//       }
//       if (!["positive", "negative"].includes(tap.category)) {
//         throw new AppError("INVALID_TAP_CATEGORY", 400, {
//           provided: tap.category,
//           allowed: ["positive", "negative"]
//         });
//       }
//       if (typeof tap.pointValue !== "number") {
//         throw new AppError("INVALID_TAP_POINT_VALUE", 400, {
//           message: "Each tap must have a numeric pointValue"
//         });
//       }
//     }

//     return true;
//   }
// }


import { AppError } from "../../utils/AppError.js";

/**
 * Rating and Tap Validator
 * 
 * Validates rating structure and tap keys.
 * Point values are calculated internally by the safety system.
 */
export class RatingTapValidator {
  static validate(ratingValue, taps = []) {

    // ─────────────────────────────
    // 1️⃣ Validate rating
    // ─────────────────────────────
    if (!ratingValue) {
      throw new AppError("RATING_REQUIRED", 400);
    }

    const stars = Number(ratingValue.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new AppError("INVALID_STAR_RATING", 400, {
        provided: ratingValue.stars,
        allowed: "1–5"
      });
    }

    // ─────────────────────────────
    // 2️⃣ Low-star rule (feedback required)
    // ─────────────────────────────
    if (stars <= 2) {
      const hasNegativeTap = taps.some(t => t.category === "negative");
      if (!hasNegativeTap) {
        throw new AppError("LOW_RATING_REQUIRES_FEEDBACK", 400, {
          message: "1–2 star ratings require at least one negative tap"
        });
      }
    }

    // ─────────────────────────────
    // 3️⃣ Allowed tap keys (canonical)
    // ─────────────────────────────
    const ALLOWED_POSITIVE_TAPS = [
      "FELT_SAFE",
      "RESPECTFUL",
      "FOLLOWED_RULES",
      "RESPONSIBLE",
      "ROUTE_OK",
      "COMMUNICATION"
    ];

    const ALLOWED_NEGATIVE_TAPS = [
      "UNCOMFORTABLE",
      "RECKLESS",
      "UNNECESSARY_ROUTE",
      "INAPPROPRIATE",
      "IGNORED_COMM",
      "SAFETY_CONCERN"
    ];

    // ─────────────────────────────
    // 4️⃣ Validate tap structure
    // ─────────────────────────────
    for (const tap of taps) {
      if (!tap.key || typeof tap.key !== "string") {
        throw new AppError("INVALID_TAP_KEY", 400);
      }

      if (!["positive", "negative"].includes(tap.category)) {
        throw new AppError("INVALID_TAP_CATEGORY", 400, {
          provided: tap.category
        });
      }

      const key = tap.key.toUpperCase();

      if (tap.category === "positive" && !ALLOWED_POSITIVE_TAPS.includes(key)) {
        throw new AppError("INVALID_POSITIVE_TAP_KEY", 400, { key });
      }

      if (tap.category === "negative" && !ALLOWED_NEGATIVE_TAPS.includes(key)) {
        throw new AppError("INVALID_NEGATIVE_TAP_KEY", 400, { key });
      }

      // 🚫 DO NOT validate pointValue
      // Backend computes safety points internally
    }

    return true;
  }
}
