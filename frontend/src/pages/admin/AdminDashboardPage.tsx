import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

const AdminDashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth) as any;
  const [activeTab, setActiveTab] = useState('overview');

  // In a real implementation, we would fetch admin data from the backend
  useEffect(() => {
    // This would be where we fetch admin data
  }, [dispatch]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'dashboard' },
    { id: 'organizations', name: 'Organizations', icon: 'building' },
    { id: 'users', name: 'Users', icon: 'users' },
    { id: 'audit', name: 'Audit Logs', icon: 'document-text' },
  ];

  // Mock data for the dashboard
  const stats = {
    totalOrganizations: 12,
    totalUsers: 156,
    totalProjects: 48,
    totalSprints: 132,
    activeUsers: 89,
    newUsersThisMonth: 23,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage organizations, users, and monitor system activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Admin Menu</h3>
              <div className="mt-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>
            </div>
            
            <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
              {activeTab === 'overview' && (
                <div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Organizations</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.totalOrganizations}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.totalProjects}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Total Sprints</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.totalSprints}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.activeUsers}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">New Users This Month</dt>
                              <dd className="text-lg font-medium text-gray-900">{stats.newUsersThisMonth}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <div className="mt-4">
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">New user registered: John Doe (john@example.com)</p>
                              <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                          </li>
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">New organization created: Tech Solutions Inc.</p>
                              <p className="text-xs text-gray-500">5 hours ago</p>
                            </div>
                          </li>
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">System backup completed successfully</p>
                              <p className="text-xs text-gray-500">1 day ago</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'organizations' && (
                <div>
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Organizations</h3>
                    <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      Create Organization
                    </button>
                  </div>
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Users
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Tech Solutions Inc.
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            12
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Jan 15, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Digital Agency LLC
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            8
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Feb 20, 2023
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Users</h3>
                    <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      Create User
                    </button>
                  </div>
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Organization
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Role
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            John Doe
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            john@example.com
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Tech Solutions Inc.
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Admin
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Jane Smith
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            jane@example.com
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Digital Agency LLC
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            User
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Audit Logs</h3>
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Timestamp
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Action
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Resource
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            2023-03-15 10:30:45
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            John Doe
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Created
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            User: jsmith@example.com
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            2023-03-15 09:15:22
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Jane Smith
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Updated
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            Project: Mobile App Redesign
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;