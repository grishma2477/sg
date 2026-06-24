import express from 'express';
import { verifyuser as auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getWalletBalance,
  topUpWallet,
  withdrawFromWallet,
  transferFunds,
  getTransactionHistory,
  lockWallet,
  unlockWallet
} from '../controllers/walletController.js';
import {
  getRidePaymentDetails,
  getUserPaymentHistory,
  getPaymentStats,
  cancelRidePayment
} from '../controllers/ridePaymentController.js';
import {
  initiateTopup,
  verifyTopup,
  getTopupStatus,
  getWalletStatement,
} from '../controllers/walletTopupController.js';
import { idempotency } from '../middleware/idempotency.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', auth, getWalletBalance);

// ── Gateway top-up (Sprint 3) ────────────────────────────────────────────────
router.post('/topup/initiate', auth, initiateTopup);
router.post('/topup/verify',   auth, verifyTopup);
router.get('/topup/status/:topupId', auth, getTopupStatus);

// Wallet statement (Sprint 3)
router.get('/statement', auth, getWalletStatement);

// Legacy direct top-up (admin/test use)
router.post('/topup', auth, idempotency, topUpWallet);

// Withdraw from wallet
router.post('/withdraw', auth, idempotency, withdrawFromWallet);

// Transfer funds to another user
router.post('/transfer', auth, idempotency, transferFunds);

// Get transaction history
router.get('/transactions', auth, getTransactionHistory);

// ═══════════════════════════════════════════════════════════
// RIDE PAYMENT ROUTES
// ═══════════════════════════════════════════════════════════

// Get payment history for user's rides
router.get('/ride-payments', auth, getUserPaymentHistory);

// Get payment statistics
router.get('/payment-stats', auth, getPaymentStats);

// Get specific ride payment details
router.get('/ride-payments/:rideId', auth, getRidePaymentDetails);

// Cancel ride payment (used by ride cancellation)
router.post('/ride-payments/:rideId/cancel', auth, idempotency, cancelRidePayment);

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

// Lock user wallet
router.post('/admin/:userId/lock', auth, requireRole('admin'), lockWallet);

// Unlock user wallet
router.post('/admin/:userId/unlock', auth, requireRole('admin'), unlockWallet);

export default router;