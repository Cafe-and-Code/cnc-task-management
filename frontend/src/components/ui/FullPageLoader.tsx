import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface FullPageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Loading...',
  size = 'lg',
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
      </div>
    </div>
  );
};

interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
};

interface ComponentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({
  isLoading,
  children,
  fallback,
  size = 'md',
}) => {
  if (isLoading) {
    return fallback || <PageLoader size={size} />;
  }

  return <>{children}</>;
};
