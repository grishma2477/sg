import express from "express";
import { verifyuser  } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

import * as adminRide from "../controllers/adminRideController.js";
import * as adminReview from "../controllers/adminReviewController.js";

const router = express.Router();

// Ride 
router.post("/rides", verifyuser, requireRole(["admin"]), adminRide.createRide);
router.get("/rides/:id", verifyuser, requireRole(["admin"]), adminRide.getRide);
router.put("/rides/:id", verifyuser, requireRole(["admin"]), adminRide.updateRide);
router.delete("/rides/:id", verifyuser, requireRole(["admin"]), adminRide.deleteRide);
router.post("/rides/:id/force-complete", verifyuser, requireRole(["admin"]), adminRide.forceCompleteRide);

// Review 
router.post("/reviews", verifyuser, requireRole(["admin"]), adminReview.createReview);
router.get("/reviews/:id", verifyuser, requireRole(["admin"]), adminReview.getReview);
router.put("/reviews/:id", verifyuser, requireRole(["admin"]), adminReview.updateReview);
router.post("/reviews/:id/flag", verifyuser, requireRole(["admin"]), adminReview.flagReview);
router.delete("/reviews/:id", verifyuser, requireRole(["admin"]), adminReview.deleteReview);

export default router;
