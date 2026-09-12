import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { ScanRecord } from '../types/index.js';
import { StatCard } from '../components/StatCard.js';
import { ScanCard } from '../components/ScanCard.js';
import {
  Globe,
  QrCode,
  KeyRound,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Activity,
  History,
  Shield
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    async function fetchUserScans() {
      try {
        const res = await api.scans.list({ limit: 5 });
        if (res.success) {
          setScans(res.scans);
          setTotalScans(res.pagination.total);
        }
      } catch (err) {
        console.error('Failed to load dashboard scans:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserScans();
  }, []);

  const highRiskCount = scans.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;
  const safeCount = scans.filter(s => s.riskLevel === 'LOW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono font-medium shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <Shield className="w-3.5 h-3.5" />
            <span>Cyber Shield Defense Station · Online & Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Security Operator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Enterprise threat intelligence console. Execute real-time multi-vector inspections across URLs, optical QR matrices, social-engineered OTP texts, and UPI payment requests.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link
            to="/scan/url"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all border border-blue-500/40 active:scale-[0.98]"
          >
            <span>Launch Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-medium text-xs border border-slate-750 transition-colors shadow-sm"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Audit History</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Telemetry Scans"
          value={totalScans}
          subtitle="All vectors analyzed"
          icon={Activity}
          color="blue"
          trend="Saved in your encrypted history"
        />
        <StatCard
          title="High-Risk Interceptions"
          value={highRiskCount}
          subtitle="Critical & high threats flagged"
          icon={ShieldAlert}
          color="red"
          trend="Prevented potential compromise"
        />
        <StatCard
          title="Clean Verifications"
          value={safeCount}
          subtitle="Low risk verified inputs"
          icon={ShieldCheck}
          color="emerald"
          trend="Validated through 40+ rules"
        />
      </div>

      {/* Quick Launchpad Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Detection Modules
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">4 Vectors Online</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            to="/scan/url"
            className="p-5 rounded-2xl card-enterprise hover:border-blue-500/50 hover:bg-slate-850/80 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-blue-400 font-medium mb-1">VECTOR 01</div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">URL Phishing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Detect lookalike domains, IP hosts & spoofed brands</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect URL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/scan/qr"
            className="p-5 rounded-2xl card-enterprise hover:border-indigo-500/50 hover:bg-slate-850/80 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-indigo-400 font-medium mb-1">VECTOR 02</div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">QR Code Scanner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Camera & file QR triage into URL, UPI, or text payload</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect QR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/scan/otp"
            className="p-5 rounded-2xl card-enterprise hover:border-purple-500/50 hover:bg-slate-850/80 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-purple-400 font-medium mb-1">VECTOR 03</div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">OTP Scam Guard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Auto-redacts OTPs and spots psychological urgency traps</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect SMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/scan/upi"
            className="p-5 rounded-2xl card-enterprise hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-emerald-400 font-medium mb-1">VECTOR 04</div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">UPI Payment Shield</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Detects collect request fraud & PIN-to-receive scams</p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Inspect Payment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

        </div>
      </div>

      {/* Recent Scans Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Recent Telemetry Stream
          </h2>
          <Link
            to="/history"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500 font-mono animate-pulse">
            Loading telemetry feed...
          </div>
        ) : scans.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Telemetry Recorded Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select one of the detection modules above to run your first security analysis. Your results will automatically appear here.
            </p>
            <Link
              to="/scan/url"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs mt-2 transition-colors"
            >
              <span>Scan a URL</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map(scan => (
              <ScanCard key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
