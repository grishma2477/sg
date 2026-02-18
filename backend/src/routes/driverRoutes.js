import express from 'express';
import { getVerificationStatus } from '../controllers/driverVerificationController.js';
import { verifyuser } from '../middleware/auth.js';

const router = express.Router();

// All driver routes require authentication
router.use(verifyuser);

// Get driver's verification status and badges
router.get('/verification-status', getVerificationStatus);

export default router;