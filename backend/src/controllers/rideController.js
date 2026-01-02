import { ApiResponse } from "../utils/ApiResponse.js";
import { RideLifecycleService } from "../application/services/RideLifecycleService.js";

const service = new RideLifecycleService();

export const createRide = async (req, res, next) => {
  try {
    const ride = await service.createRide(req.body);
    res.status(201).json(ApiResponse.success(ride));
  } catch (err) {
    next(err);
  }
};

export const startRide = async (req, res, next) => {
  try {
    const ride = await service.startRide({ rideId: req.params.id });
    res.json(ApiResponse.success(ride));
  } catch (err) {
    next(err);
  }
};

export const completeRide = async (req, res, next) => {
  try {
    const ride = await service.completeRide({ rideId: req.params.id });
    res.json(ApiResponse.success(ride));
  } catch (err) {
    next(err);
  }
};
