import express from "express";
import * as userController from "../controllers/userController.js"

import { requireRating } from "../middleware/requireRating.js";

const router = express.Router()

router.get("/", userController.getProfile)

export default router


router.post(
    "/request",
    authMiddleware,
    requireRating,
    requestRide
);