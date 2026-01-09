
import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { createDriverProfile, getDriverProfile } from '../controllers/driverProfileController.js';

const router = express.Router();

// Create/Initialize driver profile
router.post('/create-profile', verifyuser, createDriverProfile);

// Get driver profile
router.get('/profile', verifyuser, getDriverProfile);

export default router;