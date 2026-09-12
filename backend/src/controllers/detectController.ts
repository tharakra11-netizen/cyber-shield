import { Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UrlDetector } from '../detectors/urlDetector.js';
import { QrDetector } from '../detectors/qrDetector.js';
import { OtpDetector } from '../detectors/otpDetector.js';
import { UpiDetector } from '../detectors/upiDetector.js';

function hashInput(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export class DetectController {
  public static async detectUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    const schema = z.object({
      url: z.string().min(1, 'URL is required')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { url } = parsed.data;
    const result = await UrlDetector.analyzeAsync(url);

    // Save scan to database
    const inputHash = hashInput(url);
    const maskedInput = url.length > 80 ? url.substring(0, 77) + '...' : url;

    const scan = await prisma.scan.create({
      data: {
        userId: req.user?.userId || null,
        type: 'URL',
        inputHash,
        maskedInput,
        resultStatus: result.status,
        riskScore: result.riskScore,
        confidenceScore: result.confidenceScore,
        riskLevel: result.riskLevel,
        reasons: JSON.stringify(result.reasons),
        recommendation: result.recommendation,
        metadata: JSON.stringify(result.metadata)
      }
    });

    res.json({
      success: true,
      scanId: scan.id,
      data: result,
      savedAt: scan.createdAt
    });
  }

  public static async detectQr(req: AuthenticatedRequest, res: Response): Promise<void> {
    const schema = z.object({
      content: z.string().min(1, 'Decoded QR content is required')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { content } = parsed.data;
    const result = QrDetector.analyzeContent(content);

    const inputHash = hashInput(content);
    const maskedInput = content.length > 60 ? content.substring(0, 57) + '...' : content;

    const scan = await prisma.scan.create({
      data: {
        userId: req.user?.userId || null,
        type: 'QR',
        inputHash,
        maskedInput,
        resultStatus: result.status,
        riskScore: result.riskScore,
        confidenceScore: result.confidenceScore,
        riskLevel: result.riskLevel,
        reasons: JSON.stringify(result.reasons),
        recommendation: result.recommendation,
        metadata: JSON.stringify(result.metadata)
      }
    });

    res.json({
      success: true,
      scanId: scan.id,
      data: result,
      savedAt: scan.createdAt
    });
  }

  public static async detectOtp(req: AuthenticatedRequest, res: Response): Promise<void> {
    const schema = z.object({
      message: z.string().min(3, 'Message text is required (minimum 3 characters)')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { message } = parsed.data;
    const result = OtpDetector.analyze(message);

    // Save only masked input for privacy protection
    const inputHash = hashInput(message);
    const maskedInput = result.maskedInput.length > 120
      ? result.maskedInput.substring(0, 117) + '...'
      : result.maskedInput;

    const scan = await prisma.scan.create({
      data: {
        userId: req.user?.userId || null,
        type: 'OTP',
        inputHash,
        maskedInput,
        resultStatus: result.status,
        riskScore: result.riskScore,
        confidenceScore: result.confidenceScore,
        riskLevel: result.riskLevel,
        reasons: JSON.stringify(result.reasons),
        recommendation: result.recommendation,
        metadata: JSON.stringify(result.metadata)
      }
    });

    res.json({
      success: true,
      scanId: scan.id,
      data: result,
      savedAt: scan.createdAt
    });
  }

  public static async detectUpi(req: AuthenticatedRequest, res: Response): Promise<void> {
    const schema = z.object({
      paymentText: z.string().min(2, 'UPI or payment text is required')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { paymentText } = parsed.data;
    const result = UpiDetector.analyze(paymentText);

    const inputHash = hashInput(paymentText);
    const maskedInput = paymentText.length > 100
      ? paymentText.substring(0, 97) + '...'
      : paymentText;

    const scan = await prisma.scan.create({
      data: {
        userId: req.user?.userId || null,
        type: 'UPI',
        inputHash,
        maskedInput,
        resultStatus: result.status,
        riskScore: result.riskScore,
        confidenceScore: result.confidenceScore,
        riskLevel: result.riskLevel,
        reasons: JSON.stringify(result.reasons),
        recommendation: result.recommendation,
        metadata: JSON.stringify(result.metadata)
      }
    });

    res.json({
      success: true,
      scanId: scan.id,
      data: result,
      savedAt: scan.createdAt
    });
  }
}
