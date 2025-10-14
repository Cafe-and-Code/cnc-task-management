import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  userRole?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  userRole,
}) => {
  // If userRole is not provided, get it from Redux store
  const authUserRole = useSelector((state: RootState) => state.auth.user?.role);
  const currentUserRole = userRole || authUserRole;

  // Check if user has the required role
  const hasRequiredRole = currentUserRole && allowedRoles.includes(currentUserRole as UserRole);

  // If user doesn't have the required role, redirect to dashboard
  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;