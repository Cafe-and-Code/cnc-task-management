import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ProjectStatus } from '@types/index';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface ActivityItem {
  id: string;
  type:
    | 'project_created'
    | 'project_updated'
    | 'status_changed'
    | 'member_added'
    | 'member_removed'
    | 'sprint_created'
    | 'sprint_completed'
    | 'task_created'
    | 'task_updated'
    | 'task_completed'
    | 'comment_added'
    | 'file_attached'
    | 'milestone_reached';
  title: string;
  description?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  timestamp: Date;
  metadata?: {
    [key: string]: any;
  };
  link?: string;
}

interface ActivityFilter {
  type?: string;
  user?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface ProjectActivityTimelineProps {
  projectId: string;
  limit?: number;
  autoRefresh?: boolean;
  showFilters?: boolean;
}

const activityTypeIcons = {
  project_created: '🚀',
  project_updated: '✏️',
  status_changed: '📊',
  member_added: '👥',
  member_removed: '👤',
  sprint_created: '🏃',
  sprint_completed: '✅',
  task_created: '📝',
  task_updated: '🔄',
  task_completed: '✨',
  comment_added: '💬',
  file_attached: '📎',
  milestone_reached: '🎯',
};

const activityTypeColors = {
  project_created: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  project_updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  status_changed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  member_added: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  member_removed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  sprint_created: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  sprint_completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  task_created: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  task_updated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  task_completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  comment_added: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  file_attached: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  milestone_reached: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
};

const activityTypeLabels = {
  project_created: 'Project Created',
  project_updated: 'Project Updated',
  status_changed: 'Status Changed',
  member_added: 'Member Added',
  member_removed: 'Member Removed',
  sprint_created: 'Sprint Created',
  sprint_completed: 'Sprint Completed',
  task_created: 'Task Created',
  task_updated: 'Task Updated',
  task_completed: 'Task Completed',
  comment_added: 'Comment Added',
  file_attached: 'File Attached',
  milestone_reached: 'Milestone Reached',
};

export const ProjectActivityTimeline: React.FC<ProjectActivityTimelineProps> = ({
  projectId,
  limit = 50,
  autoRefresh = true,
  showFilters = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [showMore, setShowMore] = useState(false);

  // Generate mock activities - in real implementation, this would come from API
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'task_completed',
            title: 'Task completed: "Database Schema Design"',
            description: 'Task marked as completed by John Doe',
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            metadata: {
              taskId: '123',
              taskName: 'Database Schema Design',
              assignee: 'John Doe',
            },
            link: '/tasks/123',
          },
          {
            id: '2',
            type: 'comment_added',
            title: 'New comment on "User Authentication API"',
            description: 'Jane Smith commented: "This needs more validation"',
            user: {
              id: '2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
            },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            metadata: {
              taskId: '456',
              taskName: 'User Authentication API',
              commentPreview: 'This needs more validation',
            },
            link: '/tasks/456',
          },
          {
            id: '3',
            type: 'sprint_created',
            title: 'Sprint 4 created',
            description: 'New sprint started with 12 stories and velocity goal of 21 points',
            user: {
              id: '3',
              name: 'Mike Johnson',
              email: 'mike.johnson@example.com',
            },
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            metadata: {
              sprintId: '4',
              sprintName: 'Sprint 4',
              storyCount: 12,
              velocityGoal: 21,
            },
            link: '/sprints/4',
          },
          {
            id: '4',
            type: 'status_changed',
            title: 'Project status changed to On Hold',
            description: 'Status changed from Active to On Hold due to resource constraints',
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            metadata: {
              fromStatus: ProjectStatus.Active,
              toStatus: ProjectStatus.OnHold,
              reason: 'Resource constraints',
            },
          },
          {
            id: '5',
            type: 'member_added',
            title: 'Sarah Wilson joined the team',
            description: 'Sarah Wilson added to the project as a Developer',
            user: {
              id: '4',
              name: 'Sarah Wilson',
              email: 'sarah.wilson@example.com',
            },
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            metadata: {
              memberId: '5',
              memberName: 'Sarah Wilson',
              role: 'Developer',
            },
          },
          {
            id: '6',
            type: 'file_attached',
            title: 'File attached to "UI Design Mockups"',
            description: 'John Doe attached "wireframes_v2.fig" to the task',
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            metadata: {
              taskId: '789',
              taskName: 'UI Design Mockups',
              fileName: 'wireframes_v2.fig',
              fileSize: '2.5 MB',
            },
            link: '/tasks/789',
          },
          {
            id: '7',
            type: 'milestone_reached',
            title: 'Project milestone reached: "Backend API Complete"',
            description: 'Major milestone achieved: All backend APIs are now complete and tested',
            user: {
              id: '3',
              name: 'Mike Johnson',
              email: 'mike.johnson@example.com',
            },
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            metadata: {
              milestoneId: '1',
              milestoneName: 'Backend API Complete',
              percentage: 100,
            },
          },
          {
            id: '8',
            type: 'project_created',
            title: 'Project created',
            description: 'CNC Task Management System project was created',
            user: {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            metadata: {
              projectId: projectId,
              projectTemplate: 'Agile Software Development',
            },
          },
        ];

        setActivities(mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      } catch (error: any) {
        console.error('Failed to load activities:', error);
        setError(error.message || 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();

    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshActivities();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [projectId, autoRefresh, limit]);

  const refreshActivities = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      // In a real implementation, this would fetch new activities from the API
      console.log('Refreshing activities...');
    } catch (error: any) {
      console.error('Failed to refresh activities:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFilters = (activities: ActivityItem[]): ActivityItem[] => {
    let filtered = [...activities];

    // Type filter
    if (filter.type) {
      filtered = filtered.filter(activity => activity.type === filter.type);
    }

    // User filter
    if (filter.user) {
      filtered = filtered.filter(activity => activity.user.id === filter.user);
    }

    // Date range filter
    if (filter.dateRange) {
      filtered = filtered.filter(
        activity =>
          activity.timestamp >= filter.dateRange!.start &&
          activity.timestamp <= filter.dateRange!.end
      );
    }

    return filtered;
  };

  const filteredActivities = applyFilters(activities);
  const displayActivities = showMore ? filteredActivities : filteredActivities.slice(0, limit);

  const getUserInitials = (user: ActivityItem['user']) => {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getUniqueUsers = () => {
    const userSet = new Set(activities.map(a => a.user.id));
    return Array.from(userSet)
      .map(id => activities.find(a => a.user.id === id)?.user)
      .filter(Boolean);
  };

  const getUniqueTypes = () => {
    const typeSet = new Set(activities.map(a => a.type));
    return Array.from(typeSet);
  };

  const clearFilters = () => {
    setFilter({});
  };

  const hasActiveFilters = Object.keys(filter).some(key => filter[key as keyof ActivityFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity Timeline</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track all project activities and changes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {autoRefresh && (
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}
              ></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isRefreshing ? 'Refreshing...' : 'Live'}
              </span>
            </div>
          )}
          <button
            onClick={refreshActivities}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-primary hover:text-brand-primary/80"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Activity Type
              </label>
              <select
                value={filter.type || ''}
                onChange={e => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>
                    {activityTypeLabels[type as keyof typeof activityTypeLabels]}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                User
              </label>
              <select
                value={filter.user || ''}
                onChange={e => setFilter(prev => ({ ...prev, user: e.target.value || undefined }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Users</option>
                {getUniqueUsers().map(
                  user =>
                    user && (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    )
                )}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value=""
                onChange={e => {
                  const value = e.target.value;
                  let dateRange;
                  if (value === 'today') {
                    const today = new Date();
                    dateRange = {
                      start: new Date(today.setHours(0, 0, 0, 0)),
                      end: new Date(today.setHours(23, 59, 59, 999)),
                    };
                  } else if (value === 'week') {
                    const now = new Date();
                    dateRange = {
                      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                      end: now,
                    };
                  } else if (value === 'month') {
                    const now = new Date();
                    dateRange = {
                      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                      end: now,
                    };
                  } else {
                    dateRange = undefined;
                  }
                  setFilter(prev => ({ ...prev, dateRange }));
                }}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Activities */}
      {displayActivities.length === 0 ? (
        <div className="text-center py-12">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No activities found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Project activities will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.map(activity => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
            >
              {/* Activity Icon */}
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    activityTypeColors[activity.type]
                  }`}
                >
                  {activityTypeIcons[activity.type]}
                </div>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>

                {activity.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.description}
                  </p>
                )}

                {/* User Info */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {getUserInitials(activity.user)}
                    </div>
                    <span>{activity.user.name}</span>
                  </div>
                  <span>•</span>
                  <span>{activityTypeLabels[activity.type]}</span>
                </div>

                {/* Activity Details */}
                {activity.metadata && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-1">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>
                          {typeof value === 'boolean'
                            ? value
                              ? 'Yes'
                              : 'No'
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Link */}
                {activity.link && (
                  <div className="mt-2">
                    <a
                      href={activity.link}
                      className="inline-flex items-center text-xs text-brand-primary hover:text-brand-primary/80 font-medium"
                    >
                      View details
                      <svg
                        className="ml-1 h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Show More */}
          {!showMore && filteredActivities.length > limit && (
            <div className="text-center">
              <button
                onClick={() => setShowMore(true)}
                className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
              >
                Show more activities ({filteredActivities.length - limit} more)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
