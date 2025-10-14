import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '@/types';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    allowedRoles: [],
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: ClipboardDocumentListIcon,
    allowedRoles: [],
  },
  {
    name: 'Sprints',
    href: '/sprints',
    icon: RectangleGroupIcon,
    allowedRoles: [],
  },
  {
    name: 'User Stories',
    href: '/user-stories',
    icon: Squares2X2Icon,
    allowedRoles: [],
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: Squares2X2Icon,
    allowedRoles: [],
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: UserGroupIcon,
    allowedRoles: [],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    allowedRoles: [],
  },
  {
    name: 'GitHub',
    href: '/github',
    icon: CodeBracketIcon,
    allowedRoles: [],
  },
  {
    name: 'Security',
    href: '/security',
    icon: ShieldCheckIcon,
    allowedRoles: [UserRole.Admin],
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Cog6ToothIcon,
    allowedRoles: [UserRole.Admin],
  },
];

const userNavigationItems = [
  {
    name: 'Profile',
    href: '/profile',
    icon: UserCircleIcon,
    allowedRoles: [],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    allowedRoles: [],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) => {
  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter((item) => {
    if (item.allowedRoles.length === 0) return true;
    return userRole && item.allowedRoles.includes(userRole as UserRole);
  });

  // Filter user navigation items based on user role
  const filteredUserNavigationItems = userNavigationItems.filter((item) => {
    if (item.allowedRoles.length === 0) return true;
    return userRole && item.allowedRoles.includes(userRole as UserRole);
  });

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">CNC Task Manager</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Navigation */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="space-y-2">
              {filteredUserNavigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;