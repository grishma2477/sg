// import express from "express";
// import { submitReview } from "../controllers/reviewController.js";
// const router = express.Router();
// router.post(
//   "/reviews",
//   auth,
//   requireRole(["driver"]),
//   submitReview
// );


// export default router;


import express from "express";
import { submitReview } from "../controllers/reviewController.js";
import { verifyuser as auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post(
  "/",
  auth,
  requireRole(["rider", "driver"]),
  submitReview
);

export default router;
