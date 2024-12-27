import express from 'express';
import { login, updateProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.put('/profile', authMiddleware, updateProfile);

export default router;