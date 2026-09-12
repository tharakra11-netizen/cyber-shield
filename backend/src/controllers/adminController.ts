import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AdminController {
  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const [
      totalUsers,
      totalScans,
      highRiskScans,
      urlScans,
      qrScans,
      otpScans,
      upiScans,
      chatScans,
      recentScans,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.scan.count(),
      prisma.scan.count({
        where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } }
      }),
      prisma.scan.count({ where: { type: 'URL' } }),
      prisma.scan.count({ where: { type: 'QR' } }),
      prisma.scan.count({ where: { type: 'OTP' } }),
      prisma.scan.count({ where: { type: 'UPI' } }),
      prisma.scan.count({ where: { type: 'CHAT' } }),
      prisma.scan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
      })
    ]);

    // Memory and uptime for system health
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalScans,
        highRiskScans,
        scansByType: {
          URL: urlScans,
          QR: qrScans,
          OTP: otpScans,
          UPI: upiScans,
          CHAT: chatScans
        },
        recentScans: recentScans.map(s => ({
          ...s,
          reasons: JSON.parse(s.reasons || '[]'),
          metadata: s.metadata ? JSON.parse(s.metadata) : null
        })),
        recentUsers,
        systemHealth: {
          uptimeSeconds: Math.floor(uptimeSeconds),
          memoryUsageMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          nodeVersion: process.version,
          status: 'OPERATIONAL',
          database: 'CONNECTED'
        }
      }
    });
  }

  public static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: { scans: true }
          }
        }
      })
    ]);

    res.json({
      success: true,
      users: users.map(u => ({
        ...u,
        scanCount: u._count.scans
      })),
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  }

  public static async toggleUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    // Prevent deactivating own admin account
    if (user.id === req.user?.userId) {
      res.status(400).json({ success: false, error: 'You cannot deactivate your own administrative account.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        adminUserId: req.user?.userId || null,
        action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        targetType: 'USER',
        targetId: id,
        metadata: JSON.stringify({ email: user.email, previousState: user.isActive, newState: updated.isActive })
      }
    });

    res.json({
      success: true,
      message: `User account has been ${updated.isActive ? 'activated' : 'deactivated'}.`,
      isActive: updated.isActive
    });
  }

  public static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    if (user.id === req.user?.userId) {
      res.status(400).json({ success: false, error: 'You cannot delete your own account from admin panel.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminUserId: req.user?.userId || null,
        action: 'USER_DELETED',
        targetType: 'USER',
        targetId: id,
        metadata: JSON.stringify({ email: user.email, name: user.name })
      }
    });

    res.json({
      success: true,
      message: 'User and associated records deleted permanently.'
    });
  }

  public static async getScans(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { type, riskLevel, search, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (type && typeof type === 'string' && type !== 'ALL') {
      where.type = type.toUpperCase();
    }
    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      where.riskLevel = riskLevel.toUpperCase();
    }
    if (search && typeof search === 'string' && search.trim().length > 0) {
      where.maskedInput = { contains: search.trim() };
    }

    const [total, scans] = await Promise.all([
      prisma.scan.count({ where }),
      prisma.scan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      })
    ]);

    res.json({
      success: true,
      scans: scans.map(s => ({
        ...s,
        reasons: JSON.parse(s.reasons || '[]'),
        metadata: s.metadata ? JSON.parse(s.metadata) : null
      })),
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
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

    await prisma.scan.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminUserId: req.user?.userId || null,
        action: 'SCAN_DELETED',
        targetType: 'SCAN',
        targetId: id,
        metadata: JSON.stringify({ type: scan.type, riskLevel: scan.riskLevel, maskedInput: scan.maskedInput })
      }
    });

    res.json({
      success: true,
      message: 'Scan record purged from system.'
    });
  }

  public static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const [lowCount, modCount, highCount, critCount, urlCount, qrCount, otpCount, upiCount, chatCount] = await Promise.all([
      prisma.scan.count({ where: { riskLevel: 'LOW' } }),
      prisma.scan.count({ where: { riskLevel: 'MODERATE' } }),
      prisma.scan.count({ where: { riskLevel: 'HIGH' } }),
      prisma.scan.count({ where: { riskLevel: 'CRITICAL' } }),
      prisma.scan.count({ where: { type: 'URL' } }),
      prisma.scan.count({ where: { type: 'QR' } }),
      prisma.scan.count({ where: { type: 'OTP' } }),
      prisma.scan.count({ where: { type: 'UPI' } }),
      prisma.scan.count({ where: { type: 'CHAT' } })
    ]);

    // Risk distribution
    const riskDistribution = [
      { name: 'Low Risk', count: lowCount, color: '#10b981' },
      { name: 'Moderate Risk', count: modCount, color: '#f59e0b' },
      { name: 'High Risk', count: highCount, color: '#f97316' },
      { name: 'Critical Risk', count: critCount, color: '#ef4444' }
    ];

    // Threat types distribution
    const typeDistribution = [
      { name: 'URL Phishing', count: urlCount, color: '#06b6d4' },
      { name: 'QR Scam', count: qrCount, color: '#8b5cf6' },
      { name: 'OTP Fraud', count: otpCount, color: '#ec4899' },
      { name: 'UPI Deception', count: upiCount, color: '#10b981' },
      { name: 'CyberBot AI', count: chatCount, color: '#6366f1' }
    ];

    res.json({
      success: true,
      analytics: {
        riskDistribution,
        typeDistribution,
        totalScans: lowCount + modCount + highCount + critCount
      }
    });
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = '1', limit = '15' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 15));
    const skip = (pageNum - 1) * take;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          adminUser: { select: { id: true, name: true, email: true } }
        }
      })
    ]);

    res.json({
      success: true,
      logs: logs.map(l => ({
        ...l,
        metadata: l.metadata ? JSON.parse(l.metadata) : null
      })),
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  }

  public static async getLoginSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const [total, sessions] = await Promise.all([
      prisma.loginSession.count(),
      prisma.loginSession.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      sessions,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  }

  public static async getUserActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const [scans, sessions, totalScans, highRiskCount, safeCount] = await Promise.all([
      prisma.scan.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.loginSession.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.scan.count({ where: { userId: id } }),
      prisma.scan.count({
        where: { userId: id, riskLevel: { in: ['HIGH', 'CRITICAL'] } }
      }),
      prisma.scan.count({
        where: { userId: id, riskLevel: 'LOW' }
      })
    ]);

    const formattedScans = scans.map(s => ({
      ...s,
      reasons: JSON.parse(s.reasons || '[]'),
      metadata: s.metadata ? JSON.parse(s.metadata) : null
    }));

    res.json({
      success: true,
      user,
      stats: {
        totalScans,
        highRiskCount,
        safeCount,
        lastLogin: sessions[0]?.createdAt || user.createdAt
      },
      recentSessions: sessions,
      scans: formattedScans
    });
  }
}
