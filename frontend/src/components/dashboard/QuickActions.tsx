import React from 'react';
import { Link } from 'react-router-dom';
import { useRolePermission } from '@components/auth/RoleBasedRoute';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  requiredRole?: 'admin' | 'management' | 'user';
}

export const QuickActions: React.FC = () => {
  const { isManagement, isAdmin } = useRolePermission();

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      title: 'New Project',
      description: 'Create a new project',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      link: '/projects/new',
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      requiredRole: 'management',
    },
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Create a new task',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      link: '/tasks/new',
      color: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
    {
      id: 'start-sprint',
      title: 'Start Sprint',
      description: 'Begin a new sprint',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      link: '/sprints/new',
      color: 'bg-green-500 hover:bg-green-600 text-white',
      requiredRole: 'management',
    },
    {
      id: 'add-user',
      title: 'Add User',
      description: 'Invite team member',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      link: '/users/invite',
      color: 'bg-purple-500 hover:bg-purple-600 text-white',
      requiredRole: 'admin',
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Analytics and insights',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      link: '/reports',
      color: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      requiredRole: 'management',
    },
    {
      id: 'team-settings',
      title: 'Team Settings',
      description: 'Manage team configuration',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      link: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600 text-white',
      requiredRole: 'admin',
    },
  ];

  const hasPermission = (requiredRole?: string) => {
    if (!requiredRole) return true;
    switch (requiredRole) {
      case 'admin':
        return isAdmin;
      case 'management':
        return isManagement || isAdmin;
      case 'user':
        return true;
      default:
        return true;
    }
  };

  const filteredActions = quickActions.filter(action => hasPermission(action.requiredRole));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredActions.map(action => (
            <Link
              key={action.id}
              to={action.link}
              className={`p-4 rounded-lg border transition-all duration-200 ${action.color} border-transparent hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center text-center min-h-[100px]`}
            >
              <div className="mb-2">{action.icon}</div>
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs opacity-90 mt-1">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredActions.length === 0 && (
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No quick actions available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
