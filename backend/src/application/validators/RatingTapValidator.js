// export class RatingTapValidator {
//   static validate(ratingValue, taps) {
//     if (!ratingValue) {
//       throw new Error("Stars must be selected first");
//     }

//     if (ratingValue.stars <= 2 && taps.length === 0) {
//       throw new Error("Low ratings require feedback");
//     }
//   }
// }


import { AppError } from "../../utils/AppError.js";

/**
 * Rating and Tap Validator
 * 
 * Validates the rating and tap feedback in a review submission.
 */
export class RatingTapValidator {
  /**
   * Validate rating and taps
   * 
   * @param {Object} ratingValue - Rating object with stars property
   * @param {Array} taps - Array of tap feedback objects
   */
  static validate(ratingValue, taps) {
    // Rating is required
    if (!ratingValue) {
      throw new AppError("RATING_REQUIRED", 400);
    }

    // Stars must be 1-5
    const stars = ratingValue.stars;
    if (!stars || stars < 1 || stars > 5) {
      throw new AppError("INVALID_STAR_RATING", 400, {
        provided: stars,
        allowed: "1-5"
      });
    }

    // Taps should be an array
    const tapArray = taps || [];

    // Low ratings (1-2 stars) require at least one negative tap for feedback
    if (stars <= 2) {
      const hasNegativeTap = tapArray.some(t => t.category === "negative");
      if (!hasNegativeTap) {
        throw new AppError("LOW_RATING_REQUIRES_FEEDBACK", 400, {
          message: "Low ratings (1-2 stars) require selecting at least one issue"
        });
      }
    }

    // Validate tap structure
    for (const tap of tapArray) {
      if (!tap.key) {
        throw new AppError("INVALID_TAP_STRUCTURE", 400, {
          message: "Each tap must have a key"
        });
      }
      if (!["positive", "negative"].includes(tap.category)) {
        throw new AppError("INVALID_TAP_CATEGORY", 400, {
          provided: tap.category,
          allowed: ["positive", "negative"]
        });
      }
      if (typeof tap.pointValue !== "number") {
        throw new AppError("INVALID_TAP_POINT_VALUE", 400, {
          message: "Each tap must have a numeric pointValue"
        });
      }
    }

    return true;
  }
}