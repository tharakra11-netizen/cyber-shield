import React from 'react';
import { Shield } from 'lucide-react';

interface LoadingScannerProps {
  message?: string;
}

export const LoadingScanner: React.FC<LoadingScannerProps> = ({
  message = 'Analyzing threat indicators & running heuristic engines...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-xl text-center">
      <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
        {/* Radar Ring 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping opacity-60" />
        {/* Radar Ring 2 */}
        <div className="absolute inset-2 rounded-full border border-blue-400/40 animate-pulse" />
        {/* Central Shield */}
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Shield className="w-6 h-6 animate-bounce" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-white tracking-wide">
        Inspecting Target Telemetry
      </h3>
      <p className="text-xs text-blue-300/90 mt-1 max-w-sm">
        {message}
      </p>
      <div className="mt-4 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span>Evaluating 40+ multi-vector heuristics</span>
      </div>
    </div>
  );
};
