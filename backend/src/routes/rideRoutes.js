

// import express from 'express';
// import { verifyuser } from '../middleware/auth.js';
// import {
//   acceptRideRequest,
//   getRideDetails,
//   startRide,
//   completeRide,
//   cancelRide
// } from '../controllers/rideController.js';

// const router = express.Router();

// // Get ride details
// router.get('/:rideId', verifyuser, getRideDetails);

// // Accept a ride request (fixed price)
// router.post('/accept/:requestId', verifyuser, acceptRideRequest);

// // Start ride
// router.post('/:rideId/start', verifyuser, startRide);

// // Complete ride
// router.post('/:rideId/complete', verifyuser, completeRide);

// // Cancel ride
// router.post('/:rideId/cancel', verifyuser, cancelRide);

// export default router;



import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { ensureDriverProfile, requireDriverProfile } from '../middleware/ensureDriverProfile.js';

import {
  acceptRideRequest,
  getRideDetails,
  startRide,
  arriveAtStop,
  departFromStop,
  completeRide,
  cancelRide
} from '../controllers/rideController.js';
import { idempotency } from '../middleware/idempotency.js';

const router = express.Router();

// Get ride details
router.get('/:rideId', verifyuser, getRideDetails);

// Accept a ride request (fixed price)
router.post('/accept/:requestId', 
  verifyuser,   
  idempotency,        // 1. Verify JWT token
  ensureDriverProfile, 

  acceptRideRequest     // 3. Handle the request
);

// Start ride
router.post('/:rideId/start', 
  verifyuser, 
  ensureDriverProfile, 
  idempotency,
  startRide
);




// Stop management
router.post('/:rideId/stops/:stopId/arrive', verifyuser, arriveAtStop);
router.post('/:rideId/stops/:stopId/depart', verifyuser, departFromStop);

// Complete ride
router.post('/:rideId/complete', 
  verifyuser, 
  ensureDriverProfile, 
  idempotency,
  completeRide
);
// Cancel ride
router.post('/:rideId/cancel', verifyuser, idempotency,cancelRide);

export default router;