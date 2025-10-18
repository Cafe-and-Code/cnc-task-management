import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/redux';
import { useRolePermission } from '@components/auth/RoleBasedRoute';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  active?: boolean;
  onClick?: () => void;
  roles?: string[];
}

interface MobileNavigationProps {
  items: NavItem[];
  variant?: 'bottom' | 'sidebar' | 'floating';
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  variant = 'bottom',
  className = '',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { canAccess } = useRolePermission();

  const [activeTab, setActiveTab] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = items.find(
      item => item.href === currentPath || currentPath.startsWith(item.href + '/')
    );
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, [location.pathname, items]);

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.id);

    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }

    // Close sidebar if in sidebar mode
    if (variant === 'sidebar') {
      setIsExpanded(false);
    }
  };

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => !item.roles || canAccess(item.roles));
  };

  const filteredItems = filterNavItems(items);

  if (variant === 'bottom') {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 ${className}`}
      >
        <div className="grid grid-cols-5 h-16">
          {filteredItems.slice(0, 5).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`
                  relative flex flex-col items-center justify-center space-y-1 transition-colors
                  ${
                    isActive
                      ? 'text-brand-primary dark:text-brand-primary'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary'
                  }
                `}
              >
                <div className="relative">
                  <div
                    className={`w-6 h-6 flex items-center justify-center ${isActive ? 'scale-110' : ''}`}
                  >
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium truncate px-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <>
        {/* Overlay */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${isExpanded ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {user?.avatarUrl ? (
                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="Profile" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`
                      px-2 py-1 text-xs rounded-full
                      ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}
                    >
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative">
          {/* Main Action Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center
              transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
              ${isExpanded ? 'rotate-45' : ''}
            `}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* Action Items */}
          <div
            className={`
            absolute bottom-16 right-0 space-y-2 transition-all duration-300
            ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
          `}
          >
            {filteredItems.slice(0, 4).map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`
                  flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3
                  whitespace-nowrap transition-all duration-200 hover:scale-105 focus:outline-none
                  ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-5 h-5 text-brand-primary">{item.icon}</div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Mobile Menu Component
export const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}> = ({ isOpen, onClose, children, title = 'Menu' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Mobile Tab Bar Component
export const MobileTabBar: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    badge?: number | string;
  }>;
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}> = ({ tabs, initialTab, onTabChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              relative flex-1 min-w-0 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium
              border-b-2 transition-colors whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary dark:text-brand-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            <div className="w-4 h-4 flex-shrink-0">{tab.icon}</div>
            <span className="truncate">{tab.label}</span>
            {tab.badge && (
              <span
                className={`
                absolute top-2 right-2 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center
                ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }
              `}
              >
                {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">{activeContent}</div>
    </div>
  );
};
