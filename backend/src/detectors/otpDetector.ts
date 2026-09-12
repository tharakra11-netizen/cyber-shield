import { DetectionResult, DetectionSignal } from './urlDetector.js';

export class OtpDetector {
  /**
   * Masks any numeric OTP patterns (4-8 digits) for privacy protection
   */
  public static maskOtp(text: string): { maskedText: string; foundOtpCount: number } {
    let count = 0;
    // Match 4 to 8 digit numbers often preceded or followed by OTP/code keywords or standalone
    const maskedText = text.replace(/\b\d{4,8}\b/g, (match) => {
      count++;
      return '•'.repeat(match.length);
    });
    return { maskedText, foundOtpCount: count };
  }

  public static analyze(rawMessage: string): DetectionResult & { maskedInput: string } {
    const trimmed = rawMessage.trim();
    const { maskedText, foundOtpCount } = this.maskOtp(trimmed);
    const lower = trimmed.toLowerCase();

    const signals: DetectionSignal[] = [];

    // 1. Explicit request to share OTP (Critical Red Flag - Banks NEVER ask for OTP)
    const shareOtpRegex = /(share\s+(this\s+)?(otp|code|pin|password)|tell\s+(the\s+)?(agent|executive|caller|support)|send\s+(this\s+)?(otp|code)|give\s+(this\s+)?otp|forward\s+(this\s+)?(message|sms)|read\s+(out\s+)?(the\s+)?code)/i;
    if (shareOtpRegex.test(lower)) {
      signals.push({
        id: 'OTP_SHARING_REQUEST',
        name: 'Urgent OTP Sharing Demand',
        severity: 'CRITICAL',
        scoreImpact: 50,
        description: 'Message explicitly asks you to share, forward, or read aloud an OTP. Legitimate banks and services will NEVER ask for your OTP.'
      });
    }

    // 2. Account suspension / Deactivation threat
    const threatRegex = /(suspend(ed)?|block(ed)?|deactivat(ed)?|freeze|frozen|disabled|close(d)?|expire(d)?|penalty|fine\s+of|legal\s+action)/i;
    if (threatRegex.test(lower)) {
      signals.push({
        id: 'ACCOUNT_SUSPENSION_THREAT',
        name: 'Coercive Suspension Threat',
        severity: 'HIGH',
        scoreImpact: 30,
        description: 'Message threatens account blockage, suspension, or financial penalties to create panic.'
      });
    }

    // 3. High Urgency pressure
    const urgencyRegex = /(immediately|urgent|right\s+now|within\s+\d+\s+(minute|min|hour)|before\s+midnight|today\s+only|last\s+chance|instant(ly)?)/i;
    if (urgencyRegex.test(lower)) {
      signals.push({
        id: 'ARTIFICIAL_URGENCY',
        name: 'Artificial Urgency Tactic',
        severity: 'MEDIUM',
        scoreImpact: 20,
        description: 'Message pressures immediate action without verification, a hallmark social engineering technique.'
      });
    }

    // 4. KYC / PAN / Aadhaar Verification Traps
    const kycRegex = /(kyc|pan\s+card|aadhaar|update\s+kyc|kyc\s+expired|link\s+pan|verify\s+documents|ebill|electricity\s+(bill|power))/i;
    if (kycRegex.test(lower)) {
      signals.push({
        id: 'KYC_VERIFICATION_TRAP',
        name: 'KYC / Document Update Lure',
        severity: 'HIGH',
        scoreImpact: 30,
        description: 'Impersonates official KYC compliance or utility billing notifications to deceive victims.'
      });
    }

    // 5. Lottery, Prize, Cashback, or Refund lure
    const rewardRegex = /(congratulation|won|winner|lottery|prize|reward|cashback|refund\s+of|credit(ed)?\s+(rs|inr|\$)|bonus)/i;
    if (rewardRegex.test(lower)) {
      signals.push({
        id: 'PRIZE_OR_REFUND_LURE',
        name: 'Financial Incentive / Prize Lure',
        severity: 'HIGH',
        scoreImpact: 35,
        description: 'Message promises unexpected refunds, lottery prizes, or cash rewards to entice compliance.'
      });
    }

    // 6. Embedded Suspicious Links
    const linkRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|is\.gd\/[^\s]+|t\.co\/[^\s]+|[a-z0-9-]+\.(xyz|top|work|buzz|club|online)\/[^\s]*)/i;
    if (linkRegex.test(lower)) {
      signals.push({
        id: 'EMBEDDED_LINK_IN_SMS',
        name: 'External Action Link in Message',
        severity: 'HIGH',
        scoreImpact: 25,
        description: 'Message contains an external web link directing you away from official banking apps.'
      });
    }

    // 7. Legitimate transaction verification indicators (Debit alerts that say "DO NOT SHARE")
    const legitWarningRegex = /(do\s+not\s+share|never\s+share|bank\s+never\s+asks|valid\s+for\s+\d+\s+min)/i;
    const isLegitTransactional = legitWarningRegex.test(lower) && !shareOtpRegex.test(lower) && !threatRegex.test(lower);

    if (isLegitTransactional) {
      signals.push({
        id: 'LEGITIMATE_SECURITY_NOTICE',
        name: 'Standard Security Warning Present',
        severity: 'INFO',
        scoreImpact: -20,
        description: 'Message contains an explicit warning cautioning the recipient against sharing codes with anyone.'
      });
    }

    // Calculate aggregated score
    let totalScore = signals.reduce((acc, sig) => acc + sig.scoreImpact, 0);
    if (signals.length === 0) {
      totalScore = 10; // Low neutral baseline
    }
    totalScore = Math.min(100, Math.max(0, totalScore));

    // Status and risk level determination
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    let status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';

    if (totalScore >= 75) {
      riskLevel = 'CRITICAL';
      status = 'MALICIOUS';
    } else if (totalScore >= 50) {
      riskLevel = 'HIGH';
      status = 'MALICIOUS';
    } else if (totalScore >= 25) {
      riskLevel = 'MODERATE';
      status = 'SUSPICIOUS';
    } else {
      riskLevel = 'LOW';
      status = 'SAFE';
    }

    const reasons = signals.map(s => `[${s.severity}] ${s.name}: ${s.description}`);
    if (reasons.length === 0) {
      reasons.push('No obvious scam triggers, threats, or OTP harvesting patterns detected in the text.');
    }

    let recommendation = 'Standard verification message. Keep this OTP private and do not share with callers.';
    if (status === 'MALICIOUS') {
      recommendation = 'DO NOT SHARE ANY CODE OR CLICK LINKS. This message shows clear signs of an active OTP harvesting scam.';
    } else if (status === 'SUSPICIOUS') {
      recommendation = 'Verify with your bank directly using the official customer care number on your card. Do not respond to this sender.';
    }

    return {
      status,
      riskScore: totalScore,
      confidenceScore: 92,
      riskLevel,
      reasons,
      signals,
      recommendation,
      maskedInput: maskedText,
      metadata: {
        maskedOtpCount: foundOtpCount,
        hasThreatKeywords: threatRegex.test(lower),
        hasShareRequest: shareOtpRegex.test(lower),
        hasUrgency: urgencyRegex.test(lower),
        characterCount: trimmed.length
      },
      analysisMethod: 'NLP Pattern & Social Engineering Indicator Engine'
    };
  }
}
