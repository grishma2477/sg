import { asyncHandler } from "../middleware/asyncHandler.js"
import User from "../models/user/User.js"
import { failure, success } from './../utils/ApiResponse.js';
import AuthCredentialModel from "../models/auth/AuthCredential.js";
import KYC from './../models/user/kyc/KYC';

// Get User Profile
export const getUserProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // Fetch data from individual tables
    const user = await User.findById(userId);
    
    if (!user) {
        return next(failure(404, "User not found"));
    }

    const authCred = await AuthCredentialModel.findOne({ user_id: userId });
    const userProfile = await UserProfileModel.findOne({ user_id: userId });
    const kycData = await KYCModel.findOne({ user_id: userId });
    
    let kycDetails = null;
    if (kycData) {
        const kycDocument = await KYCDocumentModel.findOne({ kyc_id: kycData.id });
        const kycImages = await KYCImageModel.findAll({ kyc_id: kycData.id });
        
        kycDetails = {
            ...kycData,
            document: kycDocument,
            images: kycImages
        };
    }

    // Unified response
    const response = {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            created_at: user.created_at
        },
        profile: userProfile || null,
        auth_credentials: authCred || null,
        kyc: kycDetails
    };

    res.status(200).json(success("User profile fetched successfully", response));
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
