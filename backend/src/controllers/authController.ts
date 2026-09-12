import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { signJwt, signResetToken, verifyResetToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message
      });
      return;
    }

    const { name, email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // First user in the database can optionally be given ADMIN or default to USER
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        isActive: true,
        isVerified: true
      }
    });

    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message
      });
      return;
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
      return;
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Record login session telemetry
    const rawIp = ((req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()) || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const ipAddress = rawIp.replace(/^::ffff:/, '');
    const userAgent = req.headers['user-agent'] || 'Unknown Client';
    
    // Parse device into clean human-readable name
    let device = 'Desktop · Browser';
    const uaLower = userAgent.toLowerCase();
    let os = 'Windows PC';
    if (uaLower.includes('windows nt 10.0') || uaLower.includes('windows nt 11.0')) os = 'Windows 11/10';
    else if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) os = 'macOS Workstation';
    else if (uaLower.includes('iphone')) os = 'Apple iPhone';
    else if (uaLower.includes('ipad')) os = 'Apple iPad';
    else if (uaLower.includes('android')) os = 'Android Mobile';
    else if (uaLower.includes('linux')) os = 'Linux Terminal';

    let browser = 'Chrome';
    if (uaLower.includes('edg/')) browser = 'Edge';
    else if (uaLower.includes('chrome/') && !uaLower.includes('edg/')) browser = 'Chrome';
    else if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) browser = 'Safari';
    else if (uaLower.includes('firefox/')) browser = 'Firefox';

    device = `${browser} on ${os}`;

    try {
      await prisma.loginSession.create({
        data: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          device,
          ipAddress,
          userAgent,
          createdAt: new Date()
        }
      });
    } catch (sessionErr) {
      console.error('Could not log user session:', sessionErr);
    }

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        ...user,
        scanCount: user._count.scans
      }
    });
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const schema = z.object({
      name: z.string().min(2).optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6).optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { name, currentPassword, newPassword } = parsed.data;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, error: 'Current password is required to set a new password.' });
        return;
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        res.status(400).json({ success: false, error: 'Current password does not match.' });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Generic response for security to prevent user enumeration
      res.json({
        success: true,
        message: 'If an account exists with this email address, password recovery instructions have been dispatched.'
      });
      return;
    }

    const resetToken = signResetToken(user.id, user.email);
    const devResetUrl = `/reset-password?token=${resetToken}`;

    res.json({
      success: true,
      message: 'If an account exists with this email address, password recovery instructions have been dispatched.',
      devResetUrl,
      token: resetToken
    });
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      token: z.string().min(1, 'Reset token is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { token, newPassword } = parsed.data;
    const payload = verifyResetToken(token);

    if (!payload) {
      res.status(400).json({
        success: false,
        error: 'Password reset link is invalid or has expired. Please request a new recovery link.'
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'User account not found.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    // Record audit log entry
    try {
      await prisma.auditLog.create({
        data: {
          adminUserId: null,
          action: 'PASSWORD_RESET',
          targetType: 'USER',
          targetId: user.id,
          metadata: JSON.stringify({ email: user.email, timestamp: new Date().toISOString() })
        }
      });
    } catch {
      // Graceful fallback if audit log write fails
    }

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new credentials.'
    });
  }
}
