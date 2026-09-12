import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ScanController {
  public static async getScans(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { type, riskLevel, search, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {
      userId: req.user.userId
    };

    if (type && typeof type === 'string' && type !== 'ALL') {
      where.type = type.toUpperCase();
    }

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      where.riskLevel = riskLevel.toUpperCase();
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      where.maskedInput = {
        contains: search.trim()
      };
    }

    const [total, scans] = await Promise.all([
      prisma.scan.count({ where }),
      prisma.scan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    const formattedScans = scans.map(s => ({
      ...s,
      reasons: JSON.parse(s.reasons || '[]'),
      metadata: s.metadata ? JSON.parse(s.metadata) : null
    }));

    res.json({
      success: true,
      scans: formattedScans,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  }

  public static async getScanById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const scan = await prisma.scan.findUnique({
      where: { id }
    });

    if (!scan) {
      res.status(404).json({ success: false, error: 'Scan record not found.' });
      return;
    }

    // Check authorization: must be owner or admin
    if (scan.userId && req.user?.userId !== scan.userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied to this scan record.' });
      return;
    }

    res.json({
      success: true,
      scan: {
        ...scan,
        reasons: JSON.parse(scan.reasons || '[]'),
        metadata: scan.metadata ? JSON.parse(scan.metadata) : null
      }
    });
  }

  public static async deleteScan(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const scan = await prisma.scan.findUnique({ where: { id } });

    if (!scan) {
      res.status(404).json({ success: false, error: 'Scan record not found.' });
      return;
    }

    if (scan.userId && req.user?.userId !== scan.userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Unauthorized to delete this scan record.' });
      return;
    }

    await prisma.scan.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Scan record removed from history successfully.'
    });
  }

  public static async clearUserHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { count } = await prisma.scan.deleteMany({
      where: { userId: req.user.userId }
    });

    res.json({
      success: true,
      message: `Cleared ${count} scans from history.`
    });
  }
}
