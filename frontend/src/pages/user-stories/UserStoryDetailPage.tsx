import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUserStoryById } from '@/store/slices/userStorySlice';

const UserStoryDetailPage = () => {
  const { userStoryId } = useParams<{ userStoryId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUserStory: userStory, isLoading, error } = useSelector((state: RootState) => state.userStories) as any;
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userStoryId) {
      dispatch(fetchUserStoryById(userStoryId));
    }
  }, [dispatch, userStoryId]);

  if (!userStoryId) {
    return <div>User story not found</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 text-red-700 border border-red-200 rounded bg-red-50">
        {error}
      </div>
    );
  }

  if (!userStory) {
    return (
      <div className="px-4 py-3 text-yellow-700 border border-yellow-200 rounded bg-yellow-50">
        User story not found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{userStory.title}</h1>
            <p className="text-sm text-gray-500">ID: {userStory.id}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/user-stories/${userStory.id}/edit`}
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit User Story
            </Link>
          </div>
        </div>
      </div>

      {/* User Story Status and Priority Badges */}
      <div className="flex items-center mb-6 space-x-3">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          userStory.status === 'Backlog' ? 'bg-gray-100 text-gray-800' :
          userStory.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
          userStory.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
          userStory.status === 'Testing' ? 'bg-purple-100 text-purple-800' :
          'bg-green-100 text-green-800'
        }`}>
          {userStory.status}
        </span>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          userStory.priority === 'Critical' ? 'bg-red-100 text-red-800' :
          userStory.priority === 'High' ? 'bg-orange-100 text-orange-800' :
          userStory.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {userStory.priority} Priority
        </span>
        <span className="inline-flex px-3 py-1 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full">
          {userStory.storyPoints} Story Points
        </span>
      </div>

      {/* User Story Details */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Project</p>
            <p className="text-base font-medium text-gray-900">{userStory.projectName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reporter</p>
            <p className="text-base font-medium text-gray-900">{userStory.reporterName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assignee</p>
            <p className="text-base font-medium text-gray-900">{userStory.assigneeName || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {['overview', 'tasks', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">User Story Information</h3>
                <p className="max-w-2xl mt-1 text-sm text-gray-500">
                  Details about this user story.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userStory.description || 'No description provided'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Acceptance Criteria</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="list-disc list-inside">
                        {userStory.acceptanceCriteria && userStory.acceptanceCriteria.length > 0 ? (
                          userStory.acceptanceCriteria.map((criteria: string, index: number) => (
                            <li key={index}>{criteria}</li>
                          ))
                        ) : (
                          <li>No acceptance criteria defined</li>
                        )}
                      </ul>
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(userStory.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(userStory.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
              <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Create Task
              </button>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                Tasks for this user story will appear here.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Activity</h2>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                Activity history for this user story will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStoryDetailPage;