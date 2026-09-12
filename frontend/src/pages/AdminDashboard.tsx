import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { DashboardStats } from '../types/index.js';
import { StatCard } from '../components/StatCard.js';
import {
  ShieldAlert,
  Users,
  Activity,
  Server,
  BarChart3,
  FileText,
  Clock,
  ArrowRight,
  Globe,
  QrCode,
  KeyRound,
  CreditCard,
  Bot
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await api.admin.getDashboard();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-slate-400 animate-pulse">
        Retrieving Global Threat Intelligence Telemetry...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Title Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono font-medium mb-2 shadow-inner">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Privileged Administrative Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Security Command & Control
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time multi-vector threat telemetry, user administration, and system health.
          </p>
        </div>

        {/* Sub-nav Links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-750 transition-colors shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/activity"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-750 transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Logins & Activity</span>
          </Link>
          <Link
            to="/admin/scans"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-750 transition-colors shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>All Scans</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-750 transition-colors shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Analytics</span>
          </Link>
          <Link
            to="/admin/audit-logs"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-750 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Registered Operators"
          value={stats?.totalUsers || 0}
          subtitle="Active platform accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Global Threat Scans"
          value={stats?.totalScans || 0}
          subtitle="Cumulative inspections"
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="High-Risk Interceptions"
          value={stats?.highRiskScans || 0}
          subtitle="Critical & high threats"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Engine Status"
          value={stats?.systemHealth.status || 'OPERATIONAL'}
          subtitle={`Uptime: ${Math.floor((stats?.systemHealth.uptimeSeconds || 0) / 60)} min`}
          icon={Server}
          color="emerald"
        />
      </div>

      {/* Vector Distribution Breakdown */}
      <div className="p-6 rounded-2xl card-enterprise shadow-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Global Scans by Threat Vector
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-1">
              <Globe className="w-4 h-4" />
              <span>URL Phishing</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.scansByType.URL || 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-1">
              <QrCode className="w-4 h-4" />
              <span>QR Codes</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.scansByType.QR || 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-medium mb-1">
              <KeyRound className="w-4 h-4" />
              <span>OTP Harvesting</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.scansByType.OTP || 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
              <CreditCard className="w-4 h-4" />
              <span>UPI Fraud</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.scansByType.UPI || 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium mb-1">
              <Bot className="w-4 h-4" />
              <span>CyberBot AI</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.scansByType.CHAT || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Activity Streams: Recent Scans & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Global Scans */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Live Threat Scan Feed
            </h3>
            <Link to="/admin/scans" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentScans && stats.recentScans.length > 0 ? (
              stats.recentScans.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-medium text-blue-300">[{s.type}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        s.riskLevel === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' :
                        s.riskLevel === 'HIGH' ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' :
                        s.riskLevel === 'MODERATE' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        {s.riskLevel}
                      </span>
                    </div>
                    <p className="font-mono text-slate-300 truncate">{s.maskedInput}</p>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="font-bold text-white">{s.riskScore}/100</div>
                    <span className="text-[10px] text-slate-500">{new Date(s.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">No scans in feed.</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Registered User Roster
            </h3>
            <Link to="/admin/users" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Manage Users
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map(u => (
                <div key={u.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                    }`}>
                      {u.role}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono">No users registered.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
