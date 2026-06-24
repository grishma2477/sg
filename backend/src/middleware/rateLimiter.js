import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../infrastructure/redisClient.js";

function makeStore(prefix) {
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: `rl:${prefix}:`,
  });
}

function limiter({ windowMs, max, prefix, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: makeStore(prefix),
    handler: (_req, res) =>
      res.status(429).json({ success: false, message }),
    keyGenerator: ipKeyGenerator,
  });
}

// POST /api/auth/send-otp  — 5 requests per 15 minutes per IP
export const sendOtpLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: "send-otp",
  message: "TOO_MANY_OTP_REQUESTS",
});

// POST /api/auth/verify-otp — 10 requests per 15 minutes per IP
export const verifyOtpLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: "verify-otp",
  message: "TOO_MANY_VERIFY_ATTEMPTS",
});

// POST /api/auth/login (email+password) — 10 per 15 minutes
export const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: "login",
  message: "TOO_MANY_LOGIN_ATTEMPTS",
});

// POST /api/auth/refresh — 30 per 15 minutes
export const refreshLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  prefix: "refresh",
  message: "TOO_MANY_REFRESH_REQUESTS",
});

// POST /api/ride-requests — 20 per hour
export const rideRequestLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  prefix: "ride-req",
  message: "TOO_MANY_RIDE_REQUESTS",
});

// Global 300/min — applied in app.js
export const globalLimiter = limiter({
  windowMs: 60 * 1000,
  max: 300,
  prefix: "global",
  message: "TOO_MANY_REQUESTS",
});
