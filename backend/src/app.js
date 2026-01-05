import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

import { errorHandler } from "./middleware/errorHandler.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rideRequestRoutes from "./routes/rideRequestRoutes.js"
import biddingRoutes from "./routes/biddingRoutes.js"
dotenv.config();

const app = express();

// ---------- GLOBAL MIDDLEWARE ---------- 
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// ---------- HEALTH CHECK ---------- 
app.get("/", (req, res) => {
  res.status(200).send("Welcome to PERN API");
});

//  ---------- API ROUTES ---------- 
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ride-requests", rideRequestRoutes);
app.use('/api/bidding', biddingRoutes);


app.use(errorHandler);

export default app;
