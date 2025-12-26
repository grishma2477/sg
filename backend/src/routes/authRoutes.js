import express from "express";
import { registerUser, logInUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", logInUser);

export default router;