import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { AnalyticsData } from '../types/index.js';
import {
  BarChart3,
  PieChart,
  ShieldCheck,
  ShieldAlert,
  Layers,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.admin.getAnalytics();
        if (res.success && res.analytics) {
          setData(res.analytics);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-slate-400 animate-pulse">
        Aggregating multi-vector threat analytics...
      </div>
    );
  }

  const totalScans = data?.totalScans || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Threat Intelligence Analytics
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Statistical distribution of scanned vectors, risk profiles, and interception rates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Risk Distribution Chart Card */}
        <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Risk Severity Breakdown
              </h3>
              <p className="text-xs text-slate-400">Distribution across 4 danger thresholds</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            {data?.riskDistribution.map((item, idx) => {
              const pct = totalScans > 0 ? Math.round((item.count / totalScans) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-slate-400">
                      <strong className="text-white font-medium">{item.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Analyzed Datapoints:</span>
            <strong className="text-white text-sm font-semibold">{totalScans} Telemetry Scans</strong>
          </div>
        </div>

        {/* Vector Distribution Chart Card */}
        <div className="p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Vector Volume Distribution
              </h3>
              <p className="text-xs text-slate-400">Inspection volume by ingress vector</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            {data?.typeDistribution.map((item, idx) => {
              const pct = totalScans > 0 ? Math.round((item.count / totalScans) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-slate-400">
                      <strong className="text-white font-medium">{item.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Highest Volume Vector:</span>
            <strong className="text-blue-400 text-sm font-semibold">
              {data?.typeDistribution.reduce((max, cur) => cur.count > max.count ? cur : max, data.typeDistribution[0])?.name || 'N/A'}
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
};
