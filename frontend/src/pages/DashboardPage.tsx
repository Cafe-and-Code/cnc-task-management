import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { fetchProjects } from '@store/slices/projectsSlice';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { PageLoader } from '@components/layout/LayoutLoader';
import { MetricsOverview } from '@components/dashboard/MetricsOverview';
import { RecentActivityFeed } from '@components/dashboard/RecentActivityFeed';
import { QuickActions } from '@components/dashboard/QuickActions';
import { UpcomingDeadlines } from '@components/dashboard/UpcomingDeadlines';
import { SprintProgressChart } from '@components/dashboard/SprintProgressChart';
import { TeamPerformanceMetrics } from '@components/dashboard/TeamPerformanceMetrics';
import { NotificationCenter } from '@components/dashboard/NotificationCenter';
import { useRealtime } from '@services/realtimeService';
import { dashboardService } from '@services/dashboardService';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { projects, isLoading: projectsLoading } = useAppSelector(state => state.projects);
  const { isManagement, isAdmin } = useRolePermission();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [refreshIntervalId, setRefreshIntervalId] = useState<string | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time setup
  const { isConnected, subscribeToUser, subscribeToNotifications, subscribeToProject } =
    useRealtime({
      onConnect: () => {
        console.log('Real-time connected');
        // Subscribe to relevant channels
        if (user?.id) {
          subscribeToUser(user.id);
          subscribeToNotifications();
          // Subscribe to projects the user is part of
          projects.forEach(project => {
            subscribeToProject(project.id);
          });
        }
      },
      onDisconnect: () => {
        console.log('Real-time disconnected');
      },
      onTaskUpdate: data => {
        console.log('Task update received, invalidating cache');
        dashboardService.handleRealtimeUpdate('task_updated', data);
        // Trigger a light refresh of dashboard data
        backgroundRefresh();
      },
      onProjectUpdate: data => {
        console.log('Project update received, invalidating cache');
        dashboardService.handleRealtimeUpdate('project_updated', data);
        backgroundRefresh();
      },
      onSprintUpdate: data => {
        console.log('Sprint update received, invalidating cache');
        dashboardService.handleRealtimeUpdate('sprint_updated', data);
        backgroundRefresh();
      },
      onUserActivity: data => {
        console.log('User activity received, invalidating cache');
        dashboardService.handleRealtimeUpdate('user_activity', data);
        backgroundRefresh();
      },
      onNotification: data => {
        console.log('Notification received, invalidating cache');
        dashboardService.handleRealtimeUpdate('notification', data);
        // Show toast notification if needed
        // toastService.show(data)
      },
      onError: error => {
        console.error('Real-time connection error:', error);
      },
    });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        await dispatch(fetchProjects({ page: 1, pageSize: 10 })).unwrap();
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, isAuthenticated, refreshKey]);

  // Background refresh helper
  const backgroundRefresh = () => {
    if (isAutoRefreshEnabled) {
      dashboardService.backgroundRefresh();
    }
  };

  // Auto-refresh setup
  useEffect(() => {
    if (isAutoRefreshEnabled && isAuthenticated) {
      // Start auto-refresh every 30 seconds
      const intervalId = dashboardService.startAutoRefresh(() => {
        backgroundRefresh();
        setLastRefresh(new Date());
      }, 30 * 1000);

      setRefreshIntervalId(intervalId);

      return () => {
        dashboardService.stopAutoRefresh(intervalId);
      };
    }
  }, [isAutoRefreshEnabled, isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dashboardService.stopAllAutoRefresh();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    dashboardService.invalidateData(); // Clear all cache
  };

  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled(prev => !prev);
  };

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              {isConnected && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                </div>
              )}
              {!isConnected && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Offline</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.firstName}! Here's what's happening with your projects.
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {formatLastRefresh(lastRefresh)}
              </span>
              {isAutoRefreshEnabled && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Auto-refresh enabled
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                isAutoRefreshEnabled
                  ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
                  : 'border-gray-300 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300'
              }`}
              title={isAutoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isAutoRefreshEnabled ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              {isAutoRefreshEnabled ? 'Auto' : 'Manual'}
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column - 8 columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metrics Overview - Full width */}
          <MetricsOverview />

          {/* Row with Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivityFeed />
            <QuickActions />
          </div>

          {/* Sprint Progress Chart - Full width */}
          {isManagement && <SprintProgressChart />}
        </div>

        {/* Right Column - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Deadlines */}
          <UpcomingDeadlines />

          {/* Team Performance Metrics */}
          {isManagement && <TeamPerformanceMetrics />}

          {/* Notifications Widget */}
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};
