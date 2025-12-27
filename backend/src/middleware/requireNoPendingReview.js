import redis from "../infrastructure/redisClient.js";

export const requireNoPendingReview = async (req, res, next) => {
  const userId = req.user.id;

  const pendingRide = await redis.get(`pending_review:${userId}`);

  if (pendingRide) {
    return res.status(409).json({
      message: "Please complete your previous ride review first",
      rideId: pendingRide
    });
  }

  next();
};
