import { UrlDetector } from './urlDetector.js';
import { OtpDetector } from './otpDetector.js';
import { UpiDetector } from './upiDetector.js';
import { AiAgentService } from '../services/aiAgentService.js';

export interface ChatAnalysisResult {
  reply: string;
  detectedType: 'URL' | 'OTP' | 'UPI' | 'GENERAL';
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  resultStatus: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';
  reasons: string[];
  recommendation: string;
  maskedInput: string;
  isThreatCheck: boolean;
}

export class ChatAdvisor {
  /**
   * Synchronous analysis using the local high-performance heuristic & AI knowledge agent
   */
  public static analyze(userMessage: string): ChatAnalysisResult {
    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check for Embedded URL to Inspect
    const urlMatch = trimmed.match(/https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|buzz|work|online|club|click|live|cn|ru|info|site|app|cc|link|tk|ml|ga|cf|gq)[^\s]*/i);
    if (urlMatch) {
      const extractedUrl = urlMatch[0];
      const urlResult = UrlDetector.analyze(extractedUrl);
      
      let reply = `### 🔍 URL Threat Inspection Result\n\n`;
      reply += `I analyzed the link **\`${extractedUrl}\`** using our heuristic phishing engine.\n\n`;
      reply += `- **Threat Assessment**: **${urlResult.status}** (${urlResult.riskScore}/100 Risk Index)\n`;
      reply += `- **Severity Level**: **${urlResult.riskLevel}**\n\n`;

      if (urlResult.reasons.length > 0) {
        reply += `**Identified Risk Signals:**\n`;
        urlResult.reasons.forEach(r => {
          reply += `- ${r}\n`;
        });
        reply += `\n`;
      }

      reply += `**Recommended Action:**\n${urlResult.recommendation}\n\n`;
      if (urlResult.riskScore >= 50) {
        reply += `⚠️ **Critical Warning**: Never submit login credentials, card numbers, or passwords to this domain. A permanent audit record has been logged in your Scan History.`;
      } else {
        reply += `✅ While this domain shows low risk, always check browser SSL lock indicators before inputting sensitive credentials.`;
      }

      return {
        reply,
        detectedType: 'URL',
        riskScore: urlResult.riskScore,
        riskLevel: urlResult.riskLevel,
        resultStatus: urlResult.status,
        reasons: urlResult.reasons,
        recommendation: urlResult.recommendation,
        maskedInput: extractedUrl,
        isThreatCheck: true
      };
    }

    // 2. Check for UPI / PIN-to-Receive / Collect Requests
    const isUpiInquiry = lower.includes('upi') || lower.includes('@ok') || lower.includes('@paytm') || lower.includes('vpa') ||
                         lower.includes('collect request') || lower.includes('pin to receive') || lower.includes('cashback') ||
                         lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm');

    // Only treat as threat scan if user is asking about a specific suspicious request or payment trap
    if (isUpiInquiry && (lower.includes('pin') && (lower.includes('receive') || lower.includes('won') || lower.includes('cashback')) || lower.includes('@'))) {
      const upiResult = UpiDetector.analyze(trimmed);

      let reply = `### 💳 UPI Fraud Analysis\n\n`;
      reply += `I evaluated your query against banking and UPI deception vectors:\n\n`;
      reply += `- **Threat Assessment**: **${upiResult.status}** (${upiResult.riskScore}/100 Risk Index)\n`;
      reply += `- **Severity Level**: **${upiResult.riskLevel}**\n\n`;

      if (upiResult.reasons.length > 0) {
        reply += `**Deception Indicators Detected:**\n`;
        upiResult.reasons.forEach(r => {
          reply += `- ${r}\n`;
        });
        reply += `\n`;
      }

      reply += `**Actionable Defense Advice:**\n${upiResult.recommendation}\n\n`;
      reply += `🛡️ **The Golden Rule of UPI:** Entering your 4 or 6-digit UPI PIN **ALWAYS transfers money OUT** of your bank account. You NEVER need to enter a UPI PIN or scan a QR code to receive money.`;

      return {
        reply,
        detectedType: 'UPI',
        riskScore: upiResult.riskScore,
        riskLevel: upiResult.riskLevel,
        resultStatus: upiResult.status,
        reasons: upiResult.reasons,
        recommendation: upiResult.recommendation,
        maskedInput: trimmed.length > 70 ? trimmed.substring(0, 67) + '...' : trimmed,
        isThreatCheck: true
      };
    }

