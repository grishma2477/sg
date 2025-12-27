import express from "express";
import { submitReview } from "../controllers/reviewController.js";
const router = express.Router();
router.post(
  "/reviews",
  auth,
  requireRole(["driver"]),
  submitReview
);


export default router;
