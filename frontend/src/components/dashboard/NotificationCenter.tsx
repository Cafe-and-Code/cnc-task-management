import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'project' | 'sprint';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading notifications
    const loadNotifications = async () => {
      setIsLoading(true);

      // Mock notifications - in real implementation, this would come from API
      const now = new Date();
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'task',
          title: 'Task Assigned',
          message: 'You have been assigned to "API Integration" task',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          link: '/projects/1/tasks/123',
          action: {
            label: 'View Task',
            onClick: () => console.log('Navigate to task'),
          },
        },
        {
          id: '2',
          type: 'sprint',
          title: 'Sprint Starting Soon',
          message: 'Sprint 4 will start in 2 days',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          link: '/sprints/4',
        },
        {
          id: '3',
          type: 'success',
          title: 'Task Completed',
          message: '"Database Design" task was marked as completed',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: true,
          link: '/projects/1/tasks/456',
        },
        {
          id: '4',
          type: 'warning',
          title: 'Deadline Approaching',
          message: 'Project "Mobile App Development" deadline is in 3 days',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          link: '/projects/1',
        },
        {
          id: '5',
          type: 'project',
          title: 'New Team Member',
          message: 'Sarah Wilson joined the "Mobile App Development" project',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          link: '/projects/1/team',
        },
        {
          id: '6',
          type: 'info',
          title: 'System Update',
          message: 'New features have been added to the dashboard',
          timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
          read: true,
        },
        {
          id: '7',
          type: 'error',
          title: 'Build Failed',
          message: 'Automated build failed for branch "feature/user-auth"',
          timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
          read: true,
          link: '/projects/1/builds/789',
        },
      ];

      setNotifications(
        mockNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
      setIsLoading(false);
    };

    loadNotifications();
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        );
      case 'project':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case 'sprint':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'project':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'sprint':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'success':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium"
              >
                Mark all read
              </button>
            )}
            {!showAll && notifications.length > 5 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium"
              >
                View all
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  !notification.read
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAll && notifications.length > 5 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(false)}
              className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
