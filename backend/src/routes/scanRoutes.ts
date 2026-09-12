import { Router } from 'express';
import { ScanController } from '../controllers/scanController.js';
import { extractUserMiddleware, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(extractUserMiddleware);
router.use(requireAuth);

router.get('/', ScanController.getScans);
router.get('/:id', ScanController.getScanById);
router.delete('/:id', ScanController.deleteScan);
router.delete('/', ScanController.clearUserHistory);

export default router;
