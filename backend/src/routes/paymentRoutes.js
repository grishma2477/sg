import express from 'express';
import { verifyuser as auth } from '../middleware/auth.js';
import {
  getWalletBalance,
  getPaymentDetails,
  handleGatewayWebhook,
  getAccountHistory,
  createPaymentProvider
} from '../controllers/paymentController.js';
import { PaymentMethodService } from '../application/services/PaymentMethodService.js';
import { requireRole } from './../middleware/requireRole.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// cREATING PAYMENT PROVIDERS ROUTES
// ═══════════════════════════════════════════════════════════

router.post("/providers", auth, requireRole("admin"), createPaymentProvider);

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


// ═══════════════════════════════════════════════════════════
// PAYMENT METHOD ROUTES
// ═══════════════════════════════════════════════════════════

router.post("/methods", auth, PaymentMethodService.addPaymentMethod);
// router.get("/methods", auth, getMyPaymentMethods);
// router.post("/methods/:methodId/verify", auth, verifyPaymentMethod);

export default router;