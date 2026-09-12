import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { extractUserMiddleware, requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.get('/me', extractUserMiddleware, requireAuth, AuthController.getMe);
router.put('/profile', extractUserMiddleware, requireAuth, AuthController.updateProfile);

export default router;
