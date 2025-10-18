import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand and copyright */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">CNC</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} CNC Task Management. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Support
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </a>
          </div>

          {/* Version info */}
          <div className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</div>
        </div>
      </div>
    </footer>
  );
};
