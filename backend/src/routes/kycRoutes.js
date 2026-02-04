// src/routes/kycRoutes.js

import express from 'express';
import {
  getKYCStatus,
  completeKYC,
  verifyKYC,
  getPendingKYCs,
  getKYCDetails
} from '../controllers/kycController.js';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// ==================== USER ROUTES ====================

/**
 * GET /api/kyc/status
 * Check own KYC status
 * Auth: Required (any user)
 */
router.get('/status', verifyuser, getKYCStatus);

/**
 * POST /api/kyc/complete
 * Complete KYC with all details and documents
 * Auth: Required (any user)
 * Content-Type: multipart/form-data
 */
router.post('/complete', verifyuser, completeKYC);

// ==================== ADMIN ROUTES ====================

/**
 * GET /api/kyc/pending
 * Get all pending KYC submissions
 * Auth: Admin only
 */
router.get('/pending', verifyuser, requireRole('admin'), getPendingKYCs);

/**
 * GET /api/kyc/:userId
 * Get KYC details for specific user
 * Auth: Admin only
 */
router.get('/:userId', verifyuser, requireRole('admin'), getKYCDetails);

/**
 * POST /api/kyc/verify/:userId
 * Approve or reject KYC
 * Auth: Admin only
 * Body: { approved: boolean, remarks: string }
 */
router.post('/verify/:userId', verifyuser, requireRole('admin'), verifyKYC);

export default router;