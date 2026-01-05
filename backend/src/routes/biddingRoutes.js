// import express from "express";
// import { verifyuser, requireRole } from "../middleware/auth.js";
// import {
//   submitBid,
//   getBidsForRequest,
//   acceptBid,
//   withdrawBid,
//   getDriverBids
// } from "../controllers/biddingController.js";

// const router = express.Router();

// router.post("/requests/:id/bids", verifyuser, requireRole("driver"), submitBid);
// router.get("/requests/:id/bids", verifyuser, getBidsForRequest);
// router.post("/bids/:bidId/accept", verifyuser, acceptBid);
// router.delete("/bids/:id", verifyuser, requireRole("driver"), withdrawBid);
// router.get("/my-bids", verifyuser, requireRole("driver"), getDriverBids);

// export default router;


import express from "express";
import { verifyuser } from "../middleware/auth.js";
import {
  submitBid,
  getRideRequestBids,
  acceptBid
} from "../controllers/biddingController.js";

const router = express.Router();

// Submit a bid
router.post("/requests/:requestId/submit", verifyuser, submitBid);

// Get all bids for a ride request
router.get("/requests/:requestId/bids", verifyuser, getRideRequestBids);

// Accept a bid
router.post("/bids/:bidId/accept", verifyuser, acceptBid);

export default router;