import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getSlowQueries,
  getCacheStats,
  flushCache,
  getDbStats,
} from '../controllers/adminPerformanceController.js';

const router = express.Router();
router.use(verifyuser);
router.use(requireRole('admin'));

router.get('/slow-queries', getSlowQueries);
router.get('/cache-stats',  getCacheStats);
router.post('/cache-flush', flushCache);
router.get('/db-stats',     getDbStats);

export default router;
