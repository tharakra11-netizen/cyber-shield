import { Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ChatAdvisor } from '../detectors/chatAdvisor.js';

function hashInput(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export class ChatController {
  public static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const schema = z.object({
      message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
      sessionId: z.string().optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0].message });
      return;
    }

    const { message } = parsed.data;
    const sessionId = parsed.data.sessionId?.trim() || crypto.randomUUID();
    const userId = req.user?.userId || null;

    // 1. Run Cybersecurity Advisor & Threat Triage
    const analysis = await ChatAdvisor.analyzeAsync(message);

    // 2. Persist User Message to ChatMessage
    await prisma.chatMessage.create({
      data: {
        userId,
        sessionId,
        sender: 'user',
        message: message.trim(),
        detectedType: analysis.detectedType,
        createdAt: new Date()
      }
    });

    // 3. If threat check is triggered, create a Scan record in Scan history
    let scanId: string | null = null;
    if (analysis.isThreatCheck) {
      const inputHash = hashInput(message);
      const scan = await prisma.scan.create({
        data: {
          userId,
          type: 'CHAT',
          inputHash,
          maskedInput: analysis.maskedInput,
          resultStatus: analysis.resultStatus,
          riskScore: analysis.riskScore,
          confidenceScore: 92,
          riskLevel: analysis.riskLevel,
          reasons: JSON.stringify(analysis.reasons),
          recommendation: analysis.recommendation,
          metadata: JSON.stringify({
            source: 'CYBERBOT_AI',
            detectedType: analysis.detectedType,
            querySnippet: message.substring(0, 150),
            analyzedAt: new Date().toISOString()
          })
        }
      });
      scanId = scan.id;
    }

    // 4. Persist Bot Reply to ChatMessage
    const botMsg = await prisma.chatMessage.create({
      data: {
        userId,
        sessionId,
        sender: 'bot',
        message: analysis.reply,
        detectedType: analysis.detectedType,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        scanId,
        metadata: JSON.stringify({
          reasons: analysis.reasons,
          isThreatCheck: analysis.isThreatCheck,
          recommendation: analysis.recommendation
        }),
        createdAt: new Date()
      }
    });

    res.json({
      success: true,
      sessionId,
      messageId: botMsg.id,
      reply: analysis.reply,
      detectedType: analysis.detectedType,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      resultStatus: analysis.resultStatus,
      scanId,
      isThreatCheck: analysis.isThreatCheck,
      createdAt: botMsg.createdAt
    });
  }

  public static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const sessionId = (req.query.sessionId as string)?.trim();
    const userId = req.user?.userId;

    if (!sessionId && !userId) {
      res.json({ success: true, messages: [] });
      return;
    }

    const where: any = {};
    if (userId) {
      where.OR = [
        { userId },
        ...(sessionId ? [{ sessionId }] : [])
      ];
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 60
    });

    const formatted = messages.map(m => ({
      id: m.id,
      sender: m.sender,
      message: m.message,
      detectedType: m.detectedType,
      riskScore: m.riskScore,
      riskLevel: m.riskLevel,
      scanId: m.scanId,
      createdAt: m.createdAt
    }));

    res.json({
      success: true,
      messages: formatted
    });
  }

  public static async clearHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const sessionId = (req.query.sessionId as string)?.trim() || (req.body?.sessionId as string)?.trim();
    const userId = req.user?.userId;

    const where: any = {};
    if (userId) {
      where.OR = [
        { userId },
        ...(sessionId ? [{ sessionId }] : [])
      ];
    } else if (sessionId) {
      where.sessionId = sessionId;
    } else {
      res.status(400).json({ success: false, error: 'Session ID or authentication required to clear history.' });
      return;
    }

    await prisma.chatMessage.deleteMany({ where });

    res.json({
      success: true,
      message: 'Chat history cleared successfully.'
    });
  }
}
