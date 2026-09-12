import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { extractUserMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Allows both authenticated users and guests with session tracking
router.post('/message', extractUserMiddleware, ChatController.sendMessage);
router.get('/history', extractUserMiddleware, ChatController.getHistory);
router.delete('/history', extractUserMiddleware, ChatController.clearHistory);

export default router;
