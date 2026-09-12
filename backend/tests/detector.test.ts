import { UrlDetector } from '../src/detectors/urlDetector.js';
import { OtpDetector } from '../src/detectors/otpDetector.js';
import { UpiDetector } from '../src/detectors/upiDetector.js';
import { QrDetector } from '../src/detectors/qrDetector.js';
import { ChatAdvisor } from '../src/detectors/chatAdvisor.js';
import { signResetToken, verifyResetToken } from '../src/utils/jwt.js';
import { ThreatIntelligenceService } from '../src/services/threatIntelligence.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n--- RUNNING CYBER SHIELD ENGINE TESTS ---\n');

  // Test 1: URL Detection - IP Address Host
  console.log('[Test Suite 1: URL Phishing Detector]');
  const ipResult = UrlDetector.analyze('http://192.168.1.50/banking/login');
  assert(ipResult.status === 'MALICIOUS', 'IP host flagged as MALICIOUS');
  assert(ipResult.riskScore >= 50, 'IP host has high risk score (>=50)', `Got ${ipResult.riskScore}`);
  assert(ipResult.signals.some(s => s.id === 'IP_ADDRESS_HOSTNAME'), 'Detected IP_ADDRESS_HOSTNAME signal');

  // Test 2: URL Detection - High Risk TLD and Typosquatting
  const typoResult = UrlDetector.analyze('http://paypa1.xyz/verify-identity');
  assert(typoResult.status === 'MALICIOUS', 'Typosquat + .xyz flagged as MALICIOUS');
  assert(typoResult.signals.some(s => s.id === 'HIGH_RISK_TLD'), 'Detected HIGH_RISK_TLD signal');

  // Test 3: URL Detection - Legitimate Safe Domain
  const safeResult = UrlDetector.analyze('https://google.com');
  assert(safeResult.status === 'SAFE', 'Legitimate URL flagged as SAFE');
  assert(safeResult.riskScore < 25, 'Safe URL risk score < 25', `Got ${safeResult.riskScore}`);

  // Test 4: OTP Detection - Urgent Sharing Scam with Auto-Masking
  console.log('\n[Test Suite 2: OTP Scam & Masking Detector]');
  const otpScamMsg = 'Urgent! Your account will be suspended. Call customer care and share OTP 982341 immediately to verify KYC.';
  const otpResult = OtpDetector.analyze(otpScamMsg);
  assert(otpResult.status === 'MALICIOUS', 'Urgent OTP share scam flagged as MALICIOUS');
  assert(otpResult.maskedInput.includes('••••••'), 'OTP is masked with dots in output', otpResult.maskedInput);
  assert(!otpResult.maskedInput.includes('982341'), 'Raw OTP is completely removed from maskedInput');
  assert(otpResult.signals.some(s => s.id === 'OTP_SHARING_REQUEST'), 'Detected OTP_SHARING_REQUEST signal');

  // Test 5: OTP Detection - Legitimate Bank Alert
  const legitOtpMsg = 'Your OTP is 492109 for Rs. 500 txn at Merchant. Valid for 5 mins. Do not share with anyone.';
  const legitOtpResult = OtpDetector.analyze(legitOtpMsg);
  assert(legitOtpResult.status === 'SAFE', 'Legitimate bank OTP warning flagged as SAFE');

  // Test 6: UPI Detection - PIN to Receive Trap
  console.log('\n[Test Suite 3: UPI Fraud Detector]');
  const upiTrapMsg = 'Refund of Rs 3,500 pending. Enter your UPI PIN to receive money in your account.';
  const upiResult = UpiDetector.analyze(upiTrapMsg);
  assert(upiResult.status === 'MALICIOUS', 'PIN-to-receive trap flagged as MALICIOUS');
  assert(upiResult.signals.some(s => s.id === 'PIN_TO_RECEIVE_DECEPTION'), 'Detected PIN_TO_RECEIVE_DECEPTION');

  // Test 7: UPI Detection - Fake Support VPA
  const upiVpaResult = UpiDetector.analyze('Send payment to support.sbi.helpdesk@okaxis for fast KYC');
  assert(upiVpaResult.signals.some(s => s.id === 'SPOOFED_SUPPORT_VPA'), 'Detected SPOOFED_SUPPORT_VPA');

  // Test 8: QR Detection - Routing to Sub-detectors
  console.log('\n[Test Suite 4: QR Multivector Detector]');
  const qrUpiResult = QrDetector.analyzeContent('upi://pay?pa=fraud.support@axis&pn=Refund&am=5000');
  assert(qrUpiResult.qrContentType === 'UPI', 'QR correctly classified as UPI');
  assert(qrUpiResult.signals.some(s => s.id === 'SPOOFED_SUPPORT_VPA'), 'QR analyzed with UPI engine');

  const qrUrlResult = QrDetector.analyzeContent('http://192.168.1.1/login');
  assert(qrUrlResult.qrContentType === 'URL', 'QR correctly classified as URL');
  assert(qrUrlResult.signals.some(s => s.id === 'IP_ADDRESS_HOSTNAME'), 'QR analyzed with URL engine');

  // Test 9: CyberBot AI Chat Advisor
  console.log('\n[Test Suite 5: CyberBot AI Chat Advisor]');
  const chatUrlResult = ChatAdvisor.analyze('Can you check if http://paypa1.xyz/account is dangerous?');
  assert(chatUrlResult.detectedType === 'URL', 'Chat recognized embedded URL vector');
  assert(chatUrlResult.resultStatus === 'MALICIOUS', 'Chat flagged typosquat URL as MALICIOUS');
  assert(chatUrlResult.isThreatCheck === true, 'Chat marked threat check for history logging');

  const chatOtpResult = ChatAdvisor.analyze('Someone told me to share my OTP 584910 urgently to unfreeze my bank account');
  assert(chatOtpResult.detectedType === 'OTP', 'Chat recognized social engineering OTP vector');
  assert(chatOtpResult.maskedInput.includes('••••••'), 'Chat auto-masked OTP in audit input');

  const chatFaqResult = ChatAdvisor.analyze('How do I spot a phishing URL?');
  assert(chatFaqResult.detectedType === 'GENERAL', 'Chat recognized general cybersecurity guidance');
  assert(chatFaqResult.reply.toLowerCase().includes('typosquatting'), 'Chat provides actionable educational guidance');

  // Test 10: Password Reset Cryptographic Token Security
  console.log('\n[Test Suite 6: Password Reset Security Token]');
  const resetToken = signResetToken('user-123-uuid', 'operator@cybershield.io');
  assert(typeof resetToken === 'string' && resetToken.length > 20, 'Password reset token generated');
  
  const decodedToken = verifyResetToken(resetToken);
  assert(decodedToken !== null, 'Valid reset token decodes successfully');
  assert(decodedToken?.userId === 'user-123-uuid', 'Reset token preserves userId integrity');
  assert(decodedToken?.purpose === 'password_reset', 'Reset token enforces strict password_reset purpose');
  
  const tamperedToken = verifyResetToken(resetToken + 'tampered');
  assert(tamperedToken === null, 'Tampered reset token is rejected');

  // Test 11: Global Threat Intelligence Grid
  console.log('\n[Test Suite 7: Global Threat Intelligence Grid]');
  const threatCheck = ThreatIntelligenceService.checkKnownThreatGrid('paypa1-security.xyz');
  assert(threatCheck.isThreat === true, 'Known threat domain identified in Threat Grid');
  assert(threatCheck.threatType === 'CREDENTIAL_HARVESTING', 'Correct threat signature classification');

  const safeCheck = ThreatIntelligenceService.checkKnownThreatGrid('google.com');
  assert(safeCheck.isThreat === false, 'Legitimate domain returns clean reputation');

  const urlWithThreat = UrlDetector.analyze('https://paypa1-security.xyz/login');
  assert(urlWithThreat.signals.some(s => s.id === 'EXTERNAL_THREAT_FEED_MATCH'), 'URL detector incorporates EXTERNAL_THREAT_FEED_MATCH signal');
  assert(urlWithThreat.metadata.threatFeed.matched === true, 'Metadata records threat feed attribution');

  // Summary
  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

