import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types/index';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const hasPermission = allowedRoles.includes(user.role);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const hasPermission = allowedRoles.includes(user.role);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Hook for checking user roles
export const useRolePermission = () => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  const hasRole = (role: UserRole): boolean => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return isAuthenticated && user ? roles.includes(user.role) : false;
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    return isAuthenticated && user ? roles.every(role => user.role === role) : false;
  };

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    return hasAnyRole(requiredRoles);
  };

  // Common role checks
  const isAdmin = hasRole(UserRole.Admin);
  const isProductOwner = hasRole(UserRole.ProductOwner);
  const isScrumMaster = hasRole(UserRole.ScrumMaster);
  const isDeveloper = hasRole(UserRole.Developer);
  const isStakeholder = hasRole(UserRole.Stakeholder);

  // Management role checks (Admin, Product Owner, Scrum Master)
  const isManagement = hasAnyRole([UserRole.Admin, UserRole.ProductOwner, UserRole.ScrumMaster]);

  // Technical role checks (Developer, Scrum Master)
  const isTechnical = hasAnyRole([UserRole.Developer, UserRole.ScrumMaster]);

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    isAdmin,
    isProductOwner,
    isScrumMaster,
    isDeveloper,
    isStakeholder,
    isManagement,
    isTechnical,
  };
};
