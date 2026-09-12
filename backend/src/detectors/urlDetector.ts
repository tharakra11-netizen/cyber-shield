import { ThreatIntelligenceService, ThreatIntelligenceMatch } from '../services/threatIntelligence.js';

export interface DetectionSignal {
  id: string;
  name: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scoreImpact: number;
  description: string;
}

export interface DetectionResult {
  status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  signals: DetectionSignal[];
  recommendation: string;
  metadata: Record<string, any>;
  analysisMethod: string;
}

// Prominent targeted brands for spoofing detection
const TARGET_BRANDS = [
  'paypal', 'google', 'microsoft', 'apple', 'amazon', 'netflix',
  'facebook', 'instagram', 'whatsapp', 'telegram', 'sbi', 'hdfc',
  'icici', 'axis', 'paytm', 'phonepe', 'wellsfargo', 'chase', 'bankofamerica'
];

// Top abused and high-risk TLDs
const HIGH_RISK_TLDS = new Set([
  'xyz', 'top', 'work', 'buzz', 'surf', 'click', 'gq', 'cf', 'ml', 'tk',
  'ga', 'link', 'fit', 'icu', 'cam', 'country', 'stream', 'loan', 'racing', 'download'
]);

// Well known URL shorteners
const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'ow.ly', 'rb.gy', 'cutt.ly', 'tiny.cc', 'bl.ink'
]);

