import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

const GitHubIntegrationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth) as any;
  const [activeTab, setActiveTab] = useState('repositories');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState([
    { id: 1, name: 'project-frontend', owner: 'user-org', private: false, lastSync: '2023-03-15T10:30:45Z' },
    { id: 2, name: 'project-backend', owner: 'user-org', private: false, lastSync: '2023-03-15T10:30:45Z' },
    { id: 3, name: 'project-docs', owner: 'user-org', private: true, lastSync: '2023-03-14T15:20:30Z' },
  ]);

  // In a real implementation, we would fetch GitHub integration data from the backend
  useEffect(() => {
    // This would be where we fetch GitHub integration data
    setIsConnected(false); // Simulate not connected yet
  }, [dispatch]);

  const handleConnect = () => {
    setIsConnecting(true);
    // In a real implementation, this would initiate the OAuth flow with GitHub
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleDisconnect = () => {
    // In a real implementation, this would disconnect from GitHub
    setIsConnected(false);
  };

  const handleSyncRepo = (repoId: number) => {
    // In a real implementation, this would sync a specific repository
    console.log(`Syncing repository ${repoId}`);
  };

  const tabs = [
    { id: 'repositories', name: 'Repositories', icon: 'repo' },
    { id: 'webhooks', name: 'Webhooks', icon: 'webhook' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">GitHub Integration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your GitHub account to sync repositories and enable automated workflows.
        </p>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Connection Status</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isConnected 
                  ? 'Your GitHub account is connected and ready to sync repositories.'
                  : 'Connect your GitHub account to enable repository synchronization.'}
              </p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mr-3 ${
                isConnected 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400"
                >
                  {isConnecting ? 'Connecting...' : 'Connect GitHub'}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">GitHub Menu</h3>
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
                {activeTab === 'repositories' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium text-gray-900 text-md">Connected Repositories</h3>
                      <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Add Repository
                      </button>
                    </div>
                    <div className="overflow-hidden bg-white shadow sm:rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Repository
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Owner
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Visibility
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              Last Sync
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {repositories.map((repo) => (
                            <tr key={repo.id}>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {repo.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {repo.owner}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                  repo.private 
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {repo.private ? 'Private' : 'Public'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {new Date(repo.lastSync).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <button 
                                  onClick={() => handleSyncRepo(repo.id)}
                                  className="mr-3 text-indigo-600 hover:text-indigo-900"
                                >
                                  Sync
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'webhooks' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h3 className="font-medium text-gray-900 text-md">Webhooks</h3>
                      <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Create Webhook
                      </button>
                    </div>
                    <div className="py-12 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No webhooks configured</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Webhooks allow GitHub to notify your application when events occur.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h3 className="mb-4 font-medium text-gray-900 text-md">Integration Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="sync-frequency" className="block mb-1 text-sm font-medium text-gray-700">
                          Sync Frequency
                        </label>
                        <select
                          id="sync-frequency"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="realtime">Real-time</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="default-branch" className="block mb-1 text-sm font-medium text-gray-700">
                          Default Branch
                        </label>
                        <select
                          id="default-branch"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="main">main</option>
                          <option value="master">master</option>
                          <option value="develop">develop</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="auto-create-branches"
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          defaultChecked
                        />
                        <label htmlFor="auto-create-branches" className="ml-3 text-sm text-gray-700">
                          Automatically create branches for new sprints
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sync-commits"
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          defaultChecked
                        />
                        <label htmlFor="sync-commits" className="ml-3 text-sm text-gray-700">
                          Sync commit messages to task comments
                        </label>
                      </div>
                      <div className="pt-4">
                        <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubIntegrationPage;