import db from "../db/index.js";

export const requireRating = async (req, res, next) => {
  const userId = req.user.id; // from auth middleware

  const { rows } = await db.query(
    `
    SELECT ride_id
    FROM ride_ratings
    WHERE rider_id = $1
      AND is_submitted = FALSE
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (rows.length > 0) {
    return res.status(403).json({
      code: "RATING_REQUIRED",
      rideId: rows[0].ride_id
    });
  }

  next();
};