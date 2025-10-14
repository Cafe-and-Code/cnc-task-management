import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchSprintById } from '@/store/slices/sprintSlice';

const SprintDetailPage = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentSprint: sprint, isLoading, error } = useSelector((state: RootState) => state.sprints) as any;
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (sprintId) {
      dispatch(fetchSprintById(sprintId));
    }
  }, [dispatch, sprintId]);

  if (!sprintId) {
    return <div>Sprint not found</div>;
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

  if (!sprint) {
    return (
      <div className="px-4 py-3 text-yellow-700 border border-yellow-200 rounded bg-yellow-50">
        Sprint not found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{sprint.name}</h1>
            <p className="text-sm text-gray-500">ID: {sprint.id}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/sprints/${sprint.id}/edit`}
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit Sprint
            </Link>
          </div>
        </div>
      </div>

      {/* Sprint Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          sprint.status === 'Active' ? 'bg-green-100 text-green-800' :
          sprint.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
          sprint.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {sprint.status}
        </span>
      </div>

      {/* Sprint Dates */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(sprint.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="text-base font-medium text-gray-900">
              {new Date(sprint.endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="text-base font-medium text-gray-900">
              {sprint.capacity} story points
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {['overview', 'backlog', 'board', 'burndown'].map((tab) => (
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Sprint Information</h3>
                <p className="max-w-2xl mt-1 text-sm text-gray-500">
                  Details about this sprint.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Goal</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {sprint.goal || 'No goal set'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Project</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {sprint.projectName}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(sprint.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(sprint.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backlog' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Sprint Backlog</h2>
              <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Add User Story
              </button>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                User stories assigned to this sprint will appear here.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Sprint Board</h2>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                Kanban board for this sprint will appear here.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'burndown' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Burndown Chart</h2>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                Burndown chart for this sprint will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintDetailPage;