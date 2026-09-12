import { Router } from 'express';
import { DetectController } from '../controllers/detectController.js';
import { extractUserMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Allows both authenticated users (saved to user history) and guests
router.post('/url', extractUserMiddleware, DetectController.detectUrl);
router.post('/qr', extractUserMiddleware, DetectController.detectQr);
router.post('/otp', extractUserMiddleware, DetectController.detectOtp);
router.post('/upi', extractUserMiddleware, DetectController.detectUpi);

export default router;
