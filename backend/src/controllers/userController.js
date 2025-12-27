import { asyncHandler } from "../middleware/asyncHandler.js"
import User from "../models/user/User.js"
import { failure, success } from './../utils/ApiResponse';


// Get uSer Profiler
export const getUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById
        (req.user.id);
   if (!user) {
       return failure(404, "User not found");
   }
    res.status(200).json(success( "User profile fetched successfully", user));
});


// Update User Profile
export const updateUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return failure(404, "User not found");
    }
    const { firstName, lastName, email, phone } = req.body;
   const users = await User.findByIdAndUpdate(req.user.id, {
        firstName,
        lastName,
        email,
        phone
    }); 
    res.status(200).json(success( "User profile updated successfully", users));
});


export const completeRide = async (req, res) => {
  const { rideId } = req.params;
  const { riderId, driverId } = req.body;

  // 1. Mark ride as completed
  await db.query(
    `UPDATE rides SET status = 'COMPLETED', completed_at = NOW() WHERE id = $1`,
    [rideId]
  );

  // 2. Create pending rating
  await db.query(
    `INSERT INTO ride_ratings (ride_id, rider_id, driver_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (ride_id) DO NOTHING`,
    [rideId, riderId, driverId]
  );

  res.json({ success: true });
};


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
