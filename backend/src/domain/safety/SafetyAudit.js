export class SafetyAudit {
  constructor({
    driverId,
    reviewId,
    beforePoints,
    afterPoints,
    reason,
    createdAt
  }) {
    this.driverId = driverId;
    this.reviewId = reviewId;
    this.beforePoints = beforePoints;
    this.afterPoints = afterPoints;
    this.reason = reason;
    this.createdAt = createdAt;
  }
}
