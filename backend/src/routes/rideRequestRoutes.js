// import express from "express";
// import { verifyuser } from "../middleware/auth.js";
// import {
//   createRideRequest,
//   getRiderRequests,
//   getRideRequestDetails,
//   cancelRideRequest,
//   getNearbyRideRequests,
//   updateDriverLocation
// } from "../controllers/rideRequestController.js";

// const router = express.Router();

// router.post("/", verifyuser, createRideRequest);
// router.get("/", verifyuser, getRiderRequests);
// router.get("/:id", verifyuser, getRideRequestDetails);
// router.put("/:id/cancel", verifyuser, cancelRideRequest);

// // Get nearby requests (for drivers)
// router.get('/nearby', verifyuser, getNearbyRideRequests);

// // Update driver location
// router.post('/drivers/location', verifyuser, updateDriverLocation);
// export default router;


import express from "express";
import { verifyuser } from "../middleware/auth.js";
import {
  createRideRequest,
  getRiderRequests,
  getRideRequestDetails,
  cancelRideRequest,
  getNearbyRideRequests,
  updateDriverLocation
} from "../controllers/rideRequestController.js";

const router = express.Router();

router.post("/", verifyuser, createRideRequest);

// Get nearby requests (MUST come before /:id route)
router.get('/nearby', verifyuser, getNearbyRideRequests);

router.get("/", verifyuser, getRiderRequests);
router.get("/:id", verifyuser, getRideRequestDetails);
router.put("/:id/cancel", verifyuser, cancelRideRequest);

export default router;