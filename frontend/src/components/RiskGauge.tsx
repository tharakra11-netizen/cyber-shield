import React from 'react';
import { RiskLevel } from '../types/index.js';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 - 100
  confidence?: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  confidence = 90,
  level,
  size = 'md'
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  // Refined enterprise severity colors
  let strokeColor = '#10b981'; // Emerald
  let glowClass = 'shadow-emerald-glow';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  let Icon = ShieldCheck;

  if (clampedScore >= 75 || level === 'CRITICAL') {
    strokeColor = '#ef4444'; // Red
    glowClass = 'shadow-red-glow';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    Icon = AlertOctagon;
  } else if (clampedScore >= 50 || level === 'HIGH') {
    strokeColor = '#f97316'; // Orange
    glowClass = 'shadow-red-glow';
    badgeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    Icon = ShieldAlert;
  } else if (clampedScore >= 25 || level === 'MODERATE') {
    strokeColor = '#f59e0b'; // Amber
    glowClass = 'shadow-amber-glow';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    Icon = AlertTriangle;
  }

  const dimension = size === 'sm' ? 130 : size === 'lg' ? 200 : 160;
  const strokeWidth = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className={`relative flex items-center justify-center rounded-full ${glowClass}`}>
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-225"
          viewBox={`0 0 ${dimension} ${dimension}`}
        >
          {/* Background Arc Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Colored Score Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon className="w-4 h-4 mb-0.5" style={{ color: strokeColor }} />
          <div className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-white">
            {clampedScore}
            <span className="text-xs text-slate-500 font-normal ml-0.5">/100</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-semibold text-slate-400 mt-0.5">
            Risk Index
          </span>
        </div>
      </div>

      {/* Severity Badge & Confidence */}
      <div className="mt-3 flex flex-col items-center gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${badgeBg}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: strokeColor }} />
          {level} RISK
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Confidence: <strong className="text-slate-300">{confidence}%</strong>
        </span>
      </div>
    </div>
  );
};
