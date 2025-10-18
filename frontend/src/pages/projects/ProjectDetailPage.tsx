import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { fetchProjects } from '@store/slices/projectsSlice';
import {
  ProjectStatus,
  UserStory,
  UserStoryPriority,
  UserStoryStatus,
  Sprint,
  SprintStatus,
  TeamMember,
  TeamRole,
  User
} from '@types/index';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { userStoryService, sprintService, teamService } from '@services/index';

interface ProjectDetailState {
  project: any | null;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  stories: UserStory[];
  sprints: Sprint[];
  teamMembers: TeamMember[];
  availableUsers: User[];
  showAddStoryModal: boolean;
  showCreateSprintModal: boolean;
  showAddMemberModal: boolean;
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
    stories: [],
    sprints: [],
    teamMembers: [],
    availableUsers: [],
    showAddStoryModal: false,
    showCreateSprintModal: false,
    showAddMemberModal: false,
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

        // Load additional project data
        await loadProjectData();
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
    if (!state.project) return 0;

    const project = state.project;

    // If project is completed, return 100%
    if (project.status === ProjectStatus.Completed) {
      return 100;
    }

    // If project is archived, return 100%
    if (project.status === ProjectStatus.Archived) {
      return 100;
    }

    // If project is on hold, return current progress without calculation
    if (project.status === ProjectStatus.OnHold) {
      return calculateTimeBasedProgress(project);
    }

    // For active projects, calculate progress based on timeline
    if (project.status === ProjectStatus.Active) {
      return calculateTimeBasedProgress(project);
    }

