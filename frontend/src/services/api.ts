import {
  User,
  ScanRecord,
  DetectionData,
  DashboardStats,
  AnalyticsData,
  AuditLogRecord,
  ChatMessageItem,
  LoginSessionRecord,
  UserActivityData
} from '../types/index.js';

const rawBase = (import.meta as any).env?.VITE_API_URL || '/api';
const cleanBase = rawBase.replace(/\/+$/, '');
const API_BASE = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || (data.errors && data.errors[0]?.message) || `HTTP Error ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    async register(name: string, email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return handleResponse(res);
    },

    async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },

    async getMe(): Promise<{ success: boolean; user: User }> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async updateProfile(data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; message: string; user: User }> {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },

    async forgotPassword(email: string): Promise<{ success: boolean; message: string; devResetUrl?: string; token?: string }> {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return handleResponse(res);
    },

    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      return handleResponse(res);
    }
  },

  // Detect
  detect: {
    async scanUrl(url: string): Promise<{ success: boolean; scanId: string; data: DetectionData }> {
      const res = await fetch(`${API_BASE}/detect/url`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url })
      });
      return handleResponse(res);
    },

    async scanQr(content: string): Promise<{ success: boolean; scanId: string; data: DetectionData }> {
      const res = await fetch(`${API_BASE}/detect/qr`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
      });
      return handleResponse(res);
    },

    async scanOtp(message: string): Promise<{ success: boolean; scanId: string; data: DetectionData }> {
      const res = await fetch(`${API_BASE}/detect/otp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
      });
      return handleResponse(res);
    },

    async scanUpi(paymentText: string): Promise<{ success: boolean; scanId: string; data: DetectionData }> {
      const res = await fetch(`${API_BASE}/detect/upi`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentText })
      });
      return handleResponse(res);
    }
  },

  // Scans / History
  scans: {
    async list(params?: { type?: string; riskLevel?: string; search?: string; page?: number; limit?: number }): Promise<{
      success: boolean;
      scans: ScanRecord[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }> {
      const q = new URLSearchParams();
      if (params?.type) q.append('type', params.type);
      if (params?.riskLevel) q.append('riskLevel', params.riskLevel);
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/scans?${q.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getById(id: string): Promise<{ success: boolean; scan: ScanRecord }> {
      const res = await fetch(`${API_BASE}/scans/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async delete(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/scans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async clearAll(): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/scans`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // AI Chatbot
  chat: {
    async sendMessage(message: string, sessionId?: string): Promise<{
      success: boolean;
      sessionId: string;
      messageId: string;
      reply: string;
      detectedType: string;
      riskScore: number;
      riskLevel: any;
      resultStatus: any;
      scanId?: string;
      isThreatCheck: boolean;
      createdAt: string;
    }> {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message, sessionId })
      });
      return handleResponse(res);
    },

    async getHistory(sessionId?: string): Promise<{ success: boolean; messages: ChatMessageItem[] }> {
      const q = new URLSearchParams();
      if (sessionId) q.append('sessionId', sessionId);
      const res = await fetch(`${API_BASE}/chat/history?${q.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async clearHistory(sessionId?: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/chat/history`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sessionId })
      });
      return handleResponse(res);
    }
  },

  // Admin
  admin: {
    async getDashboard(): Promise<{ success: boolean; stats: DashboardStats }> {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getUsers(params?: { search?: string; page?: number; limit?: number }): Promise<{
      success: boolean;
      users: User[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }> {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/admin/users?${q.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async toggleUser(id: string): Promise<{ success: boolean; message: string; isActive: boolean }> {
      const res = await fetch(`${API_BASE}/admin/users/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getScans(params?: { type?: string; riskLevel?: string; search?: string; page?: number; limit?: number }): Promise<{
      success: boolean;
      scans: ScanRecord[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }> {
      const q = new URLSearchParams();
      if (params?.type) q.append('type', params.type);
      if (params?.riskLevel) q.append('riskLevel', params.riskLevel);
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/admin/scans?${q.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async deleteScan(id: string): Promise<{ success: boolean; message: string }> {
      const res = await fetch(`${API_BASE}/admin/scans/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getAnalytics(): Promise<{ success: boolean; analytics: AnalyticsData }> {
      const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getAuditLogs(params?: { page?: number; limit?: number }): Promise<{
      success: boolean;
      logs: AuditLogRecord[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }> {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/admin/audit-logs?${q.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getLoginSessions(params?: { page?: number; limit?: number }): Promise<{
      success: boolean;
      sessions: LoginSessionRecord[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }> {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', params.page.toString());
      if (params?.limit) q.append('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/admin/sessions?${q.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    async getUserActivity(userId: string): Promise<{
      success: boolean;
      user: User;
      stats: {
        totalScans: number;
        highRiskCount: number;
        safeCount: number;
        lastLogin: string;
      };
      recentSessions: LoginSessionRecord[];
      scans: ScanRecord[];
    }> {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/activity`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};
