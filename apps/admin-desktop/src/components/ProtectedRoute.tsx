import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'supabase-client';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, profile, isLoading, role } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 20 }}>Loading authentication...</div>;
  }

  // Not logged in
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  // Account inactive
  if (profile.account_status !== 'ACTIVE') {
    return <div style={{ padding: 20, color: 'red' }}>Your account is inactive. Please contact an administrator.</div>;
  }

  // Role check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <div style={{ padding: 20, color: 'red' }}>Unauthorized Access. Admin privileges required.</div>;
  }

  return <Outlet />;
};
