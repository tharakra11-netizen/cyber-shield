import { DetectionResult, DetectionSignal } from './urlDetector.js';

export class UpiDetector {
  public static analyze(rawPaymentText: string): DetectionResult {
    const trimmed = rawPaymentText.trim();
    const lower = trimmed.toLowerCase();
    const signals: DetectionSignal[] = [];

    // Parse if it's a UPI URI: upi://pay?pa=...&pn=...&am=...&tn=...
    let isUpiUri = false;
    let upiParams: Record<string, string> = {};
    if (trimmed.startsWith('upi://') || trimmed.includes('pa=')) {
      isUpiUri = true;
      try {
        const queryIndex = trimmed.indexOf('?');
        const queryString = queryIndex !== -1 ? trimmed.slice(queryIndex + 1) : trimmed;
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((val, key) => {
          upiParams[key.toLowerCase()] = val;
        });
      } catch {
        // Ignore parse error, proceed with regex
      }
    }

    // 1. PIN to Receive Scam (Golden Rule Violation)
    const pinToReceiveRegex = /(enter\s+(your\s+)?(upi\s+)?pin\s+to\s+(receive|claim|get|credit|accept)|pin\s+required\s+to\s+receive|send\s+pin\s+for\s+refund)/i;
    if (pinToReceiveRegex.test(lower)) {
      signals.push({
        id: 'PIN_TO_RECEIVE_DECEPTION',
        name: 'PIN-to-Receive Trap (Critical Scam)',
        severity: 'CRITICAL',
        scoreImpact: 60,
        description: 'Claims you must enter a UPI PIN to receive money. UPI PIN is EXCLUSIVELY used to send/deduct money from your account, never to receive money.'
      });
    }

    // 2. Collect Request Disguised as Credit/Refund
    const collectDisguiseRegex = /(collect\s+request|pay\s+request\s+of\s+rs|approve\s+(the\s+)?request\s+to\s+(receive|get)|accept\s+request\s+to\s+credit)/i;
    if (collectDisguiseRegex.test(lower)) {
      signals.push({
        id: 'COLLECT_REQUEST_DECEPTION',
        name: 'Disguised Collect Request',
        severity: 'CRITICAL',
        scoreImpact: 50,
        description: 'Payment request is a debit collect-request disguised as a refund or credit.'
      });
    }

    // 3. Fake Customer Care / Bank Spoofing VPA
    const vpaRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+/g;
    const matchedVpas = trimmed.match(vpaRegex) || [];
    const suspiciousVpaKeywords = ['support', 'helpdesk', 'care', 'refund', 'official', 'nodal', 'executive', 'kyc'];

    let spoofedVpaFound = false;
    for (const vpa of matchedVpas) {
      const vpaLower = vpa.toLowerCase();
      for (const kw of suspiciousVpaKeywords) {
        if (vpaLower.includes(kw)) {
          spoofedVpaFound = true;
          signals.push({
            id: 'SPOOFED_SUPPORT_VPA',
            name: `Deceptive VPA Identity (${vpa})`,
            severity: 'HIGH',
            scoreImpact: 35,
            description: `VPA '${vpa}' uses pseudo-official keywords to impersonate genuine bank/portal support.`
          });
          break;
        }
      }
    }

    // 4. Cashback, Lottery, or Overpayment claim
    const cashbackRegex = /(cashback\s+of\s+rs|won\s+scratch\s+card|google\s*pay\s+reward|phonepe\s+cashback|paytm\s+lottery|overpaid\s+by\s+mistake|return\s+extra\s+money)/i;
    if (cashbackRegex.test(lower)) {
      signals.push({
        id: 'REWARD_OR_OVERPAYMENT_LURE',
        name: 'Cashback / Overpayment Pretext',
        severity: 'HIGH',
        scoreImpact: 35,
        description: 'Uses fake scratch cards, unexpected cashback, or overpayment claims to lure you into authorizing a transfer.'
      });
    }

    // 5. Remote Access / Screen Sharing Tools mention (AnyDesk, TeamViewer, RustDesk)
    const remoteAppRegex = /(anydesk|teamviewer|rustdesk|quicksupport|screen\s+share|install\s+support\s+app)/i;
    if (remoteAppRegex.test(lower)) {
      signals.push({
        id: 'REMOTE_ACCESS_APP_DEMAND',
        name: 'Remote Access App Demand',
        severity: 'CRITICAL',
        scoreImpact: 55,
        description: 'Advises installing remote desktop software (AnyDesk, TeamViewer) which enables scammers to drain accounts.'
      });
    }

    // 6. Urgency in Payment
    const urgencyRegex = /(immediately|within\s+5\s+min|expire(s)?\s+soon|last\s+warning)/i;
    if (urgencyRegex.test(lower)) {
      signals.push({
        id: 'PAYMENT_URGENCY',
        name: 'High-Pressure Urgency',
        severity: 'MEDIUM',
        scoreImpact: 20,
        description: 'Applies time pressure to force hasty authorization before verification.'
      });
    }

    // 7. Legitimate merchant transaction parameters
    if (isUpiUri && !pinToReceiveRegex.test(lower) && !collectDisguiseRegex.test(lower)) {
      // Check if standard merchant query parameters are present
      if (upiParams['pa'] && upiParams['pn']) {
        signals.push({
          id: 'STANDARD_UPI_INTENT',
          name: 'Standard UPI Payment Intent',
          severity: 'INFO',
          scoreImpact: 5,
          description: `Standard payment request targeted to payee: ${upiParams['pn']} (${upiParams['pa']}).`
        });
      }
    }

    // Calculate aggregated score
    let totalScore = signals.reduce((acc, sig) => acc + sig.scoreImpact, 0);
    if (signals.length === 0) {
      totalScore = 5; // Clean baseline
    }
    totalScore = Math.min(100, Math.max(0, totalScore));

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
      reasons.push('No known UPI collect-fraud patterns or deceptive keywords detected.');
    }

    let recommendation = 'Remember: UPI PIN is ONLY required to send money. Never enter your PIN if someone is claiming to send money to you.';
    if (status === 'MALICIOUS') {
      recommendation = 'DECLINE IMMEDIATELY. Entering your UPI PIN or approving this request will transfer money OUT of your bank account to the scammer.';
    } else if (status === 'SUSPICIOUS') {
      recommendation = 'Do not accept or approve payment requests without verifying payee identity independently. Never share screenshot of QR with strangers.';
    }

    return {
      status,
      riskScore: totalScore,
      confidenceScore: 90,
      riskLevel,
      reasons,
      signals,
      recommendation,
      metadata: {
        isUpiUri,
        payeeVpa: upiParams['pa'] || (matchedVpas[0] ?? null),
        payeeName: upiParams['pn'] || null,
        amount: upiParams['am'] || null,
        transactionNote: upiParams['tn'] || null,
        matchedVpasCount: matchedVpas.length,
        spoofedVpaFound
      },
      analysisMethod: 'UPI Deception & Payment Pattern Analyzer'
    };
  }
}
