import RideModel from "../models/ride/Ride.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AdminAuditService } from "../application/services/AdminAuditService.js";

/**
 * CREATE any ride only by (admin)
 */
export const createRide = async (req, res, next) => {
  try {
    const ride = await RideModel.create(req.body);

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "CREATE_RIDE",
      entityId: ride.id
    });

    res.status(201).json(ApiResponse.success(ride, "RIDE_CREATED"));
  } catch (err) {
    next(err);
  }
};

/**
 * READ any only by admin ride
 */
export const getRide = async (req, res, next) => {
  try {
    const ride = await RideModel.findById(req.params.id);
    res.json(ApiResponse.success(ride));
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE any ride fields by admins
 */
export const updateRide = async (req, res, next) => {
  try {
    const ride = await RideModel.updateOne(
      { id: req.params.id }, // filters
      req.body               // update payload
    );

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "UPDATE_RIDE",
      entityId: ride.id
    });

    res.json(ApiResponse.success(ride, "RIDE_UPDATED"));
  } catch (err) {
    next(err);
  }
};

/**
 * SOFT DELETE ride by admins
 */
export const deleteRide = async (req, res, next) => {
  try {
    await RideModel.updateOne(
      { id: req.params.id },
      { deleted: true }
    );

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "DELETE_RIDE",
      entityId: req.params.id
    });

    res.json(ApiResponse.success(null, "RIDE_DELETED"));
  } catch (err) {
    next(err);
  }
};

/**
 * FORCE COMPLETE ride (emergency)
 */
export const forceCompleteRide = async (req, res, next) => {
  try {
    const ride = await RideModel.updateOne(
      { id: req.params.id },
      {
        status: "completed",
        is_paid: true,
        forced_by_admin: true
      }
    );

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "FORCE_COMPLETE_RIDE",
      entityId: ride.id
    });

    res.json(ApiResponse.success(ride, "RIDE_FORCE_COMPLETED"));
  } catch (err) {
    next(err);
  }
};

//POST /api/admin/rides/:id/force-complete