import React from 'react';

const DashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to your dashboard!</p>
      
      <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-md">
                  <span className="font-medium text-white">P</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Projects</dt>
                  <dd className="text-lg font-medium text-gray-900">3</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-700 hover:text-indigo-600">
                View all projects
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-md">
                  <span className="font-medium text-white">S</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sprints</dt>
                  <dd className="text-lg font-medium text-gray-900">2</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-600">
                View all sprints
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-md">
                  <span className="font-medium text-white">T</span>
                </div>
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">My Tasks</dt>
                  <dd className="text-lg font-medium text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <a href="#" className="font-medium text-yellow-700 hover:text-yellow-600">
                View all tasks
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900">New task assigned to you in Project Alpha</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900">Sprint Beta started</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </li>
            <li className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900">Comment added to User Story #123</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;