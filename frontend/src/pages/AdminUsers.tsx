import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { User } from '../types/index.js';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  BarChart3,
  FileText
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getUsers({ search, page, limit: 10 });
      if (res.success) {
        setUsers(res.users);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve user list.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (id: string, currentStatus?: boolean) => {
    try {
      const res = await api.admin.toggleUser(id);
      if (res.success) {
        showToast(res.message, 'info');
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: res.isActive } : u));
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account and their scan history?')) {
      return;
    }

    try {
      const res = await api.admin.deleteUser(id);
      if (res.success) {
        showToast('User account successfully purged.', 'success');
        setUsers(prev => prev.filter(u => u.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Operator Identity Directory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage permissions, access states, and audit user activity profiles ({totalCount} total operators)
          </p>
        </div>

        {/* Sub-nav Links */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 text-xs font-semibold text-blue-300 border border-blue-500/40 shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/activity"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-750 transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Logins & Activity</span>
          </Link>
          <Link
            to="/admin/scans"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-750 transition-colors shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>All Scans</span>
          </Link>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
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
            placeholder="Search by name or email..."
            className="w-full bg-slate-900 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl card-enterprise overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Scans</th>
                <th className="py-3.5 px-4 font-semibold">Registered</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                    Loading user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        u.isActive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Disabled</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {u.scanCount ?? 0} scans
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to="/admin/activity"
                          state={{ userId: u.id }}
                          title="Inspect User Logins & Search Data"
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </Link>
                        {u.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => handleToggleActive(u.id, u.isActive)}
                              title={u.isActive ? 'Deactivate User' : 'Activate User'}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                u.isActive
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete User Permanently"
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] font-mono text-slate-500 italic">Self</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
