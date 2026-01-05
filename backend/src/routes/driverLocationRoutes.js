// import express from "express";
// import { verifyuser, requireRole } from "../middleware/auth.js";
// import {
//   updateDriverLocation,
//   getDriverLocation,
//   getNearbyDrivers
// } from "../controllers/driverLocationController.js";

// const router = express.Router();

// router.post("/location", verifyuser, requireRole("driver"), updateDriverLocation);
// router.get("/location/:driverId", verifyuser, getDriverLocation);
// router.get("/nearby", verifyuser, getNearbyDrivers);

// export default router;



import express from "express";
import { verifyuser, requireRole } from "../middleware/auth.js";
import { updateDriverLocation } from "../controllers/rideRequestController.js";
import {
  getDriverLocation,
  getNearbyDrivers
} from "../controllers/driverLocationController.js";

const router = express.Router();

// Use the working updateDriverLocation from rideRequestController
router.post("/location", verifyuser, requireRole("driver"), updateDriverLocation);
router.get("/location/:driverId", verifyuser, getDriverLocation);
router.get("/nearby", verifyuser, getNearbyDrivers);

export default router;