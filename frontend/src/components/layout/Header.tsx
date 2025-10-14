import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchUnreadCount } from '@/store/slices/notificationSlice';
import { User } from '@/types';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  user 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch unread count on mount and interval
  useEffect(() => {
    dispatch(fetchUnreadCount());
    
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center flex-1">
        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Header title */}
        <h1 className="ml-4 md:ml-0 text-lg font-semibold text-gray-900 hidden sm:block">
          CNC Task Management
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {unreadCount > 0 ? (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-2">
                      You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </p>
                    <Link
                      to="/notifications"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.avatarUrl ? (
              <img
                className="h-8 w-8 rounded-full"
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
            )}
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" aria-hidden="true" />
                    Your Profile
                  </div>
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center">
                    <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" aria-hidden="true" />
                    Settings
                  </div>
                </Link>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" aria-hidden="true" />
                    Sign out
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;