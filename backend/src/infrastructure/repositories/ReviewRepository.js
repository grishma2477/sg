// import pool from "../../database/DBConnection.js";

// export class ReviewRepository {
//   async save(review) {
//     await pool.query(
//       `INSERT INTO ride_reviews
//        (id, ride_id, reviewer_id, driver_id, stars, taps)
//        VALUES ($1,$2,$3,$4,$5,$6)`,
//       [
//         review.id,
//         review.rideId,
//         review.reviewerId,
//         review.driverId,
//         review.rating.stars,
//         JSON.stringify(review.taps)
//       ]
//     );
//   }
// }



import { pool } from "../../database/DBConnection.js";

/**
 * Review Repository
 * 
 * Handles direct database operations for reviews.
 * Note: Most review operations now go through ReviewModel,
 * but this is kept for any custom queries needed.
 */
export class ReviewRepository {
  async save(review) {
    await pool.query(
      `INSERT INTO ride_reviews
       (id, ride_id, reviewer_id, reviewee_driver_id, star_rating, positive_taps, negative_taps)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        review.id,
        review.rideId,
        review.reviewerId,
        review.driverId,
        review.rating.stars,
        JSON.stringify(review.taps.filter(t => t.category === "positive")),
        JSON.stringify(review.taps.filter(t => t.category === "negative"))
      ]
    );
  }

  async findByRideId(rideId) {
    const { rows } = await pool.query(
      `SELECT * FROM ride_reviews WHERE ride_id = $1`,
      [rideId]
    );
    return rows;
  }

  async findByDriverId(driverId) {
    const { rows } = await pool.query(
      `SELECT * FROM ride_reviews WHERE reviewee_driver_id = $1 ORDER BY created_at DESC`,
      [driverId]
    );
    return rows;
  }
}