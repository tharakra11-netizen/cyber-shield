import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { DetectionData } from '../types/index.js';
import { RiskGauge } from '../components/RiskGauge.js';
import { LoadingScanner } from '../components/LoadingSkeleton.js';
import {
  QrCode,
  Camera,
  Upload,
  ShieldCheck,
  AlertOctagon,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';

export const QrScanner: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [decodedContent, setDecodedContent] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<DetectionData | null>(null);
  const [lastScanId, setLastScanId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickCamera);
      }
    } catch (err: any) {
      showToast('Camera permission denied or camera not available.', 'error');
      setIsCameraActive(false);
    }
  };

  const tickCamera = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            setDecodedContent(code.data);
            stopCamera();
            showToast('QR code detected and decoded!', 'success');
            analyzeDecodedQr(code.data);
            return;
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickCamera);
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          setDecodedContent(code.data);
          showToast('QR code detected and decoded successfully!', 'success');
          analyzeDecodedQr(code.data);
        } else {
          showToast('Could not find a valid QR pattern in this image.', 'warning');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const analyzeDecodedQr = async (content: string) => {
    if (!content.trim()) return;

    setIsScanning(true);
    setResult(null);
    try {
      const res = await api.detect.scanQr(content.trim());
      if (res.success) {
        setResult(res.data);
        setLastScanId(res.scanId);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze QR code payload.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = () => {
    if (!decodedContent) return;
    navigator.clipboard.writeText(decodedContent);
    setCopied(true);
    showToast('Decoded payload copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const demoSamples = [
    {
      label: 'Suspicious URL QR',
      content: 'https://security-verify-login.buzz/auth?token=847291'
    },
    {
      label: 'Deceptive UPI Collect QR',
      content: 'upi://pay?pa=support.sbi.refund@okhdfcbank&pn=Refund&am=4999'
    },
    {
      label: 'Safe Merchant QR',
      content: 'upi://pay?pa=starbucks.merchant@icici&pn=Starbucks&am=350.00'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium">
          <QrCode className="w-3.5 h-3.5" />
          <span>Vector 02 · Optical Threat & QR Triage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          QR Code Threat & Exploit Detector
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Safely decodes and sandboxes optical QR payloads. Detects phishing URLs and disguised UPI collect requests before they execute on your device.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-sm border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Image Upload</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-sm border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Scanner</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-6">
        
        {activeTab === 'upload' ? (
          <div className="border-2 border-dashed border-slate-750 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-colors bg-slate-950/40">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Select or Drop QR Code Image
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Supports PNG, JPG, SVG, or WebP screenshot files up to 10MB
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm border border-blue-500/30">
              <Upload className="w-4 h-4" />
              <span>Choose Image File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black border border-slate-750 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              {/* Scan target viewfinder overlay */}
              <div className="absolute inset-8 border-2 border-blue-400/70 rounded-xl pointer-events-none animate-pulse" />
            </div>

            <div className="flex gap-2">
              {isCameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-medium hover:bg-rose-500/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all border border-blue-500/30"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Demo Samples */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 font-medium block mb-2">
            Preset Test QR Payloads:
          </span>
          <div className="flex flex-wrap gap-2">
            {demoSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDecodedContent(sample.content);
                  analyzeDecodedQr(sample.content);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-[11px] font-medium text-slate-300 border border-slate-800 hover:border-blue-500/40 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sandboxed Decoded Content Readout */}
        {decodedContent && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Safely Sandboxed Optical Payload</span>
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-mono transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-slate-200 break-all bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              {decodedContent}
            </p>
          </div>
        )}

      </div>

      {/* Loading Scanning State */}
      {isScanning && (
        <LoadingScanner message="Classifying QR scheme, triaging destination against URL & payment engines..." />
      )}

      {/* Scan Results Card */}
      {result && !isScanning && (
        <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-2xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Target Status:
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
              <p className="text-xs text-slate-400">
                Payload Classification: <strong className="text-blue-400 font-mono font-medium">{result.metadata?.payloadType || 'PAYLOAD'}</strong>
              </p>
              <p className="text-xs text-slate-400">
                Triage Pipeline: <strong className="text-slate-300 font-medium">{result.analysisMethod}</strong>
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

          {/* Findings List */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
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
