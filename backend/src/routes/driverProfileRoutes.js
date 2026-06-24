import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import {
  createDriverProfile,
  getDriverProfile,
  updateDriverProfile,
  getOnboardingStatus,
  getDriverStats
} from '../controllers/driverProfileController.js';

const router = express.Router();

router.post('/create-profile',    verifyuser, createDriverProfile);
router.get('/profile',            verifyuser, getDriverProfile);
router.put('/profile',            verifyuser, updateDriverProfile);
router.get('/onboarding-status',  verifyuser, getOnboardingStatus);
router.get('/stats',              verifyuser, getDriverStats);

export default router;
