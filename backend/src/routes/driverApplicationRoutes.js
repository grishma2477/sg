import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  checkApplication,
  submitApplication,
  getPendingApplications,
  getApplicationDetails,
  reviewApplication
} from '../controllers/driverApplicationController.js';

const router = express.Router();

// ========== USER ROUTES ==========
// Check if user has submitted an application
router.get('/check', verifyuser, checkApplication);

// Submit driver application
router.post('/submit', verifyuser, submitApplication);

// ========== ADMIN ROUTES ==========
// Get all pending applications
router.get('/pending', verifyuser, requireRole(['admin']), getPendingApplications);

// Get specific application details
router.get('/:applicationId', verifyuser, requireRole(['admin']), getApplicationDetails);

// Approve or reject application
router.post('/:applicationId/review', verifyuser, requireRole(['admin']), reviewApplication);

export default router;