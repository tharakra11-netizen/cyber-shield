import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { ScanRecord, ScanType, RiskLevel } from '../types/index.js';
import { ScanCard } from '../components/ScanCard.js';
import {
  History,
  Filter,
  Search,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ScanHistory: React.FC = () => {
  const { showToast } = useToast();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.scans.list({
        type: typeFilter,
        riskLevel: riskFilter,
        search: searchQuery,
        page,
        limit: 10
      });
      if (res.success) {
        setScans(res.scans);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load scan history.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, riskFilter, searchQuery, page, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDeleteSingle = async (id: string) => {
    try {
      const res = await api.scans.delete(id);
      if (res.success) {
        showToast('Scan record removed from history.', 'success');
        setScans(prev => prev.filter(s => s.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete scan.', 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await api.scans.clearAll();
      if (res.success) {
        showToast('All scan records cleared successfully.', 'success');
        setScans([]);
        setTotalCount(0);
        setShowClearConfirm(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to clear history.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Personal Telemetry Audit Log
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, filter, or purge your past threat analyses. Total: <strong className="text-blue-300 font-medium">{totalCount} scans</strong>
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl card-enterprise shadow-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search within target inputs or domains..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono transition-all"
          >
            <option value="ALL">All Threat Vectors</option>
            <option value="URL">URL Phishing</option>
            <option value="QR">QR Code</option>
            <option value="OTP">OTP Fraud</option>
            <option value="UPI">UPI Fraud</option>
            <option value="CHAT">CyberBot AI / Chatbot</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="sm:col-span-3">
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono transition-all"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk (Safe)</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Threat</option>
          </select>
        </div>

      </div>

      {/* Scans List */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Filtering audit history...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-750">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Matching Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No threat records matched your active filters or search terms. Try clearing filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map(scan => (
            <ScanCard
              key={scan.id}
              scan={scan}
              onDelete={handleDeleteSingle}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs font-mono text-slate-400">
          <div>
            Page <strong className="text-white font-medium">{page}</strong> of <strong className="text-white font-medium">{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors border border-slate-750"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors border border-slate-750"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Purge All Telemetry History?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently delete all {totalCount} threat scan logs from your account. This operation cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-md transition-colors"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
