import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import {
  getEarningsSummary,
  getEarningsHistory,
  getEarningsStatement
} from '../controllers/driverEarningsController.js';

const router = express.Router();

router.get('/summary',   verifyuser, getEarningsSummary);
router.get('/history',   verifyuser, getEarningsHistory);
router.get('/statement', verifyuser, getEarningsStatement);

export default router;
