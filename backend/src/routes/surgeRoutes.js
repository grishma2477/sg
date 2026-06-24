import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { listSurges, createSurge, deleteSurge, checkSurge } from '../controllers/surgeController.js';

const router = express.Router();

// Public (used by fare estimation — no auth needed to check surge at a point)
router.get('/check', checkSurge);

// Admin only
router.get('/',     verifyuser, requireRole('admin'), listSurges);
router.post('/',    verifyuser, requireRole('admin'), createSurge);
router.delete('/:id', verifyuser, requireRole('admin'), deleteSurge);

export default router;
