import React from 'react';
import { Shield, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Privacy by Design & Data Ethics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          How Cyber Shield ensures complete data privacy, zero credential harvesting, and transparent threat evaluation.
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Zero Secret Collection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never request, accept, or store your passwords, bank PINs, or card CVV numbers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Automated Redaction</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Any 4–8 digit verification code in SMS messages is masked to bullets (<span className="font-mono text-blue-400">••••••</span>) prior to database storage.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Local Heuristic Execution</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inputs are evaluated using internal heuristics and NLP patterns, avoiding leakage to unverified third-party endpoints.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-6 text-xs text-slate-300 leading-relaxed">
        <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
          1. Data Collection & Processing
        </h2>
        <p>
          Cyber Shield processes URLs, QR codes, SMS snippets, and UPI payment strings exclusively for heuristic danger assessment. Inputs submitted by authenticated operators are linked to their personal telemetry history to provide auditability.
        </p>

        <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider pt-4 border-t border-slate-800">
          2. Right to Deletion (Data Purge)
        </h2>
        <p>
          Every authenticated user maintains full sovereignty over their telemetry records. You can delete individual scans or wipe your entire audit history at any time from the <strong className="text-blue-400 font-medium">Scan History</strong> dashboard.
        </p>

        <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider pt-4 border-t border-slate-800">
          3. Credential Protection
        </h2>
        <p>
          User passwords for accounts on Cyber Shield are cryptographically protected using salted <strong className="text-blue-400 font-medium">bcrypt</strong> hashing. Passwords are never stored or transmitted in plaintext.
        </p>
      </div>

    </div>
  );
};
