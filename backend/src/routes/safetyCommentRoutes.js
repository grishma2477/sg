import express from "express";
import { verifyuser, requireRole } from "../middleware/auth.js";
import {
  addSafetyComment,
  getReviewComments,
  adminReviewComment,
  getPendingReviews,
  getStatistics
} from "../controllers/safetyCommentController.js";

const router = express.Router();

router.post("/reviews/:reviewId/comments", verifyuser, addSafetyComment);
router.get("/reviews/:reviewId/comments", verifyuser, getReviewComments);
router.post("/comments/:commentId/review", verifyuser, requireRole("admin"), adminReviewComment);
router.get("/pending", verifyuser, requireRole("admin"), getPendingReviews);
router.get("/statistics", verifyuser, requireRole("admin"), getStatistics);

export default router;
