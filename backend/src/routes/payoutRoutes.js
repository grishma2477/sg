import express from 'express';
import { verifyuser as auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  requestPayout,
  getMyPayoutHistory,
  getAvailableBalance,
  getPendingPayouts,
  getApprovedPayouts,
  approvePayout,
  rejectPayout,
  createPayoutBatch,
  getPayoutBatches,
  getBatchDetails,
  retryFailedPayout
} from '../controllers/payoutController.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// DRIVER ROUTES
// ═══════════════════════════════════════════════════════════

// Request payout
router.post('/request', auth, requireRole(['driver']), requestPayout);

// Get payout history
router.get('/history', auth, requireRole(['driver']), getMyPayoutHistory);

// Get available balance
router.get('/balance', auth, requireRole(['driver']), getAvailableBalance);

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

// Get pending payouts (waiting for review)
router.get('/admin/pending', auth, requireRole(['admin']), getPendingPayouts);

// Get approved payouts (ready for batch)
router.get('/admin/approved', auth, requireRole(['admin']), getApprovedPayouts);

// Approve payout request
router.post('/admin/:requestId/approve', auth, requireRole(['admin']), approvePayout);

// Reject payout request
router.post('/admin/:requestId/reject', auth, requireRole(['admin']), rejectPayout);

// Create payout batch
router.post('/admin/batch', auth, requireRole(['admin']), createPayoutBatch);

// Get all payout batches
router.get('/admin/batches', auth, requireRole(['admin']), getPayoutBatches);

// Get batch details
router.get('/admin/batch/:batchId', auth, requireRole(['admin']), getBatchDetails);

// Retry failed payout
router.post('/admin/:requestId/retry', auth, requireRole(['admin']), retryFailedPayout);

export default router;