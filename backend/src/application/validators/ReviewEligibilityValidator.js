export class ReviewEligibilityValidator {
  static validate({ rideSummary, userReviewState }) {
    if (!rideSummary.isPaid) {
      throw new Error("Ride not paid");
    }

    if (userReviewState.hasReviewed) {
      throw new Error("Review already submitted");
    }
  }
}
