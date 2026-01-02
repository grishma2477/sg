
// import { AppError } from "../../utils/AppError.js";
// export class ReviewEligibilityValidator {
//   static validate({ rideSummary, hasReviewed }) {
//      if (!rideSummary.isPaid) {
//       throw new AppError("RIDE_NOT_PAID", 400);
//     }

//     if (rideSummary.status !== "completed") {
//       throw new AppError("RIDE_NOT_COMPLETED", 400);
//     }

//     if (hasReviewed) {
//       throw new AppError("REVIEW_ALREADY_SUBMITTED", 409);
//     }
//   }
// }


import { AppError } from "../../utils/AppError.js";

/**
 * Review Eligibility Validator
 * 
 * Validates that a user can submit a review for a ride.
 */
export class ReviewEligibilityValidator {
  /**
   * Validate review eligibility
   * 
   * @param {Object} params
   * @param {Object} params.rideSummary - Ride details
   * @param {boolean} params.hasReviewed - Whether user already reviewed this ride
   */
  static validate({ rideSummary, hasReviewed }) {
    // Check ride exists
    if (!rideSummary) {
      throw new AppError("RIDE_SUMMARY_REQUIRED", 400);
    }

    // Check ride is completed
    if (rideSummary.status !== "completed") {
      throw new AppError("RIDE_NOT_COMPLETED", 400, {
        currentStatus: rideSummary.status
      });
    }

    // Check ride is paid (if payment tracking is enabled)
    // Note: Some systems mark as paid on completion automatically
    if (rideSummary.isPaid === false) {
      throw new AppError("RIDE_NOT_PAID", 400);
    }

    // Check user hasn't already reviewed
    if (hasReviewed) {
      throw new AppError("REVIEW_ALREADY_SUBMITTED", 409);
    }

    return true;
  }
}