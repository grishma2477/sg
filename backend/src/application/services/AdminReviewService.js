import ReviewModel from "../../models/review/Review.js";
import { ReviewFactory } from "../factories/ReviewFactory.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";

export class AdminReviewService {

  // CREATE (emergency / recovery)
  static async create({
    adminId,
    rideId,
    reviewerId,
    revieweeId,
    rating,
    taps,
    reason
  }) {
    const review = ReviewFactory.create({
      rideId,
      reviewerId,
      driverId: revieweeId,
      rating,
      taps
    });

    await withTransaction(async (client) => {
      await ReviewModel.create(
        {
          id: review.id,
          ride_id: rideId,
          reviewer_id: reviewerId,
          driver_id: revieweeId,
          stars: rating.stars,
          taps: JSON.stringify(taps),

          created_by_admin: true,
          admin_id: adminId,
          override_reason: reason,
          skip_safety: true,

          created_at: review.createdAt
        },
        client
      );
    });

    return review;
  }


  // READ
static async get({ reviewId }) {
  return ReviewModel.findById(reviewId);
}
  // UPDATE
  static async update({ reviewId, data }) {
    return ReviewModel.updateOne(
      { id: reviewId },
      data
    );
  }

  // FLAG
  static async flag({ reviewId, reason }) {
    return ReviewModel.updateOne(
      { id: reviewId },
      {
        flagged: true,
        flagged_reason: reason
      }
    );
  }

  // DELETE (soft)
  static async delete({ reviewId }) {
    return ReviewModel.updateOne(
      { id: reviewId },
      { deleted: true }
    );
  }
}
