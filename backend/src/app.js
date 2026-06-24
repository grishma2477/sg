import * as Sentry from '@sentry/node';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import fileUpload from "express-fileupload";

import { errorHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { pool } from "./database/DBConnection.js";
import redis from "./infrastructure/redisClient.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rideRequestRoutes from "./routes/rideRequestRoutes.js"
import biddingRoutes from "./routes/biddingRoutes.js"
import driverRoutes from "./routes/driverStatusRoutes.js"
import kycRoutes from "./routes/kycRoutes.js"
import driverApplicationRoutes from './routes/driverApplicationRoutes.js';
import adminUserRoutes from "./routes/adminUserRoutes.js"
import walletRoutes from "./routes/walletRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import payoutRoutes from "./routes/payoutRoutes.js"
import promoGiftRoutes from "./routes/promoGiftRoutes.js"
import adminPaymentProviderRoutes from "./routes/adminPaymentProviderRoutes.js";
import driverLocationRoutes from "./routes/driverLocationRoutes.js";
import driverProfileRoutes from "./routes/driverProfileRoutes.js";
import driverEarningsRoutes from "./routes/driverEarningsRoutes.js";
import driverVerificationRoutes from "./routes/driverRoutes.js";
import adminBadgeRoutes from "./routes/adminBadgeRoutes.js";
import safetyCommentRoutes from "./routes/safetyCommentRoutes.js";
import mapsRoutes from "./routes/mapsRoutes.js";
import adminLedgerRoutes from "./routes/adminLedgerRoutes.js";
import { startSafetyRecoveryScheduler } from "./application/workers/safetyRecoveryWorker.js";
import { startBadgeAssignmentScheduler } from "./application/workers/badgeAssignmentWorker.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import surgeRoutes from "./routes/surgeRoutes.js";
import adminPerformanceRoutes from "./routes/adminPerformanceRoutes.js";
const app = express();

// ---------- GLOBAL MIDDLEWARE ----------
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : "*",
  credentials: true,
}));
app.use(globalLimiter);
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(requestLogger);

// ---------- HEALTH CHECK ----------
app.get("/", (_req, res) => res.status(200).send("Welcome to SG API"));

// ---------- LEGAL REDIRECTS ----------
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sawagaadi.com';
app.get("/privacy", (_req, res) => res.redirect(301, `${FRONTEND_URL}/privacy`));
app.get("/terms",   (_req, res) => res.redirect(301, `${FRONTEND_URL}/terms`));

app.get("/health", async (_req, res) => {
  let dbStatus = "disconnected";
  let redisStatus = "disconnected";

  try { await pool.query("SELECT 1"); dbStatus = "connected"; } catch (_) {}

  try {
    if (redis && (redis.status === 'ready' || (await redis.ping()) === 'PONG')) redisStatus = "connected";
  } catch (_) {}

  const status = dbStatus === "connected" ? "ok" : "degraded";
  res.status(status === "ok" ? 200 : 503).json({
    status,
    database:        dbStatus,
    redis:           redisStatus,
    uptime_seconds:  Math.floor(process.uptime()),
    version:         process.env.npm_package_version || "1.0.0",
    environment:     process.env.NODE_ENV || "development",
  });
});

//  ---------- API ROUTES ---------- 
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/manage", adminUserRoutes);
app.use("/api/ride-requests", rideRequestRoutes);
app.use('/api/bidding', biddingRoutes);
app.use('/api/drivers', driverRoutes)
app.use('/api/kyc', kycRoutes);
app.use('/api/driver-applications', driverApplicationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/promo-gift', promoGiftRoutes);
app.use('/api/ride-requests/drivers', driverLocationRoutes);
app.use("/api/admin/payment-providers", adminPaymentProviderRoutes);
app.use('/api/drivers', driverProfileRoutes);
app.use('/api/drivers/earnings', driverEarningsRoutes);
app.use('/api/drivers', driverVerificationRoutes);
app.use('/api/admin', adminBadgeRoutes);
app.use('/api/safety-comments', safetyCommentRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/admin/ledger', adminLedgerRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/analytics',    adminAnalyticsRoutes);
app.use('/api/admin/surge',        surgeRoutes);
app.use('/api/admin/performance',  adminPerformanceRoutes);

// Sprint 5 workers
startBadgeAssignmentScheduler();
startSafetyRecoveryScheduler();

// Sentry error handler must be before the custom errorHandler
Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

export default app;
