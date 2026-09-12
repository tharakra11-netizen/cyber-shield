import { DetectionResult, DetectionSignal, UrlDetector } from './urlDetector.js';
import { UpiDetector } from './upiDetector.js';

export interface QrDetectionResult extends DetectionResult {
  qrContentType: 'URL' | 'UPI' | 'CONTACT' | 'WIFI' | 'TEXT';
  decodedContent: string;
  isSafeToOpen: boolean;
}

export class QrDetector {
  public static analyzeContent(decodedText: string): QrDetectionResult {
    const trimmed = decodedText.trim();
    let qrContentType: 'URL' | 'UPI' | 'CONTACT' | 'WIFI' | 'TEXT' = 'TEXT';

    if (trimmed.startsWith('upi://') || trimmed.includes('pa=')) {
      qrContentType = 'UPI';
    } else if (/^https?:\/\//i.test(trimmed) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
      qrContentType = 'URL';
    } else if (trimmed.startsWith('WIFI:')) {
      qrContentType = 'WIFI';
    } else if (trimmed.startsWith('MECARD:') || trimmed.startsWith('BEGIN:VCARD')) {
      qrContentType = 'CONTACT';
    }

    const signals: DetectionSignal[] = [];

    // If QR is a UPI payment
    if (qrContentType === 'UPI') {
      const upiResult = UpiDetector.analyze(trimmed);
      return {
        ...upiResult,
        qrContentType: 'UPI',
        decodedContent: trimmed,
        isSafeToOpen: upiResult.status === 'SAFE',
        metadata: {
          ...upiResult.metadata,
          scannedMedium: 'QR_CODE',
          payloadType: 'UPI_PAYMENT_URI'
        }
      };
    }

    // If QR is a URL
    if (qrContentType === 'URL') {
      const urlResult = UrlDetector.analyze(trimmed);
      return {
        ...urlResult,
        qrContentType: 'URL',
        decodedContent: trimmed,
        isSafeToOpen: urlResult.status === 'SAFE',
        metadata: {
          ...urlResult.metadata,
          scannedMedium: 'QR_CODE',
          payloadType: 'HYPERLINK'
        }
      };
    }

    // If QR is WIFI or Text
    if (qrContentType === 'WIFI') {
      signals.push({
        id: 'WIFI_CONFIGURATION_QR',
        name: 'Automated WiFi Connection Payload',
        severity: 'MEDIUM',
        scoreImpact: 30,
        description: 'QR attempts to auto-connect device to a wireless network. Malicious rogue hotspots can intercept traffic.'
      });
    }

    // Check for executable payload or dangerous commands in text QR
    const scriptRegex = /(<script|javascript:|powershell|cmd\.exe|wget|curl|rm\s+-rf)/i;
    if (scriptRegex.test(trimmed)) {
      signals.push({
        id: 'EXECUTABLE_SCRIPT_PAYLOAD',
        name: 'Embedded Script / Shell Command',
        severity: 'CRITICAL',
        scoreImpact: 70,
        description: 'QR text contains executable code or shell injection commands.'
      });
    }

    const totalScore = Math.min(100, Math.max(5, signals.reduce((a, b) => a + b.scoreImpact, 0)));
    const riskLevel = totalScore >= 75 ? 'CRITICAL' : totalScore >= 50 ? 'HIGH' : totalScore >= 25 ? 'MODERATE' : 'LOW';
    const status = totalScore >= 50 ? 'MALICIOUS' : totalScore >= 25 ? 'SUSPICIOUS' : 'SAFE';

    return {
      status,
      riskScore: totalScore,
      confidenceScore: 85,
      riskLevel,
      reasons: signals.length > 0 ? signals.map(s => `[${s.severity}] ${s.name}: ${s.description}`) : ['Standard plain text QR payload with no active executable links or payment intents.'],
      signals,
      recommendation: status === 'SAFE' ? 'Decoded text is benign. Safe to inspect.' : 'Do not copy, execute, or automatically process the content of this QR code.',
      metadata: {
        scannedMedium: 'QR_CODE',
        payloadType: qrContentType,
        length: trimmed.length
      },
      analysisMethod: 'QR Content Parsing & Multivector Triage Engine',
      qrContentType,
      decodedContent: trimmed,
      isSafeToOpen: status === 'SAFE'
    };
  }
}
