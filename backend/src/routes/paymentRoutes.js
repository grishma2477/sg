import express from 'express';
import { verifyuser as auth } from '../middleware/auth.js';
import {
  getWalletBalance,
  getPaymentDetails,
  handleGatewayWebhook,
  getAccountHistory
} from '../controllers/paymentController.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// WALLET & BALANCE ROUTES
// ═══════════════════════════════════════════════════════════

// Get wallet balance
router.get('/balance', auth, getWalletBalance);

// Get account history (ledger entries)
router.get('/history', auth, getAccountHistory);

// ═══════════════════════════════════════════════════════════
// PAYMENT ROUTES
// ═══════════════════════════════════════════════════════════

// Get payment details
router.get('/:paymentId', auth, getPaymentDetails);

// ═══════════════════════════════════════════════════════════
// GATEWAY WEBHOOK (NO AUTH - verified by gateway signature)
// ═══════════════════════════════════════════════════════════

// Gateway webhook (eSewa/Khalti callback)
router.post('/webhook/gateway', handleGatewayWebhook);

export default router;