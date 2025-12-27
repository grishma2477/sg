import { Review } from "../../domain/review/Review.js";

export class ReviewFactory {
  static create({ rideId, reviewerId, driverId, rating, taps }) {
    return new Review({
      id: crypto.randomUUID(),
      rideId,
      reviewerId,
      driverId,
      rating,
      taps,
      createdAt: new Date()
    });
  }
}
