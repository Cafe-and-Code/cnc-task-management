import React from 'react';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface LayoutLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LayoutLoader: React.FC<LayoutLoaderProps> = ({
  message = 'Loading...',
  size = 'lg',
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...', size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
};

interface ContentLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  fallback?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ContentLoader: React.FC<ContentLoaderProps> = ({
  children,
  isLoading,
  fallback,
  size = 'md',
}) => {
  if (isLoading) {
    return fallback || <PageLoader size={size} />;
  }

  return <>{children}</>;
};

// Skeleton loaders for different content types
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
