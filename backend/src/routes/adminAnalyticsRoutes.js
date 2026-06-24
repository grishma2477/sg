import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getOverview,
  getRidesAnalytics,
  getDriversAnalytics,
  getFinanceAnalytics,
  getGeographyHeatmap,
} from '../controllers/adminAnalyticsController.js';

const router = express.Router();
router.use(verifyuser);
router.use(requireRole('admin'));

router.get('/overview',   getOverview);
router.get('/rides',      getRidesAnalytics);
router.get('/drivers',    getDriversAnalytics);
router.get('/finance',    getFinanceAnalytics);
router.get('/geography',  getGeographyHeatmap);

export default router;
