import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { DetectionData } from '../types/index.js';
import { RiskGauge } from '../components/RiskGauge.js';
import { LoadingScanner } from '../components/LoadingSkeleton.js';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

export const OtpDetector: React.FC = () => {
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DetectionData | null>(null);

  const executeScan = async (textToScan: string) => {
    if (!textToScan.trim()) {
      showToast('Please paste or type an SMS message to analyze.', 'warning');
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const res = await api.detect.scanOtp(textToScan.trim());
      if (res.success) {
        setResult(res.data);
        showToast('Message analyzed with automatic OTP redaction.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze message.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(message);
  };

  const demoScenarios = [
    {
      label: 'Electricity Power Cut Threat',
      text: 'Dear Customer, your electricity will be disconnected tonight at 9:30 PM. Contact officer at 9876543210 and share verification OTP 849201 immediately.'
    },
    {
      label: 'Urgent Bank KYC Suspension',
      text: 'Your SBI account is blocked today due to pending KYC. Click http://sbi-kyc-update.buzz/login and send the OTP 482019 to executive.'
    },
    {
      label: 'Lottery Prize Lure',
      text: 'Congratulations! You won Rs. 50,000 lottery from Amazon Rewards. Share code 592014 to claim credit to your bank account.'
    },
    {
      label: 'Legitimate Bank Alert',
      text: 'Your HDFC Bank NetBanking OTP is 729103 for transaction of INR 1,200.00. Valid for 10 mins. NEVER SHARE this OTP with anyone, including bank staff.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-medium">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Vector 03 · Social Engineering & SMS Inspection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          OTP Harvester & Urgency Detector
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Analyzes deceptive SMS, WhatsApp, and email messages for psychological coercion, impersonation tactics, false deadlines, and credential harvesting traps.
        </p>
      </div>

      {/* Educational Privacy Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Zero-Knowledge Privacy Guarantee
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cyber Shield strictly enforces a zero-knowledge architecture. If your input text contains an authentication code or password, our pre-parser instantly masks it into bullet characters (<span className="font-mono text-blue-300">••••••</span>) before running heuristics or persisting telemetry.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Suspicious SMS or Communication Body
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste message here (e.g. 'Dear customer, your power will be disconnected tonight at 9:30 PM. Share verification OTP 849201 immediately...')"
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isScanning}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 border border-purple-500/30"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Analyze Message</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Presets */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 font-medium block mb-2">
            Preset Threat Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoScenarios.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(demo.text);
                  executeScan(demo.text);
                }}
                className="p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-300 transition-colors"
              >
                <span className="font-semibold text-white block mb-0.5">{demo.label}</span>
                <span className="text-slate-400 truncate block font-mono">{demo.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanning Animation */}
      {isScanning && (
        <LoadingScanner message="Redacting numeric codes, parsing psychological urgency keywords, running social engineering heuristics..." />
      )}

      {/* Results View */}
      {result && !isScanning && (
        <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-2xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Risk Level:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase border ${
                  result.status === 'MALICIOUS'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : result.status === 'SUSPICIOUS'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {/* Redacted input preview */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Redacted Telemetry Body:
                </span>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {result.maskedInput}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <RiskGauge
                score={result.riskScore}
                confidence={result.confidenceScore}
                level={result.riskLevel}
                size="md"
              />
            </div>
          </div>

          {/* Action Recommendation */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            result.status === 'MALICIOUS'
              ? 'bg-rose-950/25 border-rose-500/30 text-rose-200'
              : result.status === 'SUSPICIOUS'
              ? 'bg-amber-950/25 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="mt-0.5 shrink-0">
              {result.status === 'MALICIOUS' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
                Security Advisory
              </h4>
              <p className="text-xs leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Deception Indicators Flagged ({result.reasons.length})
            </h3>
            <div className="space-y-2">
              {result.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
