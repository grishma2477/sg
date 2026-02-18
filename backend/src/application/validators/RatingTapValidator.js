

// import { AppError } from "../../utils/AppError.js";

// /**
//  * Rating and Tap Validator
//  * 
//  * Validates rating structure and tap keys.
//  * Point values are calculated internally by the safety system.
//  */
// export class RatingTapValidator {
//   static validate(ratingValue, taps = []) {

//     // ─────────────────────────────
//     // 1️⃣ Validate rating
//     // ─────────────────────────────
//     if (!ratingValue) {
//       throw new AppError("RATING_REQUIRED", 400);
//     }

//     const stars = Number(ratingValue.stars);
//     if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
//       throw new AppError("INVALID_STAR_RATING", 400, {
//         provided: ratingValue.stars,
//         allowed: "1–5"
//       });
//     }

//     // ─────────────────────────────
//     // 2️⃣ Low-star rule (feedback required)
//     // ─────────────────────────────
//     if (stars <= 2) {
//       const hasNegativeTap = taps.some(t => t.category === "negative");
//       if (!hasNegativeTap) {
//         throw new AppError("LOW_RATING_REQUIRES_FEEDBACK", 400, {
//           message: "1–2 star ratings require at least one negative tap"
//         });
//       }
//     }

//     // ─────────────────────────────
//     // 3️⃣ Allowed tap keys (canonical)
//     // ─────────────────────────────
//     const ALLOWED_POSITIVE_TAPS = [
//       "FELT_SAFE",
//       "RESPECTFUL",
//       "FOLLOWED_RULES",
//       "RESPONSIBLE",
//       "ROUTE_OK",
//       "COMMUNICATION"
//     ];

//     const ALLOWED_NEGATIVE_TAPS = [
//       "UNCOMFORTABLE",
//       "RECKLESS",
//       "UNNECESSARY_ROUTE",
//       "INAPPROPRIATE",
//       "IGNORED_COMM",
//       "SAFETY_CONCERN"
//     ];

//     // ─────────────────────────────
//     // 4️⃣ Validate tap structure
//     // ─────────────────────────────
//     for (const tap of taps) {
//       if (!tap.key || typeof tap.key !== "string") {
//         throw new AppError("INVALID_TAP_KEY", 400);
//       }

//       if (!["positive", "negative"].includes(tap.category)) {
//         throw new AppError("INVALID_TAP_CATEGORY", 400, {
//           provided: tap.category
//         });
//       }

//       const key = tap.key.toUpperCase();

//       if (tap.category === "positive" && !ALLOWED_POSITIVE_TAPS.includes(key)) {
//         throw new AppError("INVALID_POSITIVE_TAP_KEY", 400, { key });
//       }

//       if (tap.category === "negative" && !ALLOWED_NEGATIVE_TAPS.includes(key)) {
//         throw new AppError("INVALID_NEGATIVE_TAP_KEY", 400, { key });
//       }

//       // 🚫 DO NOT validate pointValue
//       // Backend computes safety points internally
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
    // 3️⃣ Allowed tap keys (BOTH DIRECTIONS)
    // ─────────────────────────────
    
    // Rider rating driver (positive)
    const RIDER_POSITIVE_TAPS = [
      "FELT_SAFE",
      "RESPECTFUL",
      "FOLLOWED_RULES",
      "RESPONSIBLE",
      "ROUTE_OK",
      "COMMUNICATION"
    ];

    // Rider rating driver (negative)
    const RIDER_NEGATIVE_TAPS = [
      "UNCOMFORTABLE",
      "RECKLESS",
      "UNNECESSARY_ROUTE",
      "INAPPROPRIATE",
      "IGNORED_COMM",
      "SAFETY_CONCERN"
    ];

    // Driver rating rider (positive)
    const DRIVER_POSITIVE_TAPS = [
      "POLITE",
      "PUNCTUAL",
      "RESPECTFUL",
      "CLEAN",
      "EASY_RIDER",
      "ACCEPTABLE"
    ];

    // Driver rating rider (negative)
    const DRIVER_NEGATIVE_TAPS = [
      "LATE",
      "RUDE",
      "MESSY",
      "VERY_RUDE",
      "NO_SHOW",
      "DAMAGED_CAR",
      "INTOXICATED"
    ];

    // Combined allowed keys
    const ALLOWED_POSITIVE_TAPS = [
      ...RIDER_POSITIVE_TAPS,
      ...DRIVER_POSITIVE_TAPS
    ];

    const ALLOWED_NEGATIVE_TAPS = [
      ...RIDER_NEGATIVE_TAPS,
      ...DRIVER_NEGATIVE_TAPS
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
        throw new AppError("INVALID_NEGATIVE_TAP_KEY", 400, { 
          key,
          allowed: ALLOWED_NEGATIVE_TAPS 
        });
      }

      // 🚫 DO NOT validate pointValue
      // Backend computes safety points internally
    }

    return true;
  }
}