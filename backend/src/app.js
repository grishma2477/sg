import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import { errorHandler } from "./middleware/errorHandler.js";

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
import driverVerificationRoutes from "./routes/driverRoutes.js";
import adminBadgeRoutes from "./routes/adminBadgeRoutes.js";
import safetyCommentRoutes from "./routes/safetyCommentRoutes.js";
import mapsRoutes from "./routes/mapsRoutes.js";
const app = express();

// ---------- GLOBAL MIDDLEWARE ---------- 
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// ---------- HEALTH CHECK ---------- 
app.get("/", (_req, res) => {
  res.status(200).send("Welcome to SG API");
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
app.use('/api/drivers', driverVerificationRoutes);
app.use('/api/admin', adminBadgeRoutes);
app.use('/api/safety-comments', safetyCommentRoutes);
app.use('/api/maps', mapsRoutes);



app.use(errorHandler);

export default app;
