import express from "express";
import {
  register,
  login,
  sendOtp,
  verifyOtp,
  resendOtp,
  refresh,
  logout,
  logoutAll,
  registerDevice,
  deleteAccount,
} from "../controllers/authController.js";
import { verifyuser } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  refreshSchema,
  registerDeviceSchema,
} from "../schemas/auth.js";
import {
  sendOtpLimiter,
  verifyOtpLimiter,
  loginLimiter,
  refreshLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

// ── Email+password (kept for admin / testing) ────────────────────────────────
router.post("/register", register);
router.post("/login",    loginLimiter, validate(loginSchema), login);

// ── Phone OTP ────────────────────────────────────────────────────────────────
router.post("/send-otp",   sendOtpLimiter,   validate(sendOtpSchema),   sendOtp);
router.post("/verify-otp", verifyOtpLimiter, validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", sendOtpLimiter,   validate(resendOtpSchema), resendOtp);

// ── Token management ─────────────────────────────────────────────────────────
router.post("/refresh",     refreshLimiter,   validate(refreshSchema), refresh);
router.post("/logout",      logout);
router.post("/logout-all",  verifyuser, logoutAll);

// ── Device / FCM token ───────────────────────────────────────────────────────
router.put("/device", verifyuser, validate(registerDeviceSchema), registerDevice);

// ── Account deletion ─────────────────────────────────────────────────────────
router.post("/delete-account", verifyuser, deleteAccount);

export default router;
