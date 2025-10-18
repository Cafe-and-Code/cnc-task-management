import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { toggleSidebar, setSidebarCollapsed } from '@store/slices/uiSlice';
import { PageErrorBoundary } from './PageErrorBoundary';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, isMobileMenuOpen } = useAppSelector(state => state.ui);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Auto-collapse sidebar on mobile and tablet
      if ((mobile || tablet) && !sidebarCollapsed) {
        dispatch(setSidebarCollapsed(true));
      } else if (!mobile && !tablet && sidebarCollapsed) {
        dispatch(setSidebarCollapsed(false));
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [dispatch, sidebarCollapsed]);

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleMobileMenuClose = () => {
    if (isMobile) {
      dispatch(setSidebarCollapsed(true));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Overlay for mobile menu */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      <div className={`flex flex-1 relative ${isMobile || isTablet ? '' : 'overflow-hidden'}`}>
        {/* Sidebar */}
        <div
          className={`
            ${isMobile || isTablet ? 'fixed' : 'relative'}
            ${isMobile || isTablet ? 'z-50' : 'z-10'}
            ${isMobile || isTablet ? 'lg:hidden' : ''}
            transition-transform duration-300 ease-in-out
            ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
            ${isMobile ? 'w-72' : isTablet ? 'w-60' : 'w-64'}
            h-full lg:h-auto
            bg-white dark:bg-gray-800 shadow-lg lg:shadow-sm
            border-r border-gray-200 dark:border-gray-700
            ${isMobile || isTablet ? 'overscroll-y-auto' : ''}
          `}
        >
          <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
        </div>

        {/* Main content area */}
        <div className={`flex-1 flex flex-col min-w-0 ${isMobile || isTablet ? 'ml-0' : ''}`}>
          {/* Header */}
          <Header onSidebarToggle={handleSidebarToggle} />

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            <div
              className={`
              container mx-auto px-4 py-6
              ${isMobile ? 'max-w-full pb-20' : 'sm:px-6 lg:px-8'}
              ${isTablet ? 'max-w-4xl' : ''}
              ${isMobile ? 'touch-pan-y' : ''}
            `}
            >
              <PageErrorBoundary>
                <Outlet />
              </PageErrorBoundary>
            </div>
          </main>

          {/* Footer - Hidden on mobile for better UX */}
          <div className={`${isMobile ? 'hidden' : 'block'}`}>
            <Footer />
          </div>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
              <div className="grid grid-cols-5 h-16">
                <button className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="text-xs">Home</span>
                </button>
                <button className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="text-xs">Projects</span>
                </button>
                <button className="flex flex-col items-center justify-center text-brand-primary">
                  <div className="relative">
                    <svg
                      className="w-5 h-5 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-xs">Quick</span>
                </button>
                <button className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="text-xs">Board</span>
                </button>
                <button className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-xs">Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
