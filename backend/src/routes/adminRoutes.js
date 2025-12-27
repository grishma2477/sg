import express from "express";
import { resetDriverSafety, clearPendingReview } from "../controllers/adminController.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post(
  "/drivers/:driverId/reset-safety",
  auth,
  requireRole(["admin"]),
  resetDriverSafety
);

router.post(
  "/users/:userId/clear-review",
  auth,
  requireRole(["admin"]),
  clearPendingReview
);

export default router;
