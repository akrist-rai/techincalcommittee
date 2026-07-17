import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="admin-loading">LOADING…</div>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};
