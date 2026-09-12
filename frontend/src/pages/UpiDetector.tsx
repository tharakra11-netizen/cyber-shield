import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { DetectionData } from '../types/index.js';
import { RiskGauge } from '../components/RiskGauge.js';
import { LoadingScanner } from '../components/LoadingSkeleton.js';
import {
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertOctagon,
  HelpCircle,
  Lock
} from 'lucide-react';

export const UpiDetector: React.FC = () => {
  const { showToast } = useToast();
  const [paymentText, setPaymentText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DetectionData | null>(null);

  const executeScan = async (textToScan: string) => {
    if (!textToScan.trim()) {
      showToast('Please enter a payment message or UPI ID to analyze.', 'warning');
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const res = await api.detect.scanUpi(textToScan.trim());
      if (res.success) {
        setResult(res.data);
        showToast('Payment request evaluated against fraud patterns.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze payment text.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(paymentText);
  };

  const demoScenarios = [
    {
      label: 'Refund Collect Request Scam',
      text: 'UPI Collect Request of ₹4,999 from support.sbi.refund@okhdfcbank. Enter your 6-digit UPI PIN to claim your refund.'
    },
    {
      label: 'Remote Support App Lure',
      text: 'To resolve your failed transaction of Rs 2000, please install AnyDesk and accept the incoming payment request from support team.'
    },
    {
      label: 'Fake Cashback Scratch Card',
      text: 'Congratulations! You won ₹1,500 cashback on Google Pay. Click to approve the collect request in your PhonePe app.'
    },
    {
      label: 'Legitimate Merchant URI',
      text: 'upi://pay?pa=starbucks.merchant@icici&pn=Starbucks&am=350.00&cu=INR'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
         {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Vector 04 · Financial Payment & UPI Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          UPI Collect & Payment Fraud Shield
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Analyzes UPI handles, payment collect notifications, and refund claims to detect reverse charge deception and unauthorized fund deductions.
        </p>
      </div>

      {/* The Golden Rule Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
            The Fundamental Rule of UPI Security
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed">
            You <strong className="text-white">NEVER</strong> need to enter your UPI PIN or scan a QR code to <em>receive</em> money. Entering a UPI PIN will <strong className="text-amber-300">ALWAYS deduct money</strong> from your bank balance. Any party requesting your PIN or approving a collect request to transfer money into your account is attempting fraud.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Payment Request, UPI Handle, or SMS Notification
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <input
                type="text"
                required
                value={paymentText}
                onChange={(e) => setPaymentText(e.target.value)}
                placeholder="upi://pay?pa=name@bank or 'Collect request of ₹5000 from...'"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl pl-11 pr-28 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="absolute right-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50 border border-emerald-500/30 shadow-sm"
              >
                {isScanning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Demo Presets */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 font-medium block mb-2">
            Preset Payment Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoScenarios.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPaymentText(demo.text);
                  executeScan(demo.text);
                }}
                className="p-3 text-left rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-slate-300 transition-colors"
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
        <LoadingScanner message="Deconstructing UPI scheme parameters, verifying VPA provider registry, scanning for collect request deception..." />
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
              
              <p className="text-xs sm:text-sm font-mono text-emerald-300 break-all bg-slate-950 p-3 rounded-xl border border-slate-800">
                {paymentText}
              </p>
              <p className="text-xs text-slate-400">
                Analysis Engine: <strong className="text-slate-300 font-medium">{result.analysisMethod}</strong>
              </p>
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
                Financial Advisory
              </h4>
              <p className="text-xs leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Heuristic Signals Detected ({result.reasons.length})
            </h3>
            <div className="space-y-2">
              {result.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
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