    // Default fallback
    return 0;
  };

  const calculateTimeBasedProgress = (project: any) => {
    if (!project.startDate) {
      return 0; // No start date, no progress
    }

    const start = new Date(project.startDate);
    const now = new Date();
    const end = project.endDate ? new Date(project.endDate) : now;

    // If project hasn't started yet
    if (now < start) {
      return 0;
    }

    // Calculate total duration and elapsed time
    const totalDuration = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();

    // Calculate progress percentage
    let progress = Math.round((elapsedTime / totalDuration) * 100);

    // Cap progress at 95% for active projects (shows they're not quite done)
    if (project.status === ProjectStatus.Active && progress > 95) {
      progress = 95;
    }

    // Ensure progress doesn't exceed 100%
    return Math.min(Math.max(progress, 0), 100);
  };

  // Load project data
  const loadProjectData = async () => {
    if (!state.project) return;

    try {
      // Load stories
      const storiesResponse = await userStoryService.getProjectBacklog(state.project.id);
      setState(prev => ({ ...prev, stories: storiesResponse.items || [] }));

      // Load sprints
      const sprintsResponse = await sprintService.getProjectSprints(state.project.id);
      setState(prev => ({ ...prev, sprints: sprintsResponse.items || [] }));

      // Load team members
      const teamMembersResponse = await teamService.getProjectMembers(state.project.id);
      setState(prev => ({ ...prev, teamMembers: teamMembersResponse }));

      // Load available users for adding to team
      const availableUsersResponse = await teamService.getAvailableUsers(state.project.id);
      setState(prev => ({ ...prev, availableUsers: availableUsersResponse }));
    } catch (error: any) {
      console.error('Failed to load project data:', error);
    }
  };

  // Add story functions
  const handleAddStory = () => {
    setState(prev => ({ ...prev, showAddStoryModal: true }));
  };

  const handleCloseAddStoryModal = () => {
    setState(prev => ({ ...prev, showAddStoryModal: false }));
  };

  const handleCreateStory = async (storyData: any) => {
    if (!state.project) return;

    try {
      const newStory = await userStoryService.createUserStory({
        ...storyData,
        projectId: state.project.id,
      });
      setState(prev => ({
        ...prev,
        stories: [...prev.stories, newStory],
        showAddStoryModal: false,
      }));
    } catch (error: any) {
      console.error('Failed to create story:', error);
      alert('Failed to create story. Please try again.');
    }
  };

  // Sprint functions
  const handleCreateSprint = () => {
    setState(prev => ({ ...prev, showCreateSprintModal: true }));
  };

  const handleCloseCreateSprintModal = () => {
    setState(prev => ({ ...prev, showCreateSprintModal: false }));
  };

  const handleCreateSprintSubmit = async (sprintData: any) => {
    if (!state.project) return;

    try {
      const newSprint = await sprintService.createSprint({
        ...sprintData,
        projectId: state.project.id,
      });
      setState(prev => ({
        ...prev,
        sprints: [...prev.sprints, newSprint],
        showCreateSprintModal: false,
      }));
    } catch (error: any) {
      console.error('Failed to create sprint:', error);
      alert('Failed to create sprint. Please try again.');
    }
  };

  // Team member functions
  const handleAddMember = () => {
    setState(prev => ({ ...prev, showAddMemberModal: true }));
  };

  const handleCloseAddMemberModal = () => {
    setState(prev => ({ ...prev, showAddMemberModal: false }));
  };

  const handleAddMemberSubmit = async (memberData: { userId: number; role: TeamRole }) => {
    if (!state.project) return;

    try {
      const newMember = await teamService.addProjectMember(
        state.project.id,
        memberData.userId,
        memberData.role
      );

      // Update available users and team members
      const updatedAvailableUsers = state.availableUsers.filter(u => u.id !== memberData.userId);
      const userToAdd = state.availableUsers.find(u => u.id === memberData.userId);

      if (userToAdd) {
        const newTeamMember: TeamMember = {
          id: newMember.id,
          teamId: 0, // Project-level member
          userId: memberData.userId,
          user: userToAdd,
          role: memberData.role,
          joinedAt: new Date().toISOString(),
          isActive: true,
        };

        setState(prev => ({
          ...prev,
          teamMembers: [...prev.teamMembers, newTeamMember],
          availableUsers: updatedAvailableUsers,
          showAddMemberModal: false,
        }));
      }
    } catch (error: any) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. Please try again.');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!state.project) return;

    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      await teamService.removeProjectMember(state.project.id, userId);

      // Move user back to available users
      const removedMember = state.teamMembers.find(m => m.userId === userId);
      setState(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.filter(m => m.userId !== userId),
        availableUsers: removedMember ? [...prev.availableUsers, removedMember.user] : prev.availableUsers,
      }));
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'overview':
        return <OverviewTab project={state.project} />;
      case 'backlog':
        return (
          <BacklogTab
            project={state.project}
            stories={state.stories}
            onAddStory={handleAddStory}
          />
        );
      case 'sprints':
        return (
          <SprintsTab
            project={state.project}
            sprints={state.sprints}
            onCreateSprint={handleCreateSprint}
          />
        );
      case 'team':
        return (
          <TeamTab
            project={state.project}
            teamMembers={state.teamMembers}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        );
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

      {/* Add Story Modal */}
      {state.showAddStoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add User Story</h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateStory({
                title: formData.get('title'),
                description: formData.get('description'),
                acceptanceCriteria: formData.get('acceptanceCriteria'),
                storyPoints: parseInt(formData.get('storyPoints') as string),
                priority: parseInt(formData.get('priority') as string),
                businessValue: parseInt(formData.get('businessValue') as string),
                estimatedHours: formData.get('estimatedHours') ? parseInt(formData.get('estimatedHours') as string) : undefined,
              });
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Acceptance Criteria
                  </label>
                  <textarea
                    name="acceptanceCriteria"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Story Points *
                    </label>
                    <input
                      name="storyPoints"
                      type="number"
                      min="1"
                      max="21"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority *
                    </label>
                    <select
                      name="priority"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="0">Low</option>
                      <option value="5">Medium</option>
                      <option value="8">High</option>
                      <option value="10">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Value *
                    </label>
                    <input
                      name="businessValue"
                      type="number"
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    name="estimatedHours"
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseAddStoryModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90"
                >
                  Add Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sprint Modal */}
      {state.showCreateSprintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Sprint</h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateSprintSubmit({
                name: formData.get('name'),
                goal: formData.get('goal'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                capacity: parseInt(formData.get('capacity') as string),
              });
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sprint Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal
                  </label>
                  <textarea
                    name="goal"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      name="endDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacity (story points) *
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseCreateSprintModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90"
                >
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {state.showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Team Member</h3>
            </div>
            {state.availableUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No available users to add to this project.
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddMemberSubmit({
                  userId: parseInt(formData.get('userId') as string),
                  role: formData.get('role') as TeamRole,
                });
              }}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select User *
                    </label>
                    <select
                      name="userId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Choose a user...</option>
                      {state.availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role *
                    </label>
                    <select
                      name="role"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select a role...</option>
                      <option value="Developer">Developer</option>
                      <option value="Tester">Tester</option>
                      <option value="Designer">Designer</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseAddMemberModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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

const BacklogTab: React.FC<{ project: any; stories: UserStory[]; onAddStory: () => void }> = ({
  project,
  stories,
  onAddStory
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Backlog</h3>
        <button
          onClick={onAddStory}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90"
        >
          Add Story
        </button>
      </div>
      {stories.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No user stories in backlog yet
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {story.title}
                  </h4>
                  {story.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {story.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Points: {story.storyPoints}</span>
                    <span>Priority: {story.priority}</span>
                    <span>Status: {story.status}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    story.status === UserStoryStatus.Done
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : story.status === UserStoryStatus.InProgress
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {story.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SprintsTab: React.FC<{ project: any; sprints: Sprint[]; onCreateSprint: () => void }> = ({
  project,
  sprints,
  onCreateSprint
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sprints</h3>
        <button
          onClick={onCreateSprint}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90"
        >
          Create Sprint
        </button>
      </div>
      {sprints.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No sprints created yet
        </div>
      ) : (
        <div className="space-y-3">
          {sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {sprint.name}
                  </h4>
                  {sprint.goal && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {sprint.goal}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Capacity: {sprint.capacity}</span>
                    <span>Stories: {sprint.storyCount || 0}</span>
                    <span>Tasks: {sprint.taskCount || 0}</span>
                    {sprint.startDate && (
                      <span>
                        {new Date(sprint.startDate).toLocaleDateString()} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sprint.status === SprintStatus.Active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : sprint.status === SprintStatus.Completed
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : sprint.status === SprintStatus.Planning
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeamTab: React.FC<{
  project: any;
  teamMembers: TeamMember[];
  onAddMember: () => void;
  onRemoveMember: (userId: number) => void;
}> = ({
  project,
  teamMembers,
  onAddMember,
  onRemoveMember
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
        <button
          onClick={onAddMember}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90"
        >
          Add Member
        </button>
      </div>
      {teamMembers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No team members assigned yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-medium">
                  {member.user.firstName.charAt(0)}
                  {member.user.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.user.firstName} {member.user.lastName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {member.user.email}
                  </p>
                </div>
                {true && (
                  <button
                    onClick={() => onRemoveMember(member.userId)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove member"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.role === TeamRole.ProductOwner
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    : member.role === TeamRole.ScrumMaster
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : member.role === TeamRole.Developer
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {member.role}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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

export default ProjectDetailPage;
