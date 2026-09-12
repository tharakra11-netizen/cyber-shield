export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  scanCount?: number;
}

export type ThreatSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ScanType = 'URL' | 'QR' | 'OTP' | 'UPI' | 'CHAT';
export type ResultStatus = 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface DetectionSignal {
  id: string;
  name: string;
  severity: ThreatSeverity;
  scoreImpact: number;
  description: string;
}

export interface DetectionData {
  status: ResultStatus;
  riskScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  signals?: DetectionSignal[];
  recommendation: string;
  metadata?: Record<string, any>;
  analysisMethod?: string;
  maskedInput?: string;
  qrContentType?: 'URL' | 'UPI' | 'CONTACT' | 'WIFI' | 'TEXT';
  decodedContent?: string;
  isSafeToOpen?: boolean;
}

export interface ScanRecord {
  id: string;
  userId?: string | null;
  type: ScanType;
  inputHash: string;
  maskedInput: string;
  resultStatus: ResultStatus;
  riskScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  recommendation: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalScans: number;
  highRiskScans: number;
  scansByType: {
    URL: number;
    QR: number;
    OTP: number;
    UPI: number;
    CHAT?: number;
  };
  recentScans: ScanRecord[];
  recentUsers: User[];
  systemHealth: {
    uptimeSeconds: number;
    memoryUsageMb: number;
    nodeVersion: string;
    status: string;
    database: string;
  };
}

export interface AnalyticsData {
  riskDistribution: { name: string; count: number; color: string }[];
  typeDistribution: { name: string; count: number; color: string }[];
  totalScans: number;
}

export interface AuditLogRecord {
  id: string;
  adminUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  adminUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  detectedType?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  resultStatus?: ResultStatus;
  scanId?: string;
  createdAt: string;
}

export interface LoginSessionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  device: string;
  ipAddress: string;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface UserActivityData {
  user: User;
  stats: {
    totalScans: number;
    highRiskCount: number;
    safeCount: number;
    lastLogin: string;
  };
  recentSessions: LoginSessionRecord[];
  scans: ScanRecord[];
}
