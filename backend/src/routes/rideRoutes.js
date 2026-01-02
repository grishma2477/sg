import express from "express";
import { verifyuser } from "../middleware/auth.js";

import {
  createRide,
  startRide,
  completeRide
} from "../controllers/rideController.js";

const router = express.Router();

// user creates ride
router.post("/", verifyuser, createRide);

// ride lifecycle
router.post("/:id/start", verifyuser, startRide);
router.post("/:id/complete", verifyuser, completeRide);

export default router;
