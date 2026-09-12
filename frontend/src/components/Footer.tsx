import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950/90 border-t border-slate-850 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Status */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center border border-blue-500/25">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">CYBER SHIELD</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade digital threat intelligence platform protecting users and organizations against phishing domains, rogue QR codes, OTP harvest scams, and financial deception.
            </p>
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-emerald-500/25 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Engines: Operational</span>
            </div>
          </div>

          {/* Col 2: Detection Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Detection Engines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scan/url" className="hover:text-blue-400 transition-colors">
                  URL Phishing Intelligence
                </Link>
              </li>
              <li>
                <Link to="/scan/qr" className="hover:text-blue-400 transition-colors">
                  QR Optical Scheme Triage
                </Link>
              </li>
              <li>
                <Link to="/scan/otp" className="hover:text-blue-400 transition-colors">
                  OTP Social Engineering Guard
                </Link>
              </li>
              <li>
                <Link to="/scan/upi" className="hover:text-blue-400 transition-colors">
                  UPI Payment Deception Shield
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-blue-400 transition-colors">
                  Audit History Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Privacy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Privacy by Design
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero Secret Collection</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <EyeOff className="w-3.5 h-3.5 text-blue-400" />
                <span>Automated OTP Redaction</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Cryptographic Input Hashing</span>
              </li>
              <li className="pt-1">
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy & Compliance →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Defense Rule */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Standard Defense Notice
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
              <p className="text-slate-300 font-medium">
                <span className="text-amber-400 font-bold">Important:</span> You never need to enter a UPI PIN or disclose OTPs to receive funds.
              </p>
              <p className="text-[11px] text-slate-500">
                Any communication coercing urgent fund approval is likely fraudulent.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cyber Shield. Enterprise Cybersecurity Platform.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-slate-400 transition-colors">Portal Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
