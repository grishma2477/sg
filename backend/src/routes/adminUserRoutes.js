import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserStats
} from '../controllers/adminUserController.js';
import { verifyuser } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyuser);
router.use(requireRole('admin'));

// User CRUD
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:userId', getUserById);
router.post('/users', createUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

export default router;