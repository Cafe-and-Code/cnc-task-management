import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

const SecurityPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth) as any;
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API Key', createdAt: '2023-01-15', lastUsed: '2023-03-10', permissions: ['read', 'write'] },
    { id: 2, name: 'Testing API Key', createdAt: '2023-02-20', lastUsed: '2023-03-14', permissions: ['read'] },
  ]);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, timestamp: '2023-03-15T10:30:45Z', user: 'John Doe', action: 'Login', resource: 'System', ipAddress: '192.168.1.1', success: true },
    { id: 2, timestamp: '2023-03-15T09:15:22Z', user: 'Jane Smith', action: 'Failed Login', resource: 'System', ipAddress: '192.168.1.2', success: false },
    { id: 3, timestamp: '2023-03-14T15:20:30Z', user: 'John Doe', action: 'API Key Created', resource: 'API Keys', ipAddress: '192.168.1.1', success: true },
  ]);

  // In a real implementation, we would fetch security data from the backend
  useEffect(() => {
    // This would be where we fetch security data
  }, [dispatch]);

  const handleCreateApiKey = () => {
    // In a real implementation, this would create a new API key
    console.log('Create API Key');
  };

  const handleRevokeApiKey = (keyId: number) => {
    // In a real implementation, this would revoke an API key
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'shield' },
    { id: 'api-keys', name: 'API Keys', icon: 'key' },
    { id: 'audit-logs', name: 'Audit Logs', icon: 'document-text' },
    { id: 'permissions', name: 'Permissions', icon: 'lock-closed' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Security</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage API keys, view audit logs, and configure security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Security Menu</h3>
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
                  {/* Security Stats */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Active API Keys</dt>
                              <dd className="text-lg font-medium text-gray-900">{apiKeys.length}</dd>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Failed Logins (Last 7 Days)</dt>
                              <dd className="text-lg font-medium text-gray-900">3</dd>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 w-0 ml-5">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Security Alerts</dt>
                              <dd className="text-lg font-medium text-gray-900">1</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Security Events */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
                    <div className="mt-4">
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">API key revoked by John Doe</p>
                              <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                          </li>
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">Multiple failed login attempts from IP: 192.168.1.100</p>
                              <p className="text-xs text-gray-500">5 hours ago</p>
                            </div>
                          </li>
                          <li className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">New API key created by Jane Smith</p>
                              <p className="text-xs text-gray-500">1 day ago</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api-keys' && (
                <div>
                  <div className="flex justify-between mb-4">
                    <h3 className="font-medium text-gray-900 text-md">API Keys</h3>
                    <button
                      onClick={handleCreateApiKey}
                      className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Create API Key
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
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Last Used
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Permissions
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {apiKeys.map((key) => (
                          <tr key={key.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {key.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(key.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(key.lastUsed).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {key.permissions.join(', ')}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                              <button
                                onClick={() => handleRevokeApiKey(key.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'audit-logs' && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-md">Audit Logs</h3>
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
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            IP Address
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {log.user}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {log.action}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {log.resource}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {log.ipAddress}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                log.success 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {log.success ? 'Success' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-md">Role-Based Permissions</h3>
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Users
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Super Admin
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Full access to all system resources
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            2
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Admin
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Manage users, projects, and sprints
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            5
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Developer
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Access to project tasks, sprints, and code
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            23
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            Viewer
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            Read-only access to projects and tasks
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            12
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </button>
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

export default SecurityPage;