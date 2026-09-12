import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { ScanRecord } from '../types/index.js';
import { ScanCard } from '../components/ScanCard.js';
import {
  Activity,
  Search,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminScans: React.FC = () => {
  const { showToast } = useToast();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchScans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getScans({
        type: typeFilter,
        riskLevel: riskFilter,
        search,
        page,
        limit: 12
      });
      if (res.success) {
        setScans(res.scans);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch global scans.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, riskFilter, search, page, showToast]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const handleDeleteScan = async (id: string) => {
    try {
      const res = await api.admin.deleteScan(id);
      if (res.success) {
        showToast('Scan purged and logged to audit trail.', 'success');
        setScans(prev => prev.filter(s => s.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete scan.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Global Telemetry Explorer
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Inspect, filter, and audit all incoming threat evaluations across the platform ({totalCount} total scans)
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search targets, domains, or payloads..."
            className="w-full bg-slate-950/80 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/80 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono transition-all"
          >
            <option value="ALL">All Threat Vectors</option>
            <option value="URL">URL Phishing</option>
            <option value="QR">QR Code</option>
            <option value="OTP">OTP Fraud</option>
            <option value="UPI">UPI Fraud</option>
            <option value="CHAT">CyberBot AI</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/80 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono transition-all"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk (Safe)</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Threat</option>
          </select>
        </div>
      </div>

      {/* Results Feed */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading global scans...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Activity className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">No scans match active criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map(scan => (
            <ScanCard
              key={scan.id}
              scan={scan}
              onDelete={handleDeleteScan}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400">
          <div>
            Page <strong className="text-white font-medium">{page}</strong> of <strong className="text-white font-medium">{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-white disabled:opacity-40 border border-slate-750 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-white disabled:opacity-40 border border-slate-750 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
