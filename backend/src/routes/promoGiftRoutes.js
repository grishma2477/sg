import express from 'express';
import { verifyuser as auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  createPromoCode,
  validatePromoCode,
  getPromoCode,
  listPromoCodes,
  deactivatePromoCode,
  getUserPromoHistory,
  updatePromoCode,
  getPromoStats,
  getAllPromoRedemptions
} from '../controllers/promoCodeController.js';
import {
  purchaseGiftCard,
  checkBalance,
  redeemToWallet,
  transferGiftCard,
  getUserGiftCards,
  getRedemptionHistory,
  getAllGiftCards,
  getGiftCardStats,
  getAllGiftCardRedemptions,
  cancelGiftCard
} from '../controllers/giftCardController.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// PROMO CODE ROUTES - USER
// ═══════════════════════════════════════════════════════════

// Validate promo code (check if valid for a ride)
router.post('/promo/validate', auth, validatePromoCode);

// Get promo code details
router.get('/promo/:code', auth, getPromoCode);

// Get user's promo history
router.get('/promo-history', auth, getUserPromoHistory);

// ═══════════════════════════════════════════════════════════
// PROMO CODE ROUTES - ADMIN ONLY
// ═══════════════════════════════════════════════════════════

// Create promo code
router.post('/admin/promo/create', auth, requireRole(['admin']), createPromoCode);

// Update promo code
router.put('/admin/promo/:code/update', auth, requireRole(['admin']), updatePromoCode);

// Deactivate promo code
router.post('/admin/promo/:code/deactivate', auth, requireRole(['admin']), deactivatePromoCode);

// List all promo codes
router.get('/admin/promo/list', auth, requireRole(['admin']), listPromoCodes);

// Get promo code statistics
router.get('/admin/promo/stats', auth, requireRole(['admin']), getPromoStats);

// Get all promo redemptions
router.get('/admin/promo/redemptions', auth, requireRole(['admin']), getAllPromoRedemptions);

// ═══════════════════════════════════════════════════════════
// GIFT CARD ROUTES - USER
// ═══════════════════════════════════════════════════════════

// Purchase gift card
router.post('/gift-card/purchase', auth, purchaseGiftCard);

// Check gift card balance
router.get('/gift-card/:code/balance', auth, checkBalance);

// Redeem gift card to wallet
router.post('/gift-card/redeem', auth, redeemToWallet);

// Transfer gift card to another user
router.post('/gift-card/transfer', auth, transferGiftCard);

// Get user's gift cards
router.get('/gift-cards', auth, getUserGiftCards);

// Get gift card redemption history
router.get('/gift-card/:code/history', auth, getRedemptionHistory);

// ═══════════════════════════════════════════════════════════
// GIFT CARD ROUTES - ADMIN ONLY
// ═══════════════════════════════════════════════════════════

// Get all gift cards
router.get('/admin/gift-cards/list', auth, requireRole(['admin']), getAllGiftCards);

// Get gift card statistics
router.get('/admin/gift-cards/stats', auth, requireRole(['admin']), getGiftCardStats);

// Get all gift card redemptions
router.get('/admin/gift-cards/redemptions', auth, requireRole(['admin']), getAllGiftCardRedemptions);

// Cancel/deactivate gift card
router.post('/admin/gift-card/:code/cancel', auth, requireRole(['admin']), cancelGiftCard);

export default router;