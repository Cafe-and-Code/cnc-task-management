import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();

  // Generate breadcrumbs from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard', isActive: pathnames.length === 0 },
    ];

    if (pathnames.length > 0) {
      if (pathnames[0] === 'projects') {
        breadcrumbs.push({
          label: 'Projects',
          path: '/projects',
          isActive: pathnames.length === 1,
        });

        if (pathnames.length > 1 && pathnames[1]) {
          breadcrumbs.push({
            label: 'Project Details',
            path: location.pathname,
            isActive: true,
          });
        }
      } else if (pathnames[0] === 'sprints') {
        breadcrumbs.push({
          label: 'Sprints',
          path: '/sprints',
          isActive: pathnames.length === 1,
        });

        if (pathnames.length > 1 && pathnames[1]) {
          breadcrumbs.push({
            label: 'Sprint Details',
            path: location.pathname,
            isActive: true,
          });
        }
      } else if (pathnames[0] === 'teams') {
        breadcrumbs.push({
          label: 'Teams',
          path: '/teams',
          isActive: pathnames.length === 1,
        });

        if (pathnames.length > 1 && pathnames[1]) {
          breadcrumbs.push({
            label: 'Team Details',
            path: location.pathname,
            isActive: true,
          });
        }
      } else if (pathnames[0] === 'profile') {
        breadcrumbs.push({
          label: 'Profile',
          path: '/profile',
          isActive: true,
        });
      } else if (pathnames[0] === 'reports') {
        breadcrumbs.push({
          label: 'Reports',
          path: '/reports',
          isActive: pathnames.length === 1,
        });
      } else if (pathnames[0] === 'admin') {
        breadcrumbs.push({
          label: 'Admin',
          path: '/admin',
          isActive: pathnames.length === 1,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path || item.label}>
          {index > 0 && (
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-300 dark:text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}

          {item.path && !item.isActive ? (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`font-medium ${
                item.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Simplified breadcrumb for mobile
export const MobileBreadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const breadcrumbItems = items;

  if (!breadcrumbItems || breadcrumbItems.length <= 1) {
    return null;
  }

  // Show only current page on mobile
  const currentItem = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <div className={`flex items-center space-x-1 text-sm ${className}`}>
      <svg
        className="flex-shrink-0 h-5 w-5 text-gray-300 dark:text-gray-600"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-gray-900 dark:text-white font-medium truncate">
        {currentItem.label}
      </span>
    </div>
  );
};
