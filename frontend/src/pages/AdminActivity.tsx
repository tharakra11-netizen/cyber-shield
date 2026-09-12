import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { User, LoginSessionRecord, UserActivityData } from '../types/index.js';
import {
  Users,
  Activity,
  BarChart3,
  FileText,
  ShieldAlert,
  Monitor,
  Smartphone,
  Laptop,
  Clock,
  Search,
  Globe,
  QrCode,
  KeyRound,
  CreditCard,
  Bot,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Calendar
} from 'lucide-react';

export const AdminActivity: React.FC = () => {
  const { showToast } = useToast();
  const location = useLocation();

  // Sessions list
  const [sessions, setSessions] = useState<LoginSessionRecord[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);

  // User list for dropdown
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>((location.state as any)?.userId || '');
  
  // Selected user's activity
  const [userActivity, setUserActivity] = useState<UserActivityData | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false);
  const [scanSearchQuery, setScanSearchQuery] = useState<string>('');
  const [vectorFilter, setVectorFilter] = useState<string>('ALL');

  // Load all users and initial login sessions
  const loadInitialData = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const [usersRes, sessionsRes] = await Promise.all([
        api.admin.getUsers({ limit: 50 }),
        api.admin.getLoginSessions({ limit: 25 })
      ]);

      if (usersRes.success) {
        setUsers(usersRes.users);
        const incomingId = (location.state as any)?.userId;
        if (incomingId) {
          setSelectedUserId(incomingId);
        } else if (usersRes.users.length > 0 && !selectedUserId) {
          setSelectedUserId(usersRes.users[0].id);
        }
      }

      if (sessionsRes.success) {
        setSessions(sessionsRes.sessions);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve telemetry.', 'error');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [selectedUserId, showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // When selected user changes, load their detailed search & scan telemetry
  const loadUserActivity = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoadingActivity(true);
    try {
      const res = await api.admin.getUserActivity(userId);
      if (res.success) {
        setUserActivity(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load user scan data.', 'error');
    } finally {
      setIsLoadingActivity(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserActivity(selectedUserId);
    }
  }, [selectedUserId, loadUserActivity]);

  // Filter selected user's scans
  const filteredScans = (userActivity?.scans || []).filter(s => {
    const matchesVector = vectorFilter === 'ALL' || s.type === vectorFilter;
    const matchesSearch = !scanSearchQuery.trim() ||
      s.maskedInput.toLowerCase().includes(scanSearchQuery.toLowerCase()) ||
      s.riskLevel.toLowerCase().includes(scanSearchQuery.toLowerCase());
    return matchesVector && matchesSearch;
  });

  const getDeviceIcon = (deviceStr: string) => {
    const lower = deviceStr.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
      return <Smartphone className="w-4 h-4 text-cyan-400" />;
    }
    if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('windows')) {
      return <Laptop className="w-4 h-4 text-blue-400" />;
    }
    return <Monitor className="w-4 h-4 text-slate-400" />;
  };

  const getVectorIcon = (type: string) => {
    switch (type) {
      case 'URL': return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'QR': return <QrCode className="w-3.5 h-3.5 text-indigo-400" />;
      case 'OTP': return <KeyRound className="w-3.5 h-3.5 text-emerald-400" />;
      case 'UPI': return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      case 'CHAT': return <Bot className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Title Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono font-medium mb-2 shadow-inner">
            <Clock className="w-3.5 h-3.5" />
            <span>Telemetry & Session Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            User Login Activity & Search History
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Audit authenticated operator devices, login timestamps, and inspect granular threat search history per user.
          </p>
        </div>

        {/* Sub-Navigation Links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-750 transition-colors shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/activity"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 text-xs font-semibold text-cyan-300 border border-cyan-500/40 shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Logins & Activity</span>
          </Link>
          <Link
            to="/admin/scans"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-750 transition-colors shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>All Scans</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-750 transition-colors shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Analytics</span>
          </Link>
          <Link
            to="/admin/audit-logs"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-750 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: USER SEARCH DATA INSPECTOR WITH DROPDOWN */}
      <div className="rounded-2xl card-enterprise p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Operator Search & Threat Inspection History
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Select an operator from the dropdown to inspect their complete personal scan searches, inputs, and risk levels.
            </p>
          </div>

          {/* User Selector Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-mono font-semibold text-slate-300 shrink-0">
              Select Operator:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-2 text-xs font-mono text-cyan-300 focus:outline-none transition-all shadow-inner min-w-[240px]"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected User Summary Cards */}
        {userActivity && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">Operator Profile</div>
              <div className="text-sm font-bold text-white truncate">{userActivity.user.name}</div>
              <div className="text-xs text-slate-400 font-mono truncate">{userActivity.user.email}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {userActivity.user.role}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                  userActivity.user.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {userActivity.user.isActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">Total Search Queries</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{userActivity.stats.totalScans}</div>
              <div className="text-xs text-slate-400 mt-1">Multi-vector checks logged</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">High Risk Inquiries</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{userActivity.stats.highRiskCount}</div>
              <div className="text-xs text-slate-400 mt-1">Critical or high threats caught</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">Last Active / Login</div>
              <div className="text-xs font-bold text-slate-200 mt-1">
                {new Date(userActivity.stats.lastLogin).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Registered: {new Date(userActivity.user.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar for this user's scans */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="w-full sm:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={scanSearchQuery}
              onChange={(e) => setScanSearchQuery(e.target.value)}
              placeholder="Search user's queries or inputs..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-slate-400">Vector:</span>
            <select
              value={vectorFilter}
              onChange={(e) => setVectorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Vectors</option>
              <option value="URL">URL</option>
              <option value="QR">QR Code</option>
              <option value="OTP">OTP</option>
              <option value="UPI">UPI</option>
              <option value="CHAT">CyberBot AI</option>
            </select>
          </div>
        </div>

        {/* User Scans Table */}
        {isLoadingActivity ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
            Loading user search telemetry...
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono border border-dashed border-slate-800 rounded-xl">
            No search or scan records found for this user matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Vector</th>
                  <th className="py-3 px-4 font-semibold">Queried / Masked Input</th>
                  <th className="py-3 px-4 font-semibold text-center">Risk Score</th>
                  <th className="py-3 px-4 font-semibold text-center">Severity</th>
                  <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredScans.map(scan => (
                  <tr key={scan.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-750">
                        {getVectorIcon(scan.type)}
                        <span className="text-[11px] text-slate-200">{scan.type}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-200 font-sans text-xs" title={scan.maskedInput}>
                      {scan.maskedInput}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-white">{scan.riskScore}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        scan.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        scan.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        scan.riskLevel === 'MODERATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {scan.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(scan.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/result/${scan.id}`}
                        state={{ scanData: scan }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-[11px] transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: LIVE LOGIN DETAILS & DEVICE SESSIONS */}
      <div className="rounded-2xl card-enterprise p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Operator Login Telemetry & Device Surveillance
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Captures user name, authenticated role, client device/browser, IP address, and login time.
            </p>
          </div>

          <button
            onClick={loadInitialData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-750 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Sessions Table */}
        {isLoadingSessions ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400 animate-pulse">
            Retrieving login telemetry records...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono border border-dashed border-slate-800 rounded-xl">
            No login telemetry captured yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Operator Name & Email</th>
                  <th className="py-3 px-4 font-semibold">Access Level</th>
                  <th className="py-3 px-4 font-semibold">Client Device / Platform</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                  <th className="py-3 px-4 font-semibold text-right">Login Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{sess.userName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sess.userEmail}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        sess.user?.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {sess.user?.role || 'USER'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-slate-200 text-xs">
                        {getDeviceIcon(sess.device)}
                        <span>{sess.device}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-cyan-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {sess.ipAddress}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-xs text-slate-300">
                      <div>
                        {new Date(sess.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
