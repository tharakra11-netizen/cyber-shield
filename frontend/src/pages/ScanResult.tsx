import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { ScanRecord } from '../types/index.js';
import { RiskGauge } from '../components/RiskGauge.js';
import {
  Shield,
  Printer,
  ArrowLeft,
  Calendar,
  Layers,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Globe
} from 'lucide-react';

export const ScanResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [scan, setScan] = useState<ScanRecord | null>(location.state?.scanData || null);
  const [isLoading, setIsLoading] = useState(!scan);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!scan && id) {
      const scanId = id;
      async function fetchScan() {
        try {
          const res = await api.scans.getById(scanId);
          if (res.success && res.scan) {
            setScan(res.scan);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to locate scan report.');
        } finally {
          setIsLoading(false);
        }
      }
      fetchScan();
    }
  }, [id, scan]);

  const handleCopyInput = () => {
    if (scan?.maskedInput) {
      navigator.clipboard.writeText(scan.maskedInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 font-mono text-xs animate-pulse">
        Fetching Threat Intelligence Record...
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Scan Report Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Record does not exist or has been purged.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(scan.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Action Navigation Header */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/history"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Audit Log</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-750 transition-colors shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-blue-400" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Main Report Document Card */}
      <div className="p-6 sm:p-10 rounded-2xl card-enterprise shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-display font-bold text-white text-base sm:text-lg tracking-tight">CYBER SHIELD TELEMETRY REPORT</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Record ID: <span className="text-slate-300">{scan.id}</span>
            </p>
          </div>
          <div className="text-left sm:text-right text-xs font-mono text-slate-400 space-y-1">
            <div className="flex items-center sm:justify-end gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Vector: <strong className="text-blue-400 font-medium">{scan.type}</strong></span>
            </div>
          </div>
        </div>

        {/* Overview Gauge & Status Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Classification:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase border ${
                scan.resultStatus === 'MALICIOUS'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : scan.resultStatus === 'SUSPICIOUS'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {scan.resultStatus}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
              {scan.resultStatus === 'MALICIOUS'
                ? 'High Deception Threat Detected'
                : scan.resultStatus === 'SUSPICIOUS'
                ? 'Caution Advised: Unverified Indicators'
                : 'No Active Threat Detected'}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              {scan.resultStatus === 'MALICIOUS'
                ? 'This target displays unambiguous malicious patterns, brand spoofing, or fraudulent payment logic. Do not interact with this payload.'
                : scan.resultStatus === 'SUSPICIOUS'
                ? 'Target contains ambiguous traits, newly registered elements, or obscured routing. Verify independently before proceeding.'
                : 'Target passed lexical and behavioural validation rules. Continue practicing standard digital hygiene.'}
            </p>
          </div>

          <div className="shrink-0">
            <RiskGauge
              score={scan.riskScore}
              confidence={scan.confidenceScore}
              level={scan.riskLevel}
              size="lg"
            />
          </div>
        </div>

        {/* Inspected Payload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Sanitized Telemetry Payload
            </span>
            <button
              onClick={handleCopyInput}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 break-all leading-relaxed">
            {scan.maskedInput}
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${
          scan.resultStatus === 'MALICIOUS'
            ? 'bg-rose-950/25 border-rose-500/30 text-rose-100'
            : scan.resultStatus === 'SUSPICIOUS'
            ? 'bg-amber-950/25 border-amber-500/30 text-amber-100'
            : 'bg-emerald-950/25 border-emerald-500/30 text-emerald-100'
        }`}>
          <div className="mt-0.5 shrink-0">
            {scan.resultStatus === 'MALICIOUS' ? (
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            ) : scan.resultStatus === 'SUSPICIOUS' ? (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">
              Actionable Defense Protocol
            </h3>
            <p className="text-xs leading-relaxed">
              {scan.recommendation}
            </p>
          </div>
        </div>

        {/* Finding List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Audit Trail & Contributing Signals
          </h3>
          <div className="space-y-2">
            {scan.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Threat Intelligence Feed Telemetry */}
        {scan.metadata?.threatFeed && (
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">Live Threat Grid Telemetry</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    scan.metadata.threatFeed.matched
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {scan.metadata.threatFeed.matched ? 'MALICIOUS MATCH' : 'CLEAN REPUTATION'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Feed Provider: <span className="text-slate-200">{scan.metadata.threatFeed.provider}</span>
                </p>
              </div>
            </div>
            {scan.metadata.threatFeed.threatType && (
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-slate-900 border border-slate-750 text-slate-300">
                Signature: {scan.metadata.threatFeed.threatType}
              </span>
            )}
          </div>
        )}

        {/* Technical Metadata Table if present */}
        {scan.metadata && Object.keys(scan.metadata).length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs font-mono">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
              Raw Telemetry Snapshot
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-400">
              {Object.entries(scan.metadata).map(([key, val]) => (
                <div key={key} className="break-all">
                  <span className="text-slate-500">{key}: </span>
                  <strong className="text-slate-200 font-medium">{String(val)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
