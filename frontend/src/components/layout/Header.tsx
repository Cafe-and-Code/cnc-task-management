import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { addNotification, setMobileMenuOpen } from '@store/slices/uiSlice';
import { clearAuth } from '@store/slices/authSlice';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { NotificationCenter, NotificationBell } from './NotificationCenter';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Breadcrumb } from './Breadcrumb';

interface HeaderProps {
  onSidebarToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAppSelector(state => state.auth);
  const { theme, notifications } = useAppSelector(state => state.ui);
  const { isManagement } = useRolePermission();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      dispatch(clearAuth());
      navigate('/auth/login');
      dispatch(
        addNotification({
          type: 'success',
          title: 'Logged Out',
          message: 'You have been successfully logged out.',
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Logout Failed',
          message: 'Failed to log out. Please try again.',
        })
      );
    }
    setIsProfileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }];

    if (pathnames.length > 1) {
      if (pathnames[0] === 'projects') {
        breadcrumbs.push({ label: 'Projects', path: '/projects' });
        if (pathnames[1] && pathnames[1] !== 'projects') {
          breadcrumbs.push({ label: 'Project Details', path: location.pathname });
        }
      }
    }

    return breadcrumbs;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button and breadcrumbs */}
        <div className="flex items-center flex-1 space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Breadcrumbs - Responsive */}
          <div className="hidden sm:block">
            <Breadcrumb />
          </div>
        </div>

        {/* Center - Search bar - Responsive */}
        <div className="flex-1 max-w-lg mx-2 sm:mx-4">
          {/* Mobile search button */}
          <button className="p-2 text-gray-400 rounded-md md:hidden hover:text-gray-500 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, tasks, people..."
                className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              />
            </div>
          </form>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="relative flex items-center space-x-2 sm:space-x-4">
          {/* Notifications - Always visible on mobile */}
          <NotificationBell
            onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
            unreadCount={unreadCount}
          />
          {/* Notification dropdown/modal */}
          {isNotificationMenuOpen && (
            <NotificationCenter
              isOpen={isNotificationMenuOpen}
              onClose={() => setIsNotificationMenuOpen(false)}
            />
          )}

          {/* Theme toggle - Hide on small mobile */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center p-1 text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
            >
              {user?.avatarUrl ? (
                <img className="w-8 h-8 rounded-full" src={user.avatarUrl} alt="Profile" />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="hidden ml-2 text-sm font-medium lg:block">{user?.firstName}</span>
            </button>

            {/* Profile dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Your Profile
                  </Link>
                  {isManagement && (
                    <Link
                      to="/admin"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Admin Settings
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {window.innerWidth < 768 && searchQuery && (
        <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, tasks, people..."
                className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
