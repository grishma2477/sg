import { TapValue } from "../shared/valueObjects/TapValue.js";
import { RatingValue } from "../shared/valueObjects/RatingValue.js";

export class Review {
  constructor({
    id,
    rideId,
    reviewerId,
    driverId,
    rating,
    taps,
    createdAt
  }) {
    this.id = id;
    this.rideId = rideId;
    this.reviewerId = reviewerId;
    this.driverId = driverId;

    this.rating = rating; 
    this.taps = taps || [];

    this.createdAt = createdAt;
  }
}
