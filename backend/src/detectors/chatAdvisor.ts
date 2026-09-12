import { UrlDetector } from './urlDetector.js';
import { OtpDetector } from './otpDetector.js';
import { UpiDetector } from './upiDetector.js';

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
  public static analyze(userMessage: string): ChatAnalysisResult {
    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check for Embedded URL
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

    if (isUpiInquiry && (lower.includes('pin') || lower.includes('receive') || lower.includes('won') || lower.includes('refund') || lower.includes('pay') || lower.includes('send') || lower.includes('@'))) {
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

    // 3. Check for OTP / Social Engineering / SMS Lures
    const isOtpInquiry = lower.includes('otp') || lower.includes('one time password') || lower.includes('verification code') ||
                         lower.includes('suspended') || lower.includes('blocked') || lower.includes('electricity cutoff') ||
                         lower.includes('kyc') || lower.includes('debit card block') || /\b\d{4,8}\b/.test(trimmed);

    if (isOtpInquiry && (lower.includes('otp') || lower.includes('share') || lower.includes('code') || lower.includes('verify') || lower.includes('account') || lower.includes('bank'))) {
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

    // 4. Clarification / FAQ / General Security Knowledge
    const generalReply = ChatAdvisor.generateGeneralAdvisory(lower, trimmed);

    return {
      reply: generalReply.reply,
      detectedType: 'GENERAL',
      riskScore: generalReply.riskScore,
      riskLevel: generalReply.riskLevel,
      resultStatus: 'SAFE',
      reasons: generalReply.topics,
      recommendation: generalReply.recommendation,
      maskedInput: trimmed.length > 70 ? trimmed.substring(0, 67) + '...' : trimmed,
      isThreatCheck: generalReply.recordScan
    };
  }

  private static generateGeneralAdvisory(lower: string, original: string): {
    reply: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    topics: string[];
    recommendation: string;
    recordScan: boolean;
  } {
    // A. Shared OTP by mistake / Compromise emergency
    if (lower.includes('shared otp') || lower.includes('gave otp') || lower.includes('compromised') || lower.includes('hacked') || lower.includes('money deducted') || lower.includes('fraud call')) {
      return {
        reply: `### 🚨 Emergency Response: Potential Account Compromise\n\nIf you have shared an OTP or suspect your bank account is compromised, execute these steps **IMMEDIATELY**:\n\n1. **Freeze Your Bank Accounts & Cards**:\n   - Call your bank's official 24/7 fraud helpline immediately.\n   - Use your mobile banking app to toggle "Card Lock" or "Disable Online/International Transactions".\n2. **Reset Banking & Email Passwords**:\n   - Change your net banking password and UPI PIN on a clean, trusted device.\n   - Ensure 2-Factor Authentication (2FA) is active on your primary email.\n3. **Lodge an Official Cyber Crime Complaint**:\n   - **India**: Call national helpline **1930** immediately to freeze funds in transit, and register at **[cybercrime.gov.in](https://cybercrime.gov.in)**.\n   - **US/Global**: File an IC3 report at **[ic3.gov](https://www.ic3.gov)** or contact your local cyber cell.\n4. **Revoke Remote Access Apps**:\n   - If instructed to install AnyDesk, TeamViewer, or RustDesk, uninstall them and restart your phone.\n\n*Would you like me to analyze a specific message or phone number you received?*`,
        riskScore: 70,
        riskLevel: 'HIGH',
        topics: ['Incident Response', 'Compromise Triage', 'OTP Theft Mitigation'],
        recommendation: 'Freeze accounts immediately, call national helpline 1930, and reset all net banking passwords.',
        recordScan: true
      };
    }

    // B. How to spot phishing URLs
    if (lower.includes('spot') || lower.includes('identify') || lower.includes('phishing') || lower.includes('fake url') || lower.includes('typosquatting') || lower.includes('suspicious link')) {
      return {
        reply: `### 🔍 How to Spot Phishing & Fraudulent URLs\n\nScammers use subtle tricks to impersonate trusted platforms. Here is your inspection checklist:\n\n1. **Check the Exact Domain Name**:\n   - Scammers rely on typosquatting (e.g. \`paypa1.com\`, \`micros0ft.co\`, \`goog1e.xyz\`). Look closely at letters like \`l\` vs \`1\`, \`o\` vs \`0\`.\n2. **Inspect Subdomain Stacking**:\n   - A URL like \`paypal.com.account-verify.xyz\` is actually hosted on **\`account-verify.xyz\`**, NOT PayPal!\n3. **Beware of High-Risk & Free TLDs**:\n   - Domains ending in \`.xyz\`, \`.top\`, \`.buzz\`, \`.work\`, \`.click\`, or \`.tk\` are statistically favored by cybercrime rings.\n4. **Raw IP Addresses**:\n   - Legitimate enterprises never ask customers to log in via raw IP addresses like \`http://192.168.1.1/login\`.\n5. **Use Cyber Shield's URL Scanner**:\n   - Paste any link into our [URL Scanner](/scan/url) for real-time 0–100 risk scoring and heuristic breakdown!`,
        riskScore: 10,
        riskLevel: 'LOW',
        topics: ['Phishing Detection Guide', 'Domain Verification', 'Typosquatting Education'],
        recommendation: 'Always examine the root domain before the first slash; paste suspicious links into Cyber Shield URL Scanner.',
        recordScan: true
      };
    }

    // C. QR Code scams
    if (lower.includes('qr') || lower.includes('barcode') || lower.includes('scan')) {
      return {
        reply: `### 📸 QR Code Scams (Quishing) Explained\n\nQR codes simply encode text or URLs. Scammers exploit them because humans cannot visually read the encoded payload:\n\n1. **The "Scan to Receive Money" Scam**:\n   - Scammers send a QR code claiming: *"Scan this QR code and enter your PIN to receive your OLX payment or prize money."*\n   - **Reality**: Scanning and entering a PIN **deducts** money from your account.\n2. **Malicious Link Redirection**:\n   - Physical stickers placed over legitimate QR codes on parking meters, restaurants, or payment desks that redirect to phishing sites.\n3. **Safe Scanning with Cyber Shield**:\n   - Use our [QR Multi-Scheme Scanner](/scan/qr) to safely decode and sandbox any QR image via upload or webcam before visiting it.`,
        riskScore: 15,
        riskLevel: 'LOW',
        topics: ['QR Code Safety', 'Quishing Analysis', 'UPI QR Fraud'],
        recommendation: 'Never scan a QR code to receive funds; use Cyber Shield QR Scanner to inspect payloads safely.',
        recordScan: true
      };
    }

    // D. About Cyber Shield
    if (lower.includes('who are you') || lower.includes('what is cyber shield') || lower.includes('features') || lower.includes('how does this work')) {
      return {
        reply: `### 🛡️ Welcome to Cyber Shield AI\n\nI am **CyberBot**, your digital defense and threat intelligence assistant within **Cyber Shield**.\n\nCyber Shield protects users and organizations from digital deception across 4 core vectors:\n- 🌐 **[URL Phishing Scanner](/scan/url)**: Typosquatting, Punycode, raw IP hosts, and disposable TLD detection.\n- 📸 **[QR Code Triage](/scan/qr)**: In-browser sandboxed optical payload decoding.\n- 🛡️ **[OTP Scam Shield](/scan/otp)**: Urgency detection with automatic numeric masking (\`••••••\`) for privacy.\n- 💳 **[UPI Fraud Detector](/scan/upi)**: VPA analysis and reverse debit collect-trap defense.\n\nAll your threat inspections are securely recorded in your [Audit History](/history). You can ask me anything about cybersecurity, or paste any suspicious message here for immediate verification!`,
        riskScore: 0,
        riskLevel: 'LOW',
        topics: ['Platform Capabilities', 'Security Architecture', 'Cyber Shield Overview'],
        recommendation: 'Explore scanners across URLs, QR codes, OTP texts, and UPI payment schemes.',
        recordScan: false
      };
    }

    // E. General fallback security advice
    return {
      reply: `### 🛡️ Cyber Shield Intelligence\n\nI have reviewed your inquiry: *"**${original.length > 80 ? original.substring(0, 77) + '...' : original}**"*\n\nHere are core security principles to follow:\n- 🔑 **Never share OTPs, passwords, or PINs**: No legitimate bank, technical support, or government entity will ever ask for them.\n- 🔗 **Verify before clicking**: Look closely at domain names before opening unknown links or inputting credentials.\n- 💳 **Entering a UPI PIN transfers funds out**: Never enter a PIN to receive a payment or refund.\n- ⚡ **Beware of artificial urgency**: Scammers create panic ("act within 10 minutes", "account blocked today") to bypass rational thinking.\n\n*Tip: You can paste any link, SMS, WhatsApp message, or UPI VPA directly into this chat for instant vulnerability analysis!*`,
      riskScore: 5,
      riskLevel: 'LOW',
      topics: ['General Security Advisory', 'Cyber Awareness'],
      recommendation: 'Verify digital requests via official banking portals or run them through Cyber Shield scanners.',
      recordScan: true
    };
  }
}
