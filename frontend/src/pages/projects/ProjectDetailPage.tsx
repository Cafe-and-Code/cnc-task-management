import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { fetchProjects } from '@store/slices/projectsSlice';
import { ProjectStatus } from '@types/index';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface ProjectDetailState {
  project: any | null;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'backlog', label: 'Backlog', icon: '📋' },
  { id: 'sprints', label: 'Sprints', icon: '🏃' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'activity', label: 'Activity', icon: '📝' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(state => state.projects);
  const { user } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [state, setState] = useState<ProjectDetailState>({
    project: null,
    isLoading: true,
    error: null,
    activeTab: 'overview',
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setState(prev => ({ ...prev, error: 'Project ID not provided', isLoading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if project is already in Redux store
        let project = projects.find(p => p.id === parseInt(projectId));

        if (!project) {
          // If not in store, fetch all projects (in a real app, we'd have a specific endpoint)
          const result = await dispatch(fetchProjects({ page: 1, pageSize: 100 })).unwrap();
          project = result.projects.find(p => p.id === parseInt(projectId));
        }

        if (!project) {
          setState(prev => ({ ...prev, error: 'Project not found', isLoading: false }));
          return;
        }

        setState(prev => ({ ...prev, project, isLoading: false }));
      } catch (error: any) {
        console.error('Failed to load project:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Failed to load project',
          isLoading: false,
        }));
      }
    };

    loadProject();
  }, [projectId, dispatch, projects]);

  const handleTabChange = (tabId: string) => {
    setState(prev => ({ ...prev, activeTab: tabId }));
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case ProjectStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case ProjectStatus.Completed:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case ProjectStatus.Archived:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateProjectProgress = () => {
    // Mock progress calculation - in real implementation, this would come from API
    return Math.floor(Math.random() * 100);
  };

  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'overview':
        return <OverviewTab project={state.project} />;
      case 'backlog':
        return <BacklogTab project={state.project} />;
      case 'sprints':
        return <SprintsTab project={state.project} />;
      case 'team':
        return <TeamTab project={state.project} />;
      case 'activity':
        return <ActivityTab project={state.project} />;
      case 'settings':
        return <SettingsTab project={state.project} />;
      default:
        return <OverviewTab project={state.project} />;
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (state.error || !state.project) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {state.error || 'Project not found'}
        </p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.project.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {state.project.description || 'No description provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.project.status)}`}
            >
              {state.project.status}
            </span>
            {(isManagement || isAdmin) && (
              <Link
                to={`/projects/${state.project.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Link>
            )}
          </div>
        </div>

        {/* Project Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {calculateProjectProgress()}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-brand-primary h-2 rounded-full"
                style={{ width: `${calculateProjectProgress()}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Teams</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.project.teamCount || 0}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Sprints</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.project.activeSprintCount || 0}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Velocity Goal</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {state.project.velocityGoal}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">points/sprint</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  state.activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Project Information
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Start Date</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(project.startDate || '').toLocaleDateString() || 'Not set'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">End Date</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(project.endDate || '').toLocaleDateString() || 'Not set'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Sprint Duration</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {project.sprintDuration} days
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Created</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(project.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key People</h3>
          <div className="space-y-3">
            {project.productOwner && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium">
                  {project.productOwner.firstName.charAt(0)}
                  {project.productOwner.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.productOwner.firstName} {project.productOwner.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Product Owner</p>
                </div>
              </div>
            )}
            {project.scrumMaster && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {project.scrumMaster.firstName.charAt(0)}
                  {project.scrumMaster.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.scrumMaster.firstName} {project.scrumMaster.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Scrum Master</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                U
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">User Name</span> updated task status
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {i} hour{i > 1 ? 's' : ''} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BacklogTab: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Backlog</h3>
        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90">
          Add Story
        </button>
      </div>
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No user stories in backlog yet
      </div>
    </div>
  );
};

const SprintsTab: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sprints</h3>
        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90">
          Create Sprint
        </button>
      </div>
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No sprints created yet
      </div>
    </div>
  );
};

const TeamTab: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
        <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90">
          Add Member
        </button>
      </div>
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No team members assigned yet
      </div>
    </div>
  );
};

const ActivityTab: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity Timeline</h3>
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity</div>
    </div>
  );
};

const SettingsTab: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Settings</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">General Settings</h4>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Project settings and configuration options will be available here.
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Advanced Options</h4>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Advanced project configuration and management options.
          </div>
        </div>
      </div>
    </div>
  );
};
