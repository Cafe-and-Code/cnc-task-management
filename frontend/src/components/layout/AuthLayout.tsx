import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CNC Task Management</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Modern Scrum project management for teams
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <Outlet />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 CNC Task Management. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
