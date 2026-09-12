import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Globe,
  QrCode,
  KeyRound,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Search,
  Zap,
  Activity
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [quickUrl, setQuickUrl] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    navigate('/scan/url', { state: { initialUrl: quickUrl.trim() } });
  };

  const faqs = [
    {
      q: 'How does Cyber Shield detect phishing without an external database?',
      a: 'Cyber Shield utilizes an explainable multi-vector heuristic engine analyzing lexical entropy, suspicious TLDs (.xyz, .top, .buzz), direct IP addresses, character typosquatting on major brands (e.g. paypa1, micros0ft), subdomain stacking, and deceptive path parameters.'
    },
    {
      q: 'Does Cyber Shield ever collect my actual OTP or banking PIN?',
      a: 'Never. Our OTP and UPI engines strictly enforce Privacy by Design: any 4 to 8 digit verification code in submitted messages is automatically masked with bullet dots (••••••) before evaluation or persistence. We actively remind users that a UPI PIN is exclusively used for authorizing outbound transfers, never to receive funds.'
    },
    {
      q: 'Can I scan QR codes using my device camera or an image file?',
      a: 'Yes. The QR Scanner supports both instant drag-and-drop image file decoding and live in-browser webcam streaming. Decoded content is automatically classified into URLs, UPI payment schemes, or plain text, and is safely sandboxed to prevent automatic navigation.'
    },
    {
      q: 'Is my scan history kept private and confidential?',
      a: 'Yes. Every user has an isolated, encrypted audit history. Only you can view or delete your scan logs. Administrators only see anonymized system aggregates with full audit accountability.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Shield className="w-3.5 h-3.5" />
          <span>Enterprise Threat Intelligence Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
          Autonomous Phishing & <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-slate-200">
            Digital Scam Prevention
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Evaluate suspicious URLs, optical QR payloads, OTP harvesting messages, and deceptive UPI payment requests with transparent 0–100 risk scoring and explainable telemetry.
        </p>

        {/* Quick Scan Input Bar */}
        <form onSubmit={handleQuickScan} className="mt-10 max-w-2xl mx-auto">
          <div className="relative flex items-center rounded-2xl bg-slate-900/90 border border-slate-750 p-2 shadow-subtle-card focus-within:border-blue-500/80 transition-all">
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Enter target URL to inspect (e.g. http://192.168.1.1/paypa1/login)..."
              className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <span>Inspect Target</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3.5 flex items-center justify-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Zero Secret Storage
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> Sub-Second Multi-Engine Triage
            </span>
          </div>
        </form>

        {/* Enterprise Compliance Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            🛡️ SOC 2 Type II Aligned
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            🔒 Zero-Knowledge Privacy Architecture
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            ⚡ 40+ Heuristic Rules
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            ⚖️ Non-Custodial Threat Scans
          </span>
        </div>

        {/* Live Metrics Ticker Banner */}
        <div className="mt-10 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-around gap-6 text-slate-300 font-mono text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Active Heuristics: <strong className="text-white">40+ Dynamic Rules</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy Guard: <strong className="text-emerald-400">OTP Redaction Active</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Detection Engine: <strong className="text-white">Explainable NLP & Lexical</strong></span>
          </div>
        </div>
      </section>

      {/* 4 Core Vectors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono mb-2">
            Comprehensive Defense
          </h2>
          <p className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Specialized Threat Inspection Engines
          </p>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            Each threat vector uses specialized analysis tailored to the deception tactics utilized by cyber adversaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Vector 1: URL */}
          <div className="p-6 rounded-2xl card-enterprise hover:border-blue-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                URL Phishing Intelligence
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Identifies typosquatting domains (e.g. paypa1, micros0ft), raw IP hosts, disposable TLDs, and credential harvesting paths.
              </p>
            </div>
            <Link
              to="/scan/url"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>Open URL Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Vector 2: QR */}
          <div className="p-6 rounded-2xl card-enterprise hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                QR Code Scam Guard
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Dual webcam & file decoder that triages destinations into URL, UPI, or text without auto-opening malicious payloads.
              </p>
            </div>
            <Link
              to="/scan/qr"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>Open QR Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Vector 3: OTP */}
          <div className="p-6 rounded-2xl card-enterprise hover:border-purple-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                OTP Scam Shield
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Evaluates SMS/WhatsApp text for urgency, threats of disconnection, and illegal requests to share verification codes.
              </p>
            </div>
            <Link
              to="/scan/otp"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              <span>Inspect OTP Message</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Vector 4: UPI */}
          <div className="p-6 rounded-2xl card-enterprise hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                UPI Payment Fraud Shield
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Detects deceptive collect requests masquerading as refunds and enforces the rule: PIN is never used to receive funds.
              </p>
            </div>
            <Link
              to="/scan/upi"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>Inspect Payment Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-slate-800 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono mb-2">
              Architecture & Workflow
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three-Tier Inspection Pipeline
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Input & Sanitization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw payloads are parsed and normalized. Sensitive codes such as OTPs are automatically masked with SHA-256 cryptographic hashing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-white">Heuristic Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                40+ detection rules inspect lexical properties, typosquatting distance, VPA credibility, and social engineering pressure signals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-white">Explainable Audit Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Outputs an actionable 0–100 risk score, confidence index, signal-by-signal itemization, and step-by-step protective instructions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Security Awareness Tips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              Essential Defense Rules
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-6 tracking-tight">
              Recognize Social Engineering Instantly
            </h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">Rule 1: UPI PIN is Exclusively for Outbound Payments.</strong> Legitimate funds credited to your account never require entering a PIN or scanning a QR code.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">Rule 2: Never Disclose One-Time Passwords.</strong> Legitimate banking representatives and utilities will never request you to dictate an OTP over the phone.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white">Rule 3: Beware Artificial Urgency.</strong> Demands threatening immediate account blockage or utility cutoffs within minutes are standard social engineering tactics.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Get Started with Cyber Shield</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Create an account to retain your personal threat audit history, export detailed PDF-ready reports, and safeguard your digital presence.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/scan/url"
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
              >
                Try Threat Scanner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-mono mb-2">
            Technical Clarifications
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4.5 text-left text-xs sm:text-sm font-semibold text-white hover:text-blue-400 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4.5 pb-4.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
