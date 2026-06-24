import express from 'express';
import { verifyuser } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(verifyuser);

router.get('/',              getNotifications);
router.get('/unread-count',  getUnreadCount);
router.put('/read-all',      markAllAsRead);
router.put('/:id/read',      markAsRead);

export default router;
