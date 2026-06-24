import express from 'express';
import { verifyuser as auth } from '../middleware/auth.js';
import {
  getWalletBalance,
  getPaymentDetails,
  handleGatewayWebhook,
  getAccountHistory,
  createPaymentProvider,
} from '../controllers/paymentController.js';
import { handleEsewaWebhook } from '../controllers/walletTopupController.js';

import {
    addPaymentMethod,
  getUserPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod
} from "../controllers/paymentMethodController.js";

import { requireRole } from './../middleware/requireRole.js';
import { getUserProviders } from '../controllers/adminPaymentProviderController.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// cREATING PAYMENT PROVIDERS ROUTES
// ═══════════════════════════════════════════════════════════

router.post('/providers', auth, requireRole("admin"), createPaymentProvider);
router.get('/providers', auth, getUserProviders);
// ═══════════════════════════════════════════════════════════
// WALLET & BALANCE ROUTES
// ══════════════════════════════════════════
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

// Gateway webhook (eSewa/Khalti callback) — legacy
router.post('/webhook/gateway', handleGatewayWebhook);

// eSewa webhook — HMAC-verified, no auth token required
router.post('/webhook/esewa', handleEsewaWebhook);


// ═══════════════════════════════════════════════════════════
// PAYMENT METHOD ROUTES
// ═══════════════════════════════════════════════════════════
router.post('/methods', auth, addPaymentMethod);
router.get('/methods', auth, getUserPaymentMethods);
router.patch('/methods/:methodId/default', auth, setDefaultPaymentMethod);
router.delete('/methods/:methodId', auth, deletePaymentMethod);

// router.get("/methods", auth, getMyPaymentMethods);
// router.post("/methods/:methodId/verify", auth, verifyPaymentMethod);

export default router;