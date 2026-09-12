import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { AuditLogRecord } from '../types/index.js';
import {
  FileText,
  Clock,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getAuditLogs({ page, limit: 15 });
      if (res.success) {
        setLogs(res.logs);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve audit log trail.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actionColorMap: Record<string, string> = {
    USER_ACTIVATED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    USER_DEACTIVATED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    USER_DELETED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    SCAN_DELETED: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    SYSTEM_INITIALIZED: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Privileged Audit Log Trail
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Immutable ledger of administrative interventions, user status transitions, and data purge events ({totalCount} total entries)
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl card-enterprise overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Administrator</th>
                <th className="py-3.5 px-4 font-semibold">Target</th>
                <th className="py-3.5 px-4 font-semibold">Metadata Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    Fetching audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const badgeClass = actionColorMap[log.action] || 'text-slate-300 bg-slate-800 border-slate-700';
                  const formattedTime = new Date(log.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formattedTime}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${badgeClass}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {log.adminUser?.name || 'System Operator'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {log.adminUser?.email || 'SYSTEM'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-300 font-medium">
                        {log.targetType}: {log.targetId || 'GLOBAL'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : 'None'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
