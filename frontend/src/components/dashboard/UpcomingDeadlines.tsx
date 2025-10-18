import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Deadline {
  id: string;
  title: string;
  type: 'project' | 'sprint' | 'task' | 'milestone';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'overdue' | 'completed';
  projectName?: string;
  assignee?: string;
}

export const UpcomingDeadlines: React.FC = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading deadlines
    const loadDeadlines = async () => {
      setIsLoading(true);

      // Mock deadlines - in real implementation, this would come from API
      const now = new Date();
      const mockDeadlines: Deadline[] = [
        {
          id: '1',
          title: 'Sprint 3 Review Meeting',
          type: 'sprint',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          priority: 'high',
          status: 'upcoming',
          projectName: 'Mobile App Development',
        },
        {
          id: '2',
          title: 'API Integration Complete',
          type: 'milestone',
          dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          priority: 'medium',
          status: 'upcoming',
          projectName: 'Mobile App Development',
        },
        {
          id: '3',
          title: 'Database Design Review',
          type: 'task',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          priority: 'medium',
          status: 'upcoming',
          projectName: 'Mobile App Development',
          assignee: 'John Doe',
        },
        {
          id: '4',
          title: 'Project Milestone 1',
          type: 'project',
          dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          priority: 'high',
          status: 'upcoming',
          projectName: 'E-commerce Platform',
        },
        {
          id: '5',
          title: 'UI Components Library',
          type: 'task',
          dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          priority: 'low',
          status: 'upcoming',
          projectName: 'Mobile App Development',
          assignee: 'Jane Smith',
        },
      ];

      setDeadlines(mockDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
      setIsLoading(false);
    };

    loadDeadlines();
  }, []);

  const getDaysUntil = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: Deadline['status']) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'upcoming':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: Deadline['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: Deadline['type']) => {
    switch (type) {
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
      case 'milestone':
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
      default:
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
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Deadlines
          </h3>
          <Link
            to="/deadlines"
            className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : deadlines.length === 0 ? (
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
                d="M8 7V3m8 4V3m-9 8h10M3 21h18M3 10h18M8 21h4m-4 0h4m0 0v4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No upcoming deadlines</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.slice(0, 5).map(deadline => {
              const daysUntil = getDaysUntil(deadline.dueDate);
              const isOverdue = daysUntil < 0;

              return (
                <div
                  key={deadline.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    isOverdue
                      ? 'border-red-200 dark:border-red-800'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-full ${getStatusColor(deadline.status)}`}>
                    {getTypeIcon(deadline.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {deadline.title}
                        </p>
                        {deadline.projectName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {deadline.projectName}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(deadline.status)}`}
                      >
                        {isOverdue ? 'Overdue' : `${daysUntil}d`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`text-xs font-medium ${getPriorityColor(deadline.priority)}`}
                      >
                        {deadline.priority.toUpperCase()}
                      </span>
                      {deadline.assignee && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {deadline.assignee}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(deadline.dueDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
