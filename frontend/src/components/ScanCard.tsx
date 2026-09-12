import React from 'react';
import { Link } from 'react-router-dom';
import { ScanRecord } from '../types/index.js';
import { Globe, QrCode, KeyRound, CreditCard, ArrowRight, Trash2, Bot } from 'lucide-react';

interface ScanCardProps {
  scan: ScanRecord;
  onDelete?: (id: string) => void;
}

export const ScanCard: React.FC<ScanCardProps> = ({ scan, onDelete }) => {
  const typeIcons: Record<string, any> = {
    URL: Globe,
    QR: QrCode,
    OTP: KeyRound,
    UPI: CreditCard,
    CHAT: Bot
  };

  const Icon = typeIcons[scan.type] || Globe;

  const riskBadge = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    MODERATE: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/25'
  }[scan.riskLevel] || 'bg-slate-800 text-slate-300 border-slate-700';

  const formattedDate = new Date(scan.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="p-4 rounded-xl card-enterprise hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Type + Input */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-slate-950 text-blue-400 border border-slate-800 shrink-0 mt-0.5 shadow-inner">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              {scan.type}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${riskBadge}`}>
              {scan.riskLevel}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {formattedDate}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-200 truncate" title={scan.maskedInput}>
            {scan.maskedInput}
          </p>
        </div>
      </div>

      {/* Right: Score + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <div className="text-right">
          <div className="text-base sm:text-lg font-bold font-mono text-white">
            {scan.riskScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <span className="text-[9px] text-slate-400 uppercase font-mono">Risk Index</span>
        </div>

        <Link
          to={`/result/${scan.id}`}
          state={{ scanData: scan }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-xs font-semibold text-blue-400 hover:text-blue-300 border border-blue-500/25 transition-colors shadow-sm"
        >
          <span>Report</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(scan.id)}
            title="Delete this scan from history"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
