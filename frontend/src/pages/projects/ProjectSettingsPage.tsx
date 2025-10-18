import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { fetchProjects } from '@store/slices/projectsSlice';
import { projectService } from '@services/projectService';
import { ProjectStatus } from '@types/index';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface ProjectSettings {
  project: any | null;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  isSaving: boolean;
}

interface GeneralSettings {
  name: string;
  description: string;
  status: ProjectStatus;
  velocityGoal: number;
  sprintDuration: number;
  startDate: string;
  endDate: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  taskAssignments: boolean;
  sprintStart: boolean;
  sprintComplete: boolean;
  projectUpdates: boolean;
  teamActivity: boolean;
}

interface IntegrationSettings {
  githubIntegration: boolean;
  slackIntegration: boolean;
  jiraIntegration: boolean;
  webhookUrl: string;
  apiKey: string;
}

const tabs = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'integrations', label: 'Integrations', icon: '🔗' },
  { id: 'advanced', label: 'Advanced', icon: '🔧' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

export const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(state => state.projects);
  const { user } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [state, setState] = useState<ProjectSettings>({
    project: null,
    isLoading: true,
    error: null,
    activeTab: 'general',
    isSaving: false,
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    name: '',
    description: '',
    status: ProjectStatus.Active,
    velocityGoal: 21,
    sprintDuration: 14,
    startDate: '',
    endDate: '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    taskAssignments: true,
    sprintStart: true,
    sprintComplete: true,
    projectUpdates: false,
    teamActivity: false,
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    githubIntegration: false,
    slackIntegration: false,
    jiraIntegration: false,
    webhookUrl: '',
    apiKey: '',
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setState(prev => ({ ...prev, error: 'Project ID not provided', isLoading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        let project = projects.find(p => p.id === parseInt(projectId));

        if (!project) {
          const result = await dispatch(fetchProjects({ page: 1, pageSize: 100 })).unwrap();
          project = result.projects.find(p => p.id === parseInt(projectId));
        }

        if (!project) {
          setState(prev => ({ ...prev, error: 'Project not found', isLoading: false }));
          return;
        }

        setState(prev => ({ ...prev, project, isLoading: false }));

        // Initialize settings with project data
        setGeneralSettings({
          name: project.name || '',
          description: project.description || '',
          status: project.status || ProjectStatus.Active,
          velocityGoal: project.velocityGoal || 21,
          sprintDuration: project.sprintDuration || 14,
          startDate: project.startDate
            ? new Date(project.startDate).toISOString().split('T')[0]
            : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        });
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

  const handleGeneralSettingsChange = (
    field: keyof GeneralSettings,
    value: string | number | ProjectStatus
  ) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationSettingsChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleIntegrationSettingsChange = (
    field: keyof IntegrationSettings,
    value: string | boolean
  ) => {
    setIntegrationSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveGeneralSettings = async () => {
    if (!state.project) return;

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      const updateData = {
        name: generalSettings.name,
        description: generalSettings.description,
        status: generalSettings.status,
        velocityGoal: generalSettings.velocityGoal,
        sprintDuration: generalSettings.sprintDuration,
        startDate: generalSettings.startDate || null,
        endDate: generalSettings.endDate || null,
      };

      await projectService.updateProject(state.project.id, updateData);

      // Refresh project data
      const result = await dispatch(fetchProjects({ page: 1, pageSize: 100 })).unwrap();
      const updatedProject = result.projects.find(p => p.id === state.project.id);

      setState(prev => ({ ...prev, project: updatedProject, isSaving: false }));
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to save settings',
        isSaving: false,
      }));
    }
  };

  const handleArchiveProject = async () => {
    if (!state.project) return;

    try {
      await projectService.archiveProject(state.project.id);
      navigate('/projects');
    } catch (error: any) {
      console.error('Failed to archive project:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to archive project' }));
    }
  };

  const handleDeleteProject = async () => {
    if (!state.project || deleteConfirmation !== state.project.name) return;

    try {
      await projectService.deleteProject(state.project.id);
      navigate('/projects');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to delete project' }));
    }
  };

  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'general':
        return <GeneralSettingsTab />;
      case 'notifications':
        return <NotificationSettingsTab />;
      case 'integrations':
        return <IntegrationSettingsTab />;
      case 'advanced':
        return <AdvancedSettingsTab />;
      case 'danger':
        return <DangerZoneTab />;
      default:
        return <GeneralSettingsTab />;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/projects/${projectId}`}
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
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage settings and configuration for {state.project.name}
            </p>
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

  // Tab Components
  function GeneralSettingsTab() {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            General Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={generalSettings.name}
                onChange={e => handleGeneralSettingsChange('name', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={generalSettings.description}
                onChange={e => handleGeneralSettingsChange('description', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={generalSettings.status}
                onChange={e => handleGeneralSettingsChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={ProjectStatus.Active}>Active</option>
                <option value={ProjectStatus.OnHold}>On Hold</option>
                <option value={ProjectStatus.Completed}>Completed</option>
                <option value={ProjectStatus.Archived}>Archived</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Velocity Goal (points/sprint)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generalSettings.velocityGoal}
                  onChange={e =>
                    handleGeneralSettingsChange('velocityGoal', parseInt(e.target.value))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sprint Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={generalSettings.sprintDuration}
                  onChange={e =>
                    handleGeneralSettingsChange('sprintDuration', parseInt(e.target.value))
                  }
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={generalSettings.startDate}
                  onChange={e => handleGeneralSettingsChange('startDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={generalSettings.endDate}
                  onChange={e => handleGeneralSettingsChange('endDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={saveGeneralSettings}
              disabled={state.isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
            >
              {state.isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function NotificationSettingsTab() {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notification Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email notifications for project updates
                </p>
              </div>
              <button
                onClick={() =>
                  handleNotificationSettingsChange(
                    'emailNotifications',
                    !notificationSettings.emailNotifications
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.emailNotifications
                    ? 'bg-brand-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Task Assignments
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when tasks are assigned to you
                </p>
              </div>
              <button
                onClick={() =>
                  handleNotificationSettingsChange(
                    'taskAssignments',
                    !notificationSettings.taskAssignments
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.taskAssignments
                    ? 'bg-brand-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.taskAssignments ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Sprint Start/Complete
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notifications for sprint lifecycle events
                </p>
              </div>
              <button
                onClick={() =>
                  handleNotificationSettingsChange('sprintStart', !notificationSettings.sprintStart)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.sprintStart
                    ? 'bg-brand-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.sprintStart ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Project Updates
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  General project updates and announcements
                </p>
              </div>
              <button
                onClick={() =>
                  handleNotificationSettingsChange(
                    'projectUpdates',
                    !notificationSettings.projectUpdates
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.projectUpdates
                    ? 'bg-brand-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.projectUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Team Activity</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Updates on team member activities
                </p>
              </div>
              <button
                onClick={() =>
                  handleNotificationSettingsChange(
                    'teamActivity',
                    !notificationSettings.teamActivity
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.teamActivity
                    ? 'bg-brand-primary'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.teamActivity ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  function IntegrationSettingsTab() {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Integration Settings
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                External Integrations
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">GH</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">GitHub</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Connect your GitHub repository
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleIntegrationSettingsChange(
                        'githubIntegration',
                        !integrationSettings.githubIntegration
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      integrationSettings.githubIntegration
                        ? 'bg-brand-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        integrationSettings.githubIntegration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">Slack</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send notifications to Slack
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleIntegrationSettingsChange(
                        'slackIntegration',
                        !integrationSettings.slackIntegration
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      integrationSettings.slackIntegration
                        ? 'bg-brand-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        integrationSettings.slackIntegration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">J</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">Jira</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sync with Jira projects
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleIntegrationSettingsChange(
                        'jiraIntegration',
                        !integrationSettings.jiraIntegration
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      integrationSettings.jiraIntegration
                        ? 'bg-brand-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        integrationSettings.jiraIntegration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Webhook Configuration
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={integrationSettings.webhookUrl}
                    onChange={e => handleIntegrationSettingsChange('webhookUrl', e.target.value)}
                    placeholder="https://your-webhook-url.com"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={integrationSettings.apiKey}
                    onChange={e => handleIntegrationSettingsChange('apiKey', e.target.value)}
                    placeholder="Enter your API key"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
              Save Integration Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  function AdvancedSettingsTab() {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Advanced Settings
          </h3>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Advanced Configuration
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  These settings are intended for advanced users. Modify with caution.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Project Configuration
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Auto-assign tasks
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically assign tasks to team members based on workload
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Time tracking
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable time tracking for all tasks
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-primary">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      Public access
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow public read-only access to this project
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Data Management
              </h4>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Export Project Data
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Download all project data as JSON
                      </p>
                    </div>
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                </button>

                <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Generate Report
                      </h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create comprehensive project report
                      </p>
                    </div>
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9-4V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DangerZoneTab() {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Danger Zone</h3>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-red-800 dark:text-red-400 mb-2">
                  Archive Project
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Archiving this project will make it read-only. You can restore it later if needed.
                </p>
                <button
                  onClick={handleArchiveProject}
                  className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Archive Project
                </button>
              </div>

              <div className="border-t border-red-200 dark:border-red-800 pt-6">
                <h4 className="text-md font-medium text-red-800 dark:text-red-400 mb-2">
                  Delete Project
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Once you delete a project, there is no going back. Please be certain.
                </p>

                {!showDeleteModal ? (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Project
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                        Type{' '}
                        <span className="font-mono bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                          {state.project.name}
                        </span>{' '}
                        to confirm deletion
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={e => setDeleteConfirmation(e.target.value)}
                        className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-red-900/20 text-red-900 dark:text-red-100"
                        placeholder={state.project.name}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeleteConfirmation('');
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        disabled={deleteConfirmation !== state.project.name}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
