import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import { User, Shield, Lock, Mail, KeyRound, Check, RefreshCw } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const payload: any = { name };
      if (newPassword) {
        if (!currentPassword) {
          showToast('Current password is required to set a new password.', 'warning');
          setIsUpdating(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.auth.updateProfile(payload);
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Profile updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security Profile & Credentials
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage your operator identity, password authentication, and session settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-1 p-6 rounded-2xl card-enterprise shadow-xl space-y-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md border border-blue-400/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
          </div>

          <div className="pt-2 flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${
              user?.role === 'ADMIN'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              Role: {user?.role}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-2 text-left">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <strong className="text-emerald-400">ACTIVE</strong>
            </div>
            <div className="flex justify-between">
              <span>Verification:</span>
              <strong className="text-emerald-400">VERIFIED</strong>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl card-enterprise shadow-xl space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Identity & Authentication
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Email Address (Read-Only)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block">
                Update Password (Optional)
              </span>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 font-mono">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all disabled:opacity-50 border border-blue-500/30 shadow-md shadow-blue-600/20 active:scale-[0.98]"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
