import express from 'express';
import {
  getAllDriversWithBadges,
  getDriverBadges,
  updateDriverBadges,
  resetDriverBadges,
  getDriverSafetyProfile
} from '../controllers/adminBadgeController.js';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from './../middleware/requireRole.js';

const router = express.Router();

router.use(verifyuser);
router.use(requireRole('admin'));

router.get('/drivers/badges', getAllDriversWithBadges);
router.get('/drivers/:driverId/badges', getDriverBadges);
router.put('/drivers/:driverId/badges', updateDriverBadges);
router.post('/drivers/:driverId/badges/reset', resetDriverBadges);
router.get('/drivers/:driverId/safety', getDriverSafetyProfile);

export default router;
