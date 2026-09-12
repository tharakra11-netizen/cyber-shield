import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cyber Shield database with comprehensive multi-user telemetry...');

  // 1. Clean existing records to allow repeatable seeding
  await prisma.loginSession.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.scan.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Tharak', salt);
  const userPasswordHash = await bcrypt.hash('User@123456', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Security Admin',
      email: 'admin@cybershield.io',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'Alex Vance',
      email: 'user@cybershield.io',
      passwordHash: userPasswordHash,
      role: 'USER',
      isActive: true,
      isVerified: true
    }
  });

  console.log(`Created users: Admin (${admin.email}) and Regular User (${user.email})`);

  // 3. Create Realistic Login Sessions for Both Users
  await prisma.loginSession.createMany({
    data: [
      {
        userId: admin.id,
        userName: admin.name,
        userEmail: admin.email,
        device: 'Chrome 128 on Windows 11',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 mins ago
      },
      {
        userId: admin.id,
        userName: admin.name,
        userEmail: admin.email,
        device: 'Safari on macOS Workstation',
        ipAddress: '172.16.0.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
      },
      {
        userId: admin.id,
        userName: admin.name,
        userEmail: admin.email,
        device: 'Edge on Windows 11',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/128.0.0.0',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        device: 'Edge on Windows 11',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/128.0.0.0',
        createdAt: new Date(Date.now() - 1000 * 60 * 35) // 35 mins ago
      },
      {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        device: 'Safari on iPhone',
        ipAddress: '172.16.0.4',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        device: 'Chrome on Android Mobile',
        ipAddress: '192.168.29.45',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0.0.0 Mobile Safari/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26) // yesterday
      }
    ]
  });

  // 4. Create Multi-Vector Scans: At least 2 searches in EACH section for BOTH Admin and User!
  const sampleScans = [
    // --- ADMIN SCANS ---
    // Section: URL (Admin)
    {
      userId: admin.id,
      type: 'URL',
      inputHash: 'admin_url_1',
      maskedInput: 'https://paypa1-security.xyz/login/verify-identity',
      resultStatus: 'MALICIOUS',
      riskScore: 85,
      confidenceScore: 96,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] Typosquatting Brand Impersonation: Domain paypa1 mimics PayPal',
        '[HIGH] Disposable High-Risk TLD: TLD .xyz frequently deployed in phishing campaigns',
        '[LOW] Sensitive Action Keyword: URL contains login path'
      ]),
      recommendation: 'DO NOT visit this link. Active credential harvesting attack vector detected.',
      metadata: JSON.stringify({ domain: 'paypa1-security.xyz', protocol: 'https', brandDetected: 'paypal' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 25)
    },
    {
      userId: admin.id,
      type: 'URL',
      inputHash: 'admin_url_2',
      maskedInput: 'https://portal.azure.com/#home',
      resultStatus: 'SAFE',
      riskScore: 0,
      confidenceScore: 99,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        'Legitimate trusted domain with authentic enterprise SSL certificates and no phishing indicators.'
      ]),
      recommendation: 'Legitimate enterprise cloud resource. Safe to navigate.',
      metadata: JSON.stringify({ domain: 'portal.azure.com', protocol: 'https', brandDetected: 'microsoft' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 120)
    },
    // Section: QR (Admin)
    {
      userId: admin.id,
      type: 'QR',
      inputHash: 'admin_qr_1',
      maskedInput: 'https://malicious-qr-payload.top/verify-admin-session',
      resultStatus: 'MALICIOUS',
      riskScore: 82,
      confidenceScore: 92,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[HIGH] High-Risk TLD (.top): Disproportionate association with malware and phishing',
        '[CRITICAL] Quishing Scheme: Disguised optical redirect targeting admin session credentials'
      ]),
      recommendation: 'Do not scan or open this QR code. Destination redirects to untrusted host.',
      metadata: JSON.stringify({ scannedMedium: 'QR_CODE', payloadType: 'HYPERLINK' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 50)
    },
    {
      userId: admin.id,
      type: 'QR',
      inputHash: 'admin_qr_2',
      maskedInput: 'WIFI:T:WPA;S:Corporate_SOC_Secure;P:CyberShield2025;;',
      resultStatus: 'SAFE',
      riskScore: 0,
      confidenceScore: 95,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        'Standard WiFi network configuration payload with WPA/WPA2 security encryption.'
      ]),
      recommendation: 'Safe to connect on internal office networks.',
      metadata: JSON.stringify({ scannedMedium: 'QR_CODE', payloadType: 'WIFI' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 180)
    },
    // Section: OTP (Admin)
    {
      userId: admin.id,
      type: 'OTP',
      inputHash: 'admin_otp_1',
      maskedInput: 'URGENT: State Bank account suspended. Share verification code •••••• immediately with cyber desk to restore access.',
      resultStatus: 'MALICIOUS',
      riskScore: 90,
      confidenceScore: 95,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] Coercive Account Suspension Threat: Psychological urgency tactic',
        '[CRITICAL] OTP Sharing Request: Illegal solicitation of authentication token'
      ]),
      recommendation: 'DO NOT share this code. Banks will NEVER ask you to dictate an OTP.',
      metadata: JSON.stringify({ maskedOtpCount: 1, hasThreatKeywords: true }),
      createdAt: new Date(Date.now() - 1000 * 60 * 40)
    },
    {
      userId: admin.id,
      type: 'OTP',
      inputHash: 'admin_otp_2',
      maskedInput: 'Your ICICI Bank netbanking OTP is •••••• for INR 4,500.00. Valid for 5 mins. Do not share with anyone.',
      resultStatus: 'SAFE',
      riskScore: 10,
      confidenceScore: 92,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        '[INFO] Standard Bank Security Notice: Explicitly instructs customer not to share OTP'
      ]),
      recommendation: 'Standard transactional verification. Keep private.',
      metadata: JSON.stringify({ maskedOtpCount: 1, hasThreatKeywords: false }),
      createdAt: new Date(Date.now() - 1000 * 60 * 240)
    },
    // Section: UPI (Admin)
    {
      userId: admin.id,
      type: 'UPI',
      inputHash: 'admin_upi_1',
      maskedInput: 'Refund of Rs 7,500 pending. Enter your UPI PIN to claim cashback immediately. VPA: refunds.care@okaxis',
      resultStatus: 'MALICIOUS',
      riskScore: 95,
      confidenceScore: 98,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] PIN-to-Receive Trap: Entering PIN transfers money OUT, never receives funds',
        '[HIGH] Spoofed Customer Care VPA: Uses deceptive refunds.care handle'
      ]),
      recommendation: 'DECLINE AND REPORT. Never enter a PIN to receive payments.',
      metadata: JSON.stringify({ payeeVpa: 'refunds.care@okaxis', spoofedVpaFound: true }),
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      userId: admin.id,
      type: 'UPI',
      inputHash: 'admin_upi_2',
      maskedInput: 'upi://pay?pa=aws.billing@icici&pn=AmazonWebServices&am=1250.00&cu=INR',
      resultStatus: 'SAFE',
      riskScore: 5,
      confidenceScore: 90,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        '[INFO] Legitimate Commercial Payment Request: Valid merchant payment descriptor'
      ]),
      recommendation: 'Verify payment amount on screen before authorizing.',
      metadata: JSON.stringify({ isUpiUri: true, payeeVpa: 'aws.billing@icici' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 300)
    },
    // Section: CHAT / CyberBot AI (Admin)
    {
      userId: admin.id,
      type: 'CHAT',
      inputHash: 'admin_chat_1',
      maskedInput: 'Is http://micros0ft-support.buzz/fix-ransomware safe to open?',
      resultStatus: 'MALICIOUS',
      riskScore: 85,
      confidenceScore: 95,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] Typosquatting Lookalike: micros0ft mimics Microsoft',
        '[HIGH] Disposable TLD: .buzz top level domain is flagged as dangerous'
      ]),
      recommendation: 'DO NOT visit. Active phishing and fake technical support scam detected.',
      metadata: JSON.stringify({ source: 'CYBERBOT_AI', detectedType: 'URL' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      userId: admin.id,
      type: 'CHAT',
      inputHash: 'admin_chat_2',
      maskedInput: 'How to respond to ransomware attack on enterprise servers?',
      resultStatus: 'SAFE',
      riskScore: 15,
      confidenceScore: 90,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        'Incident response protocol inquiry: Isolate network, disconnect backups, notify CERT-In / CISA.'
      ]),
      recommendation: 'Review Cyber Shield Enterprise Incident Response checklist.',
      metadata: JSON.stringify({ source: 'CYBERBOT_AI', detectedType: 'GENERAL' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 90)
    },

    // --- STANDARD USER SCANS (Alex Vance) ---
    // Section: URL (User)
    {
      userId: user.id,
      type: 'URL',
      inputHash: 'user_url_1',
      maskedInput: 'http://192.168.1.105/paypal-login/verify.html',
      resultStatus: 'MALICIOUS',
      riskScore: 92,
      confidenceScore: 95,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] Direct IP Address Host: Host uses raw IP address instead of registered domain',
        '[CRITICAL] Brand Impersonation: Target name references PayPal on unrelated host',
        '[HIGH] Credential Harvesting Keywords: URL contains login and verify parameters'
      ]),
      recommendation: 'DO NOT visit this link or input credentials.',
      metadata: JSON.stringify({ domain: '192.168.1.105', protocol: 'http', brandDetected: 'paypal' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      userId: user.id,
      type: 'URL',
      inputHash: 'user_url_2',
      maskedInput: 'https://github.com/explore',
      resultStatus: 'SAFE',
      riskScore: 5,
      confidenceScore: 85,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        'Standard HTTPS URL with no known phishing patterns or anomalies.'
      ]),
      recommendation: 'URL demonstrates low risk indicators. Proceed normally.',
      metadata: JSON.stringify({ domain: 'github.com', protocol: 'https', brandDetected: null }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
    },
    // Section: QR (User)
    {
      userId: user.id,
      type: 'QR',
      inputHash: 'user_qr_1',
      maskedInput: 'https://secure-login-account-update.buzz/auth?session=9284',
      resultStatus: 'MALICIOUS',
      riskScore: 80,
      confidenceScore: 90,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[HIGH] High-Risk TLD (.buzz): Frequently associated with disposable phishing campaigns',
        '[HIGH] Credential Harvesting Keywords: Path contains login, account, and auth parameters'
      ]),
      recommendation: 'Do not scan or browse this QR destination.',
      metadata: JSON.stringify({ scannedMedium: 'QR_CODE', payloadType: 'HYPERLINK' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
    },
    {
      userId: user.id,
      type: 'QR',
      inputHash: 'user_qr_2',
      maskedInput: 'upi://pay?pa=restaurant.billing@okaxis&pn=Dinner&am=1200&cu=INR',
      resultStatus: 'SAFE',
      riskScore: 5,
      confidenceScore: 90,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        '[INFO] Valid Merchant QR Payload: Optical bill settlement QR code'
      ]),
      recommendation: 'Safe restaurant invoice QR code. Confirm total before entering PIN.',
      metadata: JSON.stringify({ scannedMedium: 'QR_CODE', payloadType: 'UPI_PAYMENT_URI' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
    },
    // Section: OTP (User)
    {
      userId: user.id,
      type: 'OTP',
      inputHash: 'user_otp_1',
      maskedInput: 'Dear Customer, your electricity will be disconnected tonight at 9:30 PM. Call officer at 9876543210 and share verification OTP •••••• immediately.',
      resultStatus: 'MALICIOUS',
      riskScore: 88,
      confidenceScore: 94,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] Urgent OTP Sharing Demand: Message asks recipient to read OTP to caller',
        '[HIGH] Coercive Suspension Threat: Threatens immediate utility disconnection'
      ]),
      recommendation: 'DO NOT SHARE ANY CODE OR CALL THE NUMBER.',
      metadata: JSON.stringify({ maskedOtpCount: 1, hasThreatKeywords: true }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
    },
    {
      userId: user.id,
      type: 'OTP',
      inputHash: 'user_otp_2',
      maskedInput: 'Your HDFC Bank netbanking OTP is •••••• for INR 1,250.00. Valid for 10 mins. DO NOT SHARE with anyone including bank staff.',
      resultStatus: 'SAFE',
      riskScore: 10,
      confidenceScore: 90,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        '[INFO] Standard Security Warning: Message cautions recipient never to share OTP'
      ]),
      recommendation: 'Standard verification message. Keep private.',
      metadata: JSON.stringify({ maskedOtpCount: 1, hasThreatKeywords: false }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
    },
    // Section: UPI (User)
    {
      userId: user.id,
      type: 'UPI',
      inputHash: 'user_upi_1',
      maskedInput: 'UPI Collect Request of ₹4,999 from support.sbi.refund@okhdfcbank. Please enter your 6-digit UPI PIN to claim your refund.',
      resultStatus: 'MALICIOUS',
      riskScore: 95,
      confidenceScore: 98,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] PIN-to-Receive Trap: Fraudulent claim that entering PIN credits money',
        '[HIGH] Deceptive VPA Identity: Spoofed official bank keywords in handle'
      ]),
      recommendation: 'DECLINE IMMEDIATELY. Entering your PIN transfers money out.',
      metadata: JSON.stringify({ payeeVpa: 'support.sbi.refund@okhdfcbank', spoofedVpaFound: true }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7)
    },
    {
      userId: user.id,
      type: 'UPI',
      inputHash: 'user_upi_2',
      maskedInput: 'upi://pay?pa=starbucks.merchant@icici&pn=Starbucks&am=350.00&cu=INR',
      resultStatus: 'SAFE',
      riskScore: 5,
      confidenceScore: 88,
      riskLevel: 'LOW',
      reasons: JSON.stringify([
        '[INFO] Standard UPI Payment Intent: Valid merchant payment request to Starbucks'
      ]),
      recommendation: 'Verify payee details on payment screen before approving.',
      metadata: JSON.stringify({ isUpiUri: true, payeeVpa: 'starbucks.merchant@icici' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9)
    },
    // Section: CHAT / CyberBot AI (User)
    {
      userId: user.id,
      type: 'CHAT',
      inputHash: 'user_chat_1',
      maskedInput: 'Is https://paypa1.xyz/account safe to click on my phone?',
      resultStatus: 'MALICIOUS',
      riskScore: 85,
      confidenceScore: 94,
      riskLevel: 'CRITICAL',
      reasons: JSON.stringify([
        '[CRITICAL] Typosquatting Detected: paypa1 substitutes number 1 for letter l',
        '[HIGH] High-Risk TLD (.xyz): Untrusted phishing campaign domain'
      ]),
      recommendation: 'DO NOT open this link on your phone. Discard immediately.',
      metadata: JSON.stringify({ source: 'CYBERBOT_AI', detectedType: 'URL' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1)
    },
    {
      userId: user.id,
      type: 'CHAT',
      inputHash: 'user_chat_2',
      maskedInput: 'Someone on OLX told me to enter my UPI PIN to receive money for an old sofa. Is this legitimate?',
      resultStatus: 'MALICIOUS',
      riskScore: 70,
      confidenceScore: 95,
      riskLevel: 'HIGH',
      reasons: JSON.stringify([
        '[CRITICAL] PIN-to-Receive Fraud: Entering PIN is exclusively used to deduct funds',
        '[HIGH] Secondhand Marketplace Scam Pattern: Classic OLX/Quikr reverse collect trap'
      ]),
      recommendation: 'DO NOT ENTER PIN. Block the buyer immediately. You never need a PIN to receive funds.',
      metadata: JSON.stringify({ source: 'CYBERBOT_AI', detectedType: 'UPI' }),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
    }
  ];

  for (const scanData of sampleScans) {
    await prisma.scan.create({ data: scanData });
  }

  // 5. Create Sample Audit Log
  await prisma.auditLog.create({
    data: {
      adminUserId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'SYSTEM',
      targetId: 'GLOBAL',
      metadata: JSON.stringify({ version: '1.0.0', seedRecordsCount: sampleScans.length })
    }
  });

  console.log(`Database successfully seeded with ${sampleScans.length} scans (10 for Admin, 10 for User across all 5 sections) and 6 login sessions!`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