    // 3. Check for OTP / Social Engineering / SMS Lures (Explicit scam messages)
    const hasOtpPattern = /\b\d{4,8}\b/.test(trimmed);
    const isOtpInquiry = lower.includes('otp') || lower.includes('one time password') || lower.includes('verification code') ||
                         lower.includes('suspended') || lower.includes('electricity cutoff') || lower.includes('kyc');

    if (isOtpInquiry && (hasOtpPattern || lower.includes('share') || lower.includes('send') || lower.includes('tell') || lower.includes('urgently'))) {
      const otpResult = OtpDetector.analyze(trimmed);

      let reply = `### 🛡️ Social Engineering & OTP Analysis\n\n`;
      reply += `I evaluated this communication for social engineering and credentials harvesting:\n\n`;
      reply += `- **Threat Assessment**: **${otpResult.status}** (${otpResult.riskScore}/100 Risk Index)\n`;
      reply += `- **Severity Level**: **${otpResult.riskLevel}**\n\n`;

      if (otpResult.reasons.length > 0) {
        reply += `**Identified Red Flags:**\n`;
        otpResult.reasons.forEach(r => {
          reply += `- ${r}\n`;
        });
        reply += `\n`;
      }

      reply += `**Protective Action:**\n${otpResult.recommendation}\n\n`;
      reply += `🔒 **Security Reminder:** Legitimate banks (SBI, HDFC, ICICI, etc.) and utilities will **NEVER** call, SMS, or WhatsApp asking you to dictate your OTP or click a third-party link to complete KYC.`;

      return {
        reply,
        detectedType: 'OTP',
        riskScore: otpResult.riskScore,
        riskLevel: otpResult.riskLevel,
        resultStatus: otpResult.status,
        reasons: otpResult.reasons,
        recommendation: otpResult.recommendation,
        maskedInput: otpResult.maskedInput,
        isThreatCheck: true
      };
    }

    // 4. Conversational AI Agent for All User Questions
    const agentResponse = AiAgentService.generateLocalAgentResponse(trimmed);
    return {
      reply: agentResponse.reply,
      detectedType: 'GENERAL',
      riskScore: 0,
      riskLevel: 'LOW',
      resultStatus: 'SAFE',
      reasons: agentResponse.topics,
      recommendation: agentResponse.recommendation,
      maskedInput: trimmed.length > 70 ? trimmed.substring(0, 67) + '...' : trimmed,
      isThreatCheck: agentResponse.isThreatCheck
    };
  }

  /**
   * Asynchronous analysis supporting external LLMs (Gemini / OpenAI / Groq)
   */
  public static async analyzeAsync(userMessage: string): Promise<ChatAnalysisResult> {
    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // If it's a specific URL, OTP, or UPI threat check, use standard detection
    const urlMatch = trimmed.match(/https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|buzz|work|online|club|click|live|cn|ru|info|site|app|cc|link|tk|ml|ga|cf|gq)[^\s]*/i);
    const hasOtpPattern = /\b\d{4,8}\b/.test(trimmed);
    const isOtpInquiry = (lower.includes('otp') || lower.includes('verification code')) && (hasOtpPattern || lower.includes('share') || lower.includes('urgently'));
    const isUpiThreat = lower.includes('upi') && (lower.includes('pin') && (lower.includes('receive') || lower.includes('won')));

    if (urlMatch || isOtpInquiry || isUpiThreat) {
      return this.analyze(userMessage);
    }

    // Conversational question: Query AiAgentService (which handles external LLMs or local knowledge)
    const agentResponse = await AiAgentService.answerQuestion(userMessage);
    return {
      reply: agentResponse.reply,
      detectedType: 'GENERAL',
      riskScore: 0,
      riskLevel: 'LOW',
      resultStatus: 'SAFE',
      reasons: agentResponse.topics,
      recommendation: agentResponse.recommendation,
      maskedInput: trimmed.length > 70 ? trimmed.substring(0, 67) + '...' : trimmed,
      isThreatCheck: agentResponse.isThreatCheck
    };
  }
}
