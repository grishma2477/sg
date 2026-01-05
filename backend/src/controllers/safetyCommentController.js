import { SafetyCommentService } from "../application/services/SafetyCommentService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const service = new SafetyCommentService();

export const addSafetyComment = async (req, res, next) => {
  try {
    const evidenceFiles = req.files ? Object.values(req.files) : [];
    
    const result = await service.addSafetyComment({
      reviewId: req.params.reviewId,
      commenterId: req.user.id,
      commenterRole: req.user.role,
      commentText: req.body.commentText,
      safetyCategory: req.body.safetyCategory,
      evidenceFiles
    });

    res.status(201).json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

export const getReviewComments = async (req, res, next) => {
  try {
    const comments = await service.getReviewComments(
      req.params.reviewId,
      req.user.id,
      req.user.role
    );
    res.json(ApiResponse.success(comments));
  } catch (err) {
    next(err);
  }
};

export const adminReviewComment = async (req, res, next) => {
  try {
    const result = await service.adminReviewComment({
      commentId: req.params.commentId,
      adminId: req.user.id,
      ...req.body
    });
    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

export const getPendingReviews = async (req, res, next) => {
  try {
    const comments = await service.getPendingAdminReviews(req.query);
    res.json(ApiResponse.success(comments));
  } catch (err) {
    next(err);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await service.getCommentStatistics(req.query);
    res.json(ApiResponse.success(stats));
  } catch (err) {
    next(err);
  }
};
