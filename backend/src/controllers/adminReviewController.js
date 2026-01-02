import { ApiResponse } from "../utils/ApiResponse.js";
import { AdminReviewService } from "../application/services/AdminReviewService.js";
import { AdminAuditService } from "../application/services/AdminAuditService.js";

// CREATE
export const createReview = async (req, res, next) => {
  try {
    const review = await AdminReviewService.create({
      adminId: req.user.id,
      ...req.body
    });

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "ADMIN_CREATE_REVIEW",
      entityId: review.id
    });

    res.status(201).json(
      ApiResponse.success(review, "ADMIN_REVIEW_CREATED")
    );
  } catch (err) {
    next(err);
  }
};

//GET review

export const getReview = async (req, res, next) => {
  try {
    const review = await AdminReviewService.get({
      reviewId: req.params.id
    });

    if (!review) {
      return res
        .status(404)
        .json(ApiResponse.success(null, "REVIEW_NOT_FOUND"));
    }

    res.json(ApiResponse.success(review, "REVIEW_FETCHED"));
  } catch (err) {
    next(err);
  }
};


// UPDATE
export const updateReview = async (req, res, next) => {
  try {
    const review = await AdminReviewService.update({
      reviewId: req.params.id,
      data: req.body
    });

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "ADMIN_UPDATE_REVIEW",
      entityId: req.params.id
    });

    res.json(ApiResponse.success(review, "REVIEW_UPDATED"));
  } catch (err) {
    next(err);
  }
};

// FLAG
export const flagReview = async (req, res, next) => {
  try {
    const review = await AdminReviewService.flag({
      reviewId: req.params.id,
      reason: req.body.reason
    });

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "ADMIN_FLAG_REVIEW",
      entityId: req.params.id
    });

    res.json(ApiResponse.success(review, "REVIEW_FLAGGED"));
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteReview = async (req, res, next) => {
  try {
    await AdminReviewService.delete({
      reviewId: req.params.id
    });

    await AdminAuditService.log({
      adminId: req.user.id,
      action: "ADMIN_DELETE_REVIEW",
      entityId: req.params.id
    });

    res.json(ApiResponse.success(null, "REVIEW_DELETED"));
  } catch (err) {
    next(err);
  }
};