// Suspicious security / auth keywords
const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'account-update', 'security-alert',
  'banking', 'update-billing', 'confirm-identity', 'credential', 'wallet-connect',
  'free-gift', 'lottery', 'winner', 'prize', 'kyc-update', 'pan-link'
];

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export class UrlDetector {
  public static analyze(rawUrl: string, threatMatchOverride?: ThreatIntelligenceMatch): DetectionResult {
    let cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'http://' + cleanUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return {
        status: 'UNKNOWN',
        riskScore: 65,
        confidenceScore: 90,
        riskLevel: 'HIGH',
        reasons: ['Malformed or invalid URL structure provided'],
        signals: [{
          id: 'INVALID_URL_SYNTAX',
          name: 'Invalid URL Format',
          severity: 'HIGH',
          scoreImpact: 65,
          description: 'The supplied target could not be parsed as a standard RFC compliant URL.'
        }],
        recommendation: 'Do not attempt to load or execute this address as it may exploit parser vulnerabilities.',
        metadata: { rawInput: rawUrl },
        analysisMethod: 'Syntactic Validation Engine'
      };
    }

    const signals: DetectionSignal[] = [];
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    const fullUrl = parsedUrl.toString().toLowerCase();

    // 0. External Threat Intelligence Feed Check
    const threatMatch = threatMatchOverride || ThreatIntelligenceService.checkKnownThreatGrid(hostname);
    if (threatMatch.isThreat) {
      signals.push({
        id: 'EXTERNAL_THREAT_FEED_MATCH',
        name: `Threat Intelligence Grid: ${threatMatch.threatType || 'Phishing Signature'}`,
        severity: 'CRITICAL',
        scoreImpact: threatMatch.scoreImpact || 85,
        description: threatMatch.details || `Identified by ${threatMatch.provider} as an active malicious campaign.`
      });
    }

    // 1. IP address based URL check
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      signals.push({
        id: 'IP_ADDRESS_HOSTNAME',
        name: 'Direct IP Address Host',
        severity: 'CRITICAL',
        scoreImpact: 45,
        description: `Host '${hostname}' uses a raw IP address instead of a registered domain name.`
      });
    }

    // 2. Protocol check (Insecure HTTP)
    if (parsedUrl.protocol === 'http:') {
      signals.push({
        id: 'INSECURE_HTTP_PROTOCOL',
        name: 'Unencrypted Protocol (HTTP)',
        severity: 'MEDIUM',
        scoreImpact: 20,
        description: 'Connection is not encrypted using TLS/HTTPS, allowing potential credential interception.'
      });
    }

    // 3. High-Risk TLD check
    const parts = hostname.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';
    if (HIGH_RISK_TLDS.has(tld)) {
      signals.push({
        id: 'HIGH_RISK_TLD',
        name: `High-Risk TLD (.${tld})`,
        severity: 'HIGH',
        scoreImpact: 30,
        description: `The top-level domain '.${tld}' is frequently associated with disposable phishing campaigns.`
      });
    }

    // 4. Punycode / IDN Homograph lookalike
    if (hostname.startsWith('xn--') || hostname.includes('.xn--')) {
      signals.push({
        id: 'PUNYCODE_HOMOGRAPH',
        name: 'Punycode / Homograph Impersonation',
        severity: 'CRITICAL',
        scoreImpact: 40,
        description: 'Domain utilizes internationalized punycode encoding which can disguise character spoofing.'
      });
    }

    // 5. Excessive subdomains
    if (parts.length >= 4 && !ipv4Regex.test(hostname)) {
      signals.push({
        id: 'EXCESSIVE_SUBDOMAINS',
        name: 'Excessive Subdomain Stacking',
        severity: 'MEDIUM',
        scoreImpact: 15,
        description: `Domain has ${parts.length} segments, a technique frequently used to mask legitimate base domains.`
      });
    }

    // 6. Known URL Shortener
    if (URL_SHORTENERS.has(hostname)) {
      signals.push({
        id: 'URL_SHORTENER_DETECTED',
        name: 'URL Shortener Gateway',
        severity: 'MEDIUM',
        scoreImpact: 25,
        description: `The link routes through shortener '${hostname}', which deliberately obscures the final destination.`
      });
    }

    // 7. Brand Impersonation & Typosquatting
    let brandDetected: string | null = null;
    for (const brand of TARGET_BRANDS) {
      // Check if brand is in subdomains or path while base domain is NOT the brand's official domain
      const baseDomain = parts.slice(-2).join('.');
      const officialDomain = `${brand}.com`;

      if (hostname.includes(brand) && baseDomain !== officialDomain && !hostname.endsWith(`.${brand}.com`)) {
        brandDetected = brand;
        signals.push({
          id: 'BRAND_IMPERSONATION_SUBDOMAIN',
          name: `Brand Impersonation (${brand.toUpperCase()})`,
          severity: 'CRITICAL',
          scoreImpact: 45,
          description: `Target name references '${brand}' but resolves under an unrelated domain (${baseDomain}).`
        });
        break;
      }

      // Check typosquatting on base domain label
      const baseLabel = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
      if (baseLabel !== brand && baseLabel.length >= 4 && brand.length >= 4) {
        const distance = levenshteinDistance(baseLabel, brand);
        if (distance === 1) {
          brandDetected = brand;
          signals.push({
            id: 'TYPOSQUATTING_DOMAIN',
            name: `Typosquatting Detected (${brand.toUpperCase()} Lookalike)`,
            severity: 'CRITICAL',
            scoreImpact: 45,
            description: `Domain label '${baseLabel}' is a near-identical character permutation of trusted brand '${brand}'.`
          });
          break;
        }
      }
    }

    // 8. Suspicious keywords in path/subdomain
    const matchedKeywords: string[] = [];
    for (const kw of SUSPICIOUS_KEYWORDS) {
      if (fullUrl.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }
    if (matchedKeywords.length >= 2) {
      signals.push({
        id: 'SUSPICIOUS_AUTH_KEYWORDS',
        name: 'Credential Harvesting Keywords',
        severity: 'HIGH',
        scoreImpact: 25,
        description: `URL path contains multiple high-risk credential keywords: [${matchedKeywords.join(', ')}].`
      });
    } else if (matchedKeywords.length === 1) {
      signals.push({
        id: 'AUTH_KEYWORD_PRESENT',
        name: 'Authentication Keyword in Path',
        severity: 'LOW',
        scoreImpact: 10,
        description: `URL contains sensitive action keyword '${matchedKeywords[0]}'.`
      });
    }

    // 9. Excessive URL length
    if (cleanUrl.length > 100) {
      signals.push({
        id: 'ABNORMAL_URL_LENGTH',
        name: 'Abnormally Long URL',
        severity: 'LOW',
        scoreImpact: 10,
        description: `URL contains ${cleanUrl.length} characters, often used to hide tokens or overflow address bars.`
      });
    }

    // 10. Multiple @ symbols or authentication trickery in URL
    if (rawUrl.includes('@')) {
      signals.push({
        id: 'CREDENTIAL_EMBEDDING_ATTEMPT',
        name: 'Embedded Userinfo / @ Symbol',
        severity: 'HIGH',
        scoreImpact: 35,
        description: "The URL contains '@' which can fool browsers into navigating to a different destination than what appears."
      });
    }

    // Calculate aggregated score
    let totalScore = signals.reduce((acc, sig) => acc + sig.scoreImpact, 0);
    // Baseline safe score adjustment if standard HTTPS clean domain
    if (signals.length === 0) {
      totalScore = 5; // Clean baseline
    }
    totalScore = Math.min(100, Math.max(0, totalScore));

    // Determine status & risk level
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

    // Build human-friendly reasons
    const reasons = signals.map(s => `[${s.severity}] ${s.name}: ${s.description}`);
    if (reasons.length === 0) {
      reasons.push('Standard HTTPS URL with no known phishing patterns, typosquatting, or high-risk TLD anomalies.');
    }

    // Construct recommendation
    let recommendation = 'URL demonstrates low risk indicators. Proceed normally, but never share master passwords or OTPs.';
    if (status === 'MALICIOUS') {
      recommendation = 'DO NOT visit this link or input credentials. This URL displays active deception and phishing indicators.';
    } else if (status === 'SUSPICIOUS') {
      recommendation = 'Exercise caution. Verify the sender through an official, out-of-band channel before entering any details.';
    }

    return {
      status,
      riskScore: totalScore,
      confidenceScore: signals.length > 0 ? 88 : 80,
      riskLevel,
      reasons,
      signals,
      recommendation,
      metadata: {
        domain: hostname,
        tld,
        protocol: parsedUrl.protocol.replace(':', ''),
        pathLength: pathname.length,
        hasIpHost: ipv4Regex.test(hostname),
        brandDetected,
        totalSignalsTriggered: signals.length,
        threatFeed: {
          checked: true,
          provider: threatMatch.provider,
          matched: threatMatch.isThreat,
          threatType: threatMatch.threatType || null
        }
      },
      analysisMethod: 'Multi-Vector Heuristic & Global Threat Intelligence Grid'
    };
  }

  public static async analyzeAsync(rawUrl: string): Promise<DetectionResult> {
    const threatMatch = await ThreatIntelligenceService.queryLiveFeeds(rawUrl);
    return this.analyze(rawUrl, threatMatch);
  }
}
