import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth) as any;
  const [activeTab, setActiveTab] = useState('overview');

  // In a real implementation, we would fetch user data from the backend
  useEffect(() => {
    // This would be where we fetch user data
  }, [dispatch]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'user' },
    { id: 'activity', name: 'Activity', icon: 'clock' },
    { id: 'projects', name: 'Projects', icon: 'folder' },
    { id: 'tasks', name: 'Tasks', icon: 'check-square' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your profile information and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-full">
                  <span className="text-2xl font-medium text-white">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
              <div className="mt-6 space-y-1">
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-gray-900 text-md">Personal Information</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {user?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {user?.phoneNumber || 'Not provided'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {user?.role}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-md">Account Information</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Organization:</span> {user?.organizationName || 'Not assigned'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Joined:</span> {new Date(user?.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Last Login:</span> {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <div className="py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your recent activity will appear here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  <div className="py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Projects you are involved in will appear here.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <div className="py-12 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tasks assigned to you will appear here.
                    </p>
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

export default ProfilePage;