import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/redux';
import { useRolePermission } from '@components/auth/RoleBasedRoute';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  current: boolean;
  roles?: string[];
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects } = useAppSelector(state => state.projects);
  const { user } = useAppSelector(state => state.auth);
  const { canAccess } = useRolePermission();

  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      current: location.pathname.startsWith('/projects'),
      roles: ['Admin', 'ProductOwner', 'ScrumMaster', 'Developer'],
      badge: projects.length,
    },
    {
      name: 'Sprints',
      href: '/sprints',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      current: location.pathname.startsWith('/sprints'),
      roles: ['Admin', 'ProductOwner', 'ScrumMaster', 'Developer'],
    },
    {
      name: 'Kanban Board',
      href: '/kanban',
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
      current: location.pathname.startsWith('/kanban'),
      roles: ['Admin', 'ProductOwner', 'ScrumMaster', 'Developer'],
    },
    {
      name: 'Reports',
      href: '/reports',
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
      current: location.pathname.startsWith('/reports'),
      roles: ['Admin', 'ProductOwner', 'ScrumMaster', 'Stakeholder'],
    },
  ];

  const teamNavigation: NavItem[] = [
    {
      name: 'Teams',
      href: '/teams',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      current: location.pathname.startsWith('/teams'),
      roles: ['Admin', 'ProductOwner', 'ScrumMaster'],
    },
  ];

  const adminNavigation: NavItem[] = [
    {
      name: 'Admin',
      href: '/admin',
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
      current: location.pathname.startsWith('/admin'),
      roles: ['Admin'],
    },
  ];

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => !item.roles || canAccess(item.roles as any[]));
  };

  const filteredNavigation = filterNavItems(navigation);
  const filteredTeamNavigation = filterNavItems(teamNavigation);
  const filteredAdminNavigation = filterNavItems(adminNavigation);

  return (
    <div className="flex flex-col h-full">
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CNC</span>
            </div>
            {!isCollapsed && (
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Task Management
              </span>
            )}
          </Link>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* User info */}
      {!isCollapsed && user && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="Profile" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Main navigation */}
        {filteredNavigation.map(item => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
              item.current
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
            }`}
          >
            <svg
              className={`mr-3 h-5 w-5 flex-shrink-0 ${item.current ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}
            >
              {item.icon}
            </svg>
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.current
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}

        {/* Teams section */}
        {filteredTeamNavigation.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {!isCollapsed && 'Team'}
              </div>
            </div>
            {filteredTeamNavigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  item.current
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${item.current ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {item.icon}
                </svg>
                {!isCollapsed && <span className="flex-1">{item.name}</span>}
              </Link>
            ))}
          </>
        )}

        {/* Admin section */}
        {filteredAdminNavigation.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {!isCollapsed && 'Administration'}
              </div>
            </div>
            {filteredAdminNavigation.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  item.current
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${item.current ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {item.icon}
                </svg>
                {!isCollapsed && <span className="flex-1">{item.name}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Quick actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-200 ${
            isCollapsed ? 'px-3 py-2' : 'px-4 py-3'
          }`}
        >
          <svg
            className="h-4 w-4 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {!isCollapsed && <span>New Project</span>}
        </button>
      </div>
    </div>
  );
};
