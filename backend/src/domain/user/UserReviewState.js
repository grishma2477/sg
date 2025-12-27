export class UserReviewState {
  constructor({
    userId,
    rideId,
    hasPaid,
    hasReviewed,
    reviewSubmittedAt
  }) {
    this.userId = userId;
    this.rideId = rideId;

    this.hasPaid = hasPaid;               
    this.hasReviewed = hasReviewed;        
    this.reviewSubmittedAt = reviewSubmittedAt;
  }
}
