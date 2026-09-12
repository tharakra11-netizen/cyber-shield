import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AiChatBot } from './components/AiChatBot.js';

// Pages
import { Home } from './pages/Home.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { ForgotPassword } from './pages/ForgotPassword.js';
import { ResetPassword } from './pages/ResetPassword.js';
import { Dashboard } from './pages/Dashboard.js';
import { UrlScanner } from './pages/UrlScanner.js';
import { QrScanner } from './pages/QrScanner.js';
import { OtpDetector } from './pages/OtpDetector.js';
import { UpiDetector } from './pages/UpiDetector.js';
import { ScanResult } from './pages/ScanResult.js';
import { ScanHistory } from './pages/ScanHistory.js';
import { Profile } from './pages/Profile.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { AdminUsers } from './pages/AdminUsers.js';
import { AdminActivity } from './pages/AdminActivity.js';
import { AdminScans } from './pages/AdminScans.js';
import { AdminAnalytics } from './pages/AdminAnalytics.js';
import { AdminAuditLogs } from './pages/AdminAuditLogs.js';
import { PrivacyPolicy } from './pages/PrivacyPolicy.js';
import { NotFound } from './pages/NotFound.js';

// Protected Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-slate-500 animate-pulse">
        Verifying security credentials...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-slate-500 animate-pulse">
        Verifying administrator privileges...
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 enterprise-mesh subtle-grid">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Core Scanners (Available to both guests & registered users) */}
          <Route path="/scan/url" element={<UrlScanner />} />
          <Route path="/scan/qr" element={<QrScanner />} />
          <Route path="/scan/otp" element={<OtpDetector />} />
          <Route path="/scan/upi" element={<UpiDetector />} />
          <Route path="/result/:id" element={<ScanResult />} />

          {/* Authenticated User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ScanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <AdminRoute>
                <AdminActivity />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scans"
            element={
              <AdminRoute>
                <AdminScans />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminAuditLogs />
              </AdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AiChatBot />
    </div>
  );
};
