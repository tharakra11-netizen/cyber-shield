import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { DetectionData } from '../types/index.js';
import { RiskGauge } from '../components/RiskGauge.js';
import { LoadingScanner } from '../components/LoadingSkeleton.js';
import { Globe, ArrowRight, ShieldCheck, AlertOctagon, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';

export const UrlScanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DetectionData | null>(null);
  const [lastScanId, setLastScanId] = useState<string | null>(null);

  // Check if an initial URL was passed from home hero
  useEffect(() => {
    if (location.state?.initialUrl) {
      setUrl(location.state.initialUrl);
      executeScan(location.state.initialUrl);
    }
  }, [location.state]);

  const executeScan = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      showToast('Please enter a target URL to analyze.', 'warning');
      return;
    }

    setIsScanning(true);
    setResult(null);
    setLastScanId(null);

    try {
      const res = await api.detect.scanUrl(targetUrl.trim());
      if (res.success) {
        setResult(res.data);
        setLastScanId(res.scanId);
        showToast(`Scan complete: ${res.data.status} status flagged.`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze URL.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(url);
  };

  const testSamples = [
    { label: 'Malicious IP Host', value: 'http://192.168.1.105/paypal-login/verify.html' },
    { label: 'Brand Typosquatting', value: 'http://paypa1.xyz/verify-identity' },
    { label: 'URL Shortener Lure', value: 'http://bit.ly/claim-free-iphone-gift' },
    { label: 'Legitimate Domain', value: 'https://github.com/explore' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
          <Globe className="w-3.5 h-3.5" />
          <span>Vector 01 · URL Phishing Inspection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          AI Phishing & Domain Detector
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Deep structural heuristic analysis detecting deceptive IP hosts, typosquatted brand identities, deceptive subdomains, suspicious TLDs, and credential harvesting paths.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Target URL or Domain
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/login or http://192.168.1.1..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-11 pr-28 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="absolute right-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all disabled:opacity-50 border border-blue-500/30 shadow-sm"
              >
                {isScanning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Analyze URL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Sample Presets */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-slate-400 font-medium block mb-2">
            Preset Test Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {testSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(sample.value);
                  executeScan(sample.value);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-[11px] font-medium text-slate-300 border border-slate-800 hover:border-blue-500/40 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Animation State */}
      {isScanning && (
        <LoadingScanner message="Deconstructing URL tokens, assessing typosquatting distance, verifying domain TLD registry..." />
      )}

      {/* Live Scan Results */}
      {result && !isScanning && (
        <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-2xl space-y-6 animate-fade-in">
          
          {/* Top Result Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Target Analyzed:
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
              <p className="text-xs sm:text-sm font-mono text-blue-300 break-all bg-slate-950 p-3 rounded-xl border border-slate-800">
                {url}
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
                <AlertOctagon className="w-5 h-5 text-rose-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
                Recommended Action
              </h4>
              <p className="text-xs leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Contributing Reasons & Signals */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Signal Breakdown ({result.reasons.length} Findings)
            </h3>
            <div className="space-y-2">
              {result.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Metadata Details */}
          {result.metadata && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs font-mono">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider block">
                Technical Metadata
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div>Domain: <strong className="text-white font-medium">{result.metadata.domain || 'N/A'}</strong></div>
                <div>Protocol: <strong className="text-white font-medium">{result.metadata.protocol || 'N/A'}</strong></div>
                <div>Direct IP: <strong className="text-white font-medium">{result.metadata.hasIpHost ? 'YES' : 'NO'}</strong></div>
                <div>Brand Flag: <strong className="text-white font-medium">{result.metadata.brandDetected || 'None'}</strong></div>
              </div>
            </div>
          )}

          {/* Dedicated Report Link */}
          {lastScanId && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => navigate(`/result/${lastScanId}`, { state: { scanData: { ...result, maskedInput: url, type: 'URL', createdAt: new Date().toISOString() } } })}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <span>Open Printable Threat Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
