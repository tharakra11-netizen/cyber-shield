import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { extractUserMiddleware, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(extractUserMiddleware);
router.use(requireAdmin);

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/toggle', AdminController.toggleUserStatus);
router.delete('/users/:id', AdminController.deleteUser);
router.get('/scans', AdminController.getScans);
router.delete('/scans/:id', AdminController.deleteScan);
router.get('/analytics', AdminController.getAnalytics);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/sessions', AdminController.getLoginSessions);
router.get('/users/:id/activity', AdminController.getUserActivity);

export default router;
