import express from 'express';
import { auth } from '../middleware/auth.js';
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

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// WALLET ROUTES (Authenticated Users)
// ═══════════════════════════════════════════════════════════

// Get wallet balance
router.get('/balance', auth, getWalletBalance);

// Top-up wallet
router.post('/topup', auth, topUpWallet);

// Withdraw from wallet
router.post('/withdraw', auth, withdrawFromWallet);

// Transfer funds to another user
router.post('/transfer', auth, transferFunds);

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
router.post('/ride-payments/:rideId/cancel', auth, cancelRidePayment);

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

// Lock user wallet
router.post('/admin/:userId/lock', auth, requireRole('admin'), lockWallet);

// Unlock user wallet
router.post('/admin/:userId/unlock', auth, requireRole('admin'), unlockWallet);

export default router;