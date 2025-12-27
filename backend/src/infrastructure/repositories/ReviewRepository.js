import pool from "../../database/DBConnection.js";

export class ReviewRepository {
  async save(review) {
    await pool.query(
      `INSERT INTO ride_reviews
       (id, ride_id, reviewer_id, driver_id, stars, taps)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        review.id,
        review.rideId,
        review.reviewerId,
        review.driverId,
        review.rating.stars,
        JSON.stringify(review.taps)
      ]
    );
  }
}
