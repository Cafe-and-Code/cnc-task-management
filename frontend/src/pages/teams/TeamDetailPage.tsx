import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchTeamById } from '@/store/slices/teamSlice';

const TeamDetailPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTeam: team, isLoading, error } = useSelector((state: RootState) => state.teams) as any;
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (teamId) {
      dispatch(fetchTeamById(teamId));
    }
  }, [dispatch, teamId]);

  if (!teamId) {
    return <div>Team not found</div>;
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

  if (!team) {
    return (
      <div className="px-4 py-3 text-yellow-700 border border-yellow-200 rounded bg-yellow-50">
        Team not found
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-500">ID: {team.id}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/teams/${team.id}/edit`}
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Edit Team
            </Link>
          </div>
        </div>
      </div>

      {/* Team Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          team.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {team.status}
        </span>
      </div>

      {/* Team Details */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">Project</p>
            <p className="text-base font-medium text-gray-900">{team.projectName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Team Lead</p>
            <p className="text-base font-medium text-gray-900">{team.teamLeadName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Members</p>
            <p className="text-base font-medium text-gray-900">{team.memberCount} members</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {['overview', 'members', 'sprints'].map((tab) => (
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Team Information</h3>
                <p className="max-w-2xl mt-1 text-sm text-gray-500">
                  Details about this team.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {team.description || 'No description provided'}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-white sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-gray-50 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(team.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
              <button className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Add Member
              </button>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                Team members will appear here once they are added.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sprints' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Sprints</h2>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 text-center text-gray-500">
                Sprints assigned to this team will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;