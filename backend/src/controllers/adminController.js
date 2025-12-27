import DriverModel from "../models/driver/Driver.js";
import redis from "../infrastructure/redisClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const resetDriverSafety = async (req, res) => {
  const { driverId } = req.params;

  await DriverModel.findByIdAndUpdate(driverId, {
    safety_points: 0
  });

  res.json(ApiResponse.success(null, "SAFETY_RESET"));
};

export const clearPendingReview = async (req, res) => {
  const { userId } = req.params;

  await redis.del(`pending_review:${userId}`);

  res.json(ApiResponse.success(null, "PENDING_REVIEW_CLEARED"));
};
