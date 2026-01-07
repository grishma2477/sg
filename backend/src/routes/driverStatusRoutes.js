import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { toggleDriverStatus, getDriverStatus } from '../controllers/driverStatusController.js';

const router = express.Router();

// Toggle driver online/offline status
router.post('/toggle-status', verifyuser, toggleDriverStatus);

// Get driver current status
router.get('/status', verifyuser, getDriverStatus);

export default router;