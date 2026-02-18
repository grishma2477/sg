import express from 'express';
import { 
  getAllDriversWithBadges,
  getDriverBadges,
  updateDriverBadges,
  resetDriverBadges
} from '../controllers/adminBadgeController.js';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from './../middleware/requireRole.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyuser);
router.use(requireRole('admin'));

// Badge management
router.get('/drivers/badges', getAllDriversWithBadges);
router.get('/drivers/:driverId/badges', getDriverBadges);
router.put('/drivers/:driverId/badges', updateDriverBadges);
router.post('/drivers/:driverId/badges/reset', resetDriverBadges);

export default router;