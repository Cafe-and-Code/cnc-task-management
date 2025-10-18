import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { Link } from 'react-router-dom';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import {
  UserStoryDetailModal,
  mockUserStoryDetail,
} from '@components/backlog/UserStoryDetailModal';
import { StoryPointEstimationModal } from '@components/backlog/StoryPointEstimationModal';
import { PriorityManagementModal } from '@components/backlog/PriorityManagementModal';
import { BulkActionsPanel } from '@components/backlog/BulkActionsPanel';
import { SprintAssignmentModal } from '@components/backlog/SprintAssignmentModal';

interface UserStory {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_sprint' | 'completed';
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels: string[];
  createdAt: string;
  updatedAt: string;
  acceptanceCriteria: string[];
}

interface BacklogState {
  stories: UserStory[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  assigneeFilter: string;
  sortBy: 'priority' | 'storyPoints' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  selectedStories: string[];
  viewMode: 'cards' | 'table';
  showStoryDetailModal: boolean;
  selectedStoryId: string | null;
  showEstimationModal: boolean;
  selectedStoryForEstimation: UserStory | null;
  showPriorityModal: boolean;
  showBulkActions: boolean;
  showSprintAssignment: boolean;
}

export const ProductBacklogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [state, setState] = useState<BacklogState>({
    stories: [],
    isLoading: true,
    error: null,
    searchQuery: '',
    priorityFilter: 'all',
    statusFilter: 'all',
    assigneeFilter: 'all',
    sortBy: 'priority',
    sortOrder: 'desc',
    selectedStories: [],
    viewMode: 'cards',
    showStoryDetailModal: false,
    selectedStoryId: null,
    showEstimationModal: false,
    selectedStoryForEstimation: null,
    showPriorityModal: false,
    showBulkActions: false,
    showSprintAssignment: false,
  });

  useEffect(() => {
    const loadStories = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Mock stories data - in real implementation, this would come from API
        const mockStories: UserStory[] = [
          {
            id: '1',
            title: 'User Authentication and Authorization',
            description:
              'As a user, I want to be able to log in to the system using my email and password, so that I can access my personalized dashboard.',
            storyPoints: 8,
            priority: 'critical',
            status: 'backlog',
            assignee: {
              id: '1',
              name: 'John Doe',
              avatarUrl: '',
            },
            epic: {
              id: 'epic-1',
              name: 'User Management',
              color: '#3b82f6',
            },
            labels: ['authentication', 'security', 'frontend'],
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z',
            acceptanceCriteria: [
              'User can log in with valid email and password',
              'System validates credentials against database',
              'Session token is generated upon successful login',
              'Failed login attempts are logged',
              'Password reset functionality is available',
            ],
          },
          {
            id: '2',
            title: 'Create and Edit Projects',
            description:
              'As a project manager, I want to create and edit projects with team assignments, so that I can organize and manage development work.',
            storyPoints: 13,
            priority: 'high',
            status: 'backlog',
            assignee: {
              id: '2',
              name: 'Jane Smith',
              avatarUrl: '',
            },
            epic: {
              id: 'epic-2',
              name: 'Project Management',
              color: '#10b981',
            },
            labels: ['project-management', 'admin', 'crud'],
            createdAt: '2024-01-16T09:00:00Z',
            updatedAt: '2024-01-22T11:15:00Z',
            acceptanceCriteria: [
              'User can create new projects with name and description',
              'Team members can be assigned to projects',
              'Project details can be edited',
              'Projects can be archived or deleted',
              'Project status can be updated',
            ],
          },
          {
            id: '3',
            title: 'Sprint Planning Interface',
            description:
              'As a scrum master, I want to plan sprints and assign stories to sprints, so that I can organize work into manageable iterations.',
            storyPoints: 21,
            priority: 'high',
            status: 'in_sprint',
            assignee: {
              id: '3',
              name: 'Mike Johnson',
              avatarUrl: '',
            },
            epic: {
              id: 'epic-3',
              name: 'Sprint Management',
              color: '#f59e0b',
            },
            labels: ['sprint', 'planning', 'agile'],
            createdAt: '2024-01-17T14:00:00Z',
            updatedAt: '2024-01-23T16:45:00Z',
            acceptanceCriteria: [
              'Scrum master can create new sprints',
              'Stories can be dragged and dropped into sprints',
              'Sprint capacity is calculated and displayed',
              'Sprint velocity is tracked',
              'Sprint goals can be defined',
            ],
          },
          {
            id: '4',
            title: 'Real-time Notifications',
            description:
              'As a team member, I want to receive real-time notifications about project updates, so that I can stay informed about important changes.',
            storyPoints: 5,
            priority: 'medium',
            status: 'backlog',
            assignee: {
              id: '4',
              name: 'Sarah Wilson',
              avatarUrl: '',
            },
            epic: {
              id: 'epic-4',
              name: 'Communication',
              color: '#8b5cf6',
            },
            labels: ['notifications', 'real-time', 'websocket'],
            createdAt: '2024-01-18T11:30:00Z',
            updatedAt: '2024-01-19T13:20:00Z',
            acceptanceCriteria: [
              'Users receive notifications for task assignments',
              'Real-time updates appear in the UI',
              'Notification history is maintained',
              'Users can configure notification preferences',
              'Email notifications are sent for important updates',
            ],
          },
          {
            id: '5',
            title: 'Task Comments and Mentions',
            description:
              'As a team member, I want to comment on tasks and mention colleagues, so that I can collaborate effectively with my team.',
            storyPoints: 3,
            priority: 'medium',
            status: 'completed',
            assignee: {
              id: '5',
              name: 'Tom Brown',
              avatarUrl: '',
            },
            epic: {
              id: 'epic-4',
              name: 'Communication',
              color: '#8b5cf6',
            },
            labels: ['comments', 'collaboration', 'mentions'],
            createdAt: '2024-01-14T08:00:00Z',
            updatedAt: '2024-01-18T10:00:00Z',
            acceptanceCriteria: [
              'Users can add comments to tasks',
              '@mentions are supported for team members',
              'Mentioned users receive notifications',
              'Comment history is maintained',
              'Comments can be edited and deleted',
            ],
          },
        ];

        setState(prev => ({ ...prev, stories: mockStories, isLoading: false }));
      } catch (error: any) {
        console.error('Failed to load user stories:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Failed to load user stories',
          isLoading: false,
        }));
      }
    };

    loadStories();
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handlePriorityFilterChange = (priority: string) => {
    setState(prev => ({ ...prev, priorityFilter: priority }));
  };

  const handleStatusFilterChange = (status: string) => {
    setState(prev => ({ ...prev, statusFilter: status }));
  };

  const handleAssigneeFilterChange = (assigneeId: string) => {
    setState(prev => ({ ...prev, assigneeFilter: assigneeId }));
  };

  const handleSortChange = (sortBy: BacklogState['sortBy']) => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleStorySelect = (storyId: string, isSelected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedStories: isSelected
        ? [...prev.selectedStories, storyId]
        : prev.selectedStories.filter(id => id !== storyId),
    }));
  };

  const handleSelectAll = () => {
    const allStoryIds = filteredStories.map(story => story.id);
    setState(prev => ({
      ...prev,
      selectedStories: prev.selectedStories.length === allStoryIds.length ? [] : allStoryIds,
    }));
  };

  const handleViewModeChange = (viewMode: BacklogState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode }));
  };

  const handleStoryDetailOpen = (storyId: string) => {
    setState(prev => ({
      ...prev,
      selectedStoryId: storyId,
      showStoryDetailModal: true,
    }));
  };

  const handleStoryDetailClose = () => {
    setState(prev => ({
      ...prev,
      showStoryDetailModal: false,
      selectedStoryId: null,
    }));
  };

  const handleEstimationOpen = (story: UserStory) => {
    setState(prev => ({
      ...prev,
      selectedStoryForEstimation: story,
      showEstimationModal: true,
    }));
  };

  const handleEstimationClose = () => {
    setState(prev => ({
      ...prev,
      showEstimationModal: false,
      selectedStoryForEstimation: null,
    }));
  };

  const handleEstimationComplete = (estimatedPoints: number) => {
    if (state.selectedStoryForEstimation) {
      // Update the story with new estimation
      setState(prev => ({
        ...prev,
        stories: prev.stories.map(story =>
          story.id === state.selectedStoryForEstimation?.id
            ? { ...story, storyPoints: estimatedPoints }
            : story
        ),
      }));
    }
  };

  const handlePriorityModalOpen = () => {
    setState(prev => ({ ...prev, showPriorityModal: true }));
  };

  const handlePriorityModalClose = () => {
    setState(prev => ({ ...prev, showPriorityModal: false }));
  };

  const handlePriorityUpdates = (updates: { storyId: string; priority: string }[]) => {
    setState(prev => ({
      ...prev,
      stories: prev.stories.map(story => {
        const update = updates.find(u => u.storyId === story.id);
        return update ? { ...story, priority: update.priority as UserStory['priority'] } : story;
      }),
    }));
  };

  const handleBulkActionsOpen = () => {
    setState(prev => ({ ...prev, showBulkActions: true }));
  };

  const handleBulkActionsClose = () => {
    setState(prev => ({ ...prev, showBulkActions: false }));
  };

  const handleBulkAction = (action: string, data: any) => {
    const selectedStoriesList = state.stories.filter(story =>
      state.selectedStories.includes(story.id)
    );

    switch (action) {
      case 'assign':
        setState(prev => ({
          ...prev,
          stories: prev.stories.map(story => {
            if (
              state.selectedStories.includes(story.id) &&
              (data.reassignCurrent || !story.assignee)
            ) {
              const assignee = {
                id: data.assigneeId,
                name: 'Team Member', // In real app, fetch from teamMembers
                avatarUrl: '',
              };
              return { ...story, assignee };
            }
            return story;
          }),
        }));
        break;

      case 'status':
        setState(prev => ({
          ...prev,
          stories: prev.stories.map(story =>
            state.selectedStories.includes(story.id)
              ? { ...story, status: data.status as UserStory['status'] }
              : story
          ),
        }));
        break;

      case 'priority':
        setState(prev => ({
          ...prev,
          stories: prev.stories.map(story =>
            state.selectedStories.includes(story.id)
              ? { ...story, priority: data.priority as UserStory['priority'] }
              : story
          ),
        }));
        break;

      case 'labels':
        setState(prev => ({
          ...prev,
          stories: prev.stories.map(story => {
            if (state.selectedStories.includes(story.id)) {
              let updatedLabels = [...story.labels];

              // Remove labels
              if (data.labelsToRemove) {
                const labelsToRemove = data.labelsToRemove.split(',').map((l: string) => l.trim());
                updatedLabels = updatedLabels.filter(label => !labelsToRemove.includes(label));
              }

              // Add labels
              if (data.labelsToAdd) {
                const labelsToAdd = data.labelsToAdd.split(',').map((l: string) => l.trim());
                labelsToAdd.forEach((label: string) => {
                  if (!updatedLabels.includes(label)) {
                    updatedLabels.push(label);
                  }
                });
              }

              return { ...story, labels: updatedLabels };
            }
            return story;
          }),
        }));
        break;

      case 'epic':
        setState(prev => ({
          ...prev,
          stories: prev.stories.map(story =>
            state.selectedStories.includes(story.id)
              ? {
                  ...story,
                  epic: data.epicId
                    ? { id: data.epicId, name: 'Epic Name', color: '#3b82f6' }
                    : undefined,
                }
              : story
          ),
        }));
        break;

      case 'delete':
        setState(prev => ({
          ...prev,
          stories: prev.stories.filter(story => !state.selectedStories.includes(story.id)),
          selectedStories: [],
        }));
        break;

      case 'archive':
        // In real implementation, move to archive
        setState(prev => ({
          ...prev,
          stories: prev.stories.filter(story => !state.selectedStories.includes(story.id)),
          selectedStories: [],
        }));
        break;

      case 'duplicate':
        const duplicatedStories = selectedStoriesList.map(story => ({
          ...story,
          id: `copy-${story.id}-${Date.now()}`,
          title: `${story.title} (Copy)`,
          assignee: data.copyAssignee ? story.assignee : undefined,
          labels: data.copyLabels ? story.labels : [],
        }));
        setState(prev => ({
          ...prev,
          stories: [...prev.stories, ...duplicatedStories],
          selectedStories: [],
        }));
        break;

      default:
        break;
    }
  };

  const handleSprintAssignmentOpen = () => {
    setState(prev => ({ ...prev, showSprintAssignment: true }));
  };

  const handleSprintAssignmentClose = () => {
    setState(prev => ({ ...prev, showSprintAssignment: false }));
  };

  const handleAssignStoriesToSprint = (sprintId: string, storyIds: string[]) => {
    // Update stories to be in the selected sprint
    setState(prev => ({
      ...prev,
      stories: prev.stories.map(story =>
        storyIds.includes(story.id) ? { ...story, status: 'in_sprint' } : story
      ),
    }));
    handleSprintAssignmentClose();
  };

  const handleCreateSprint = (sprintData: any) => {
    // In a real implementation, this would call the API to create a sprint
    console.log('Creating sprint:', sprintData);
    // For now, just log it since we don't have sprint management in the state
  };

  // Filter and sort stories
  const filteredStories = state.stories
    .filter(story => {
      // Search filter
      const matchesSearch =
        !state.searchQuery ||
        story.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        story.labels.some(label => label.toLowerCase().includes(state.searchQuery.toLowerCase()));

      // Priority filter
      const matchesPriority =
        state.priorityFilter === 'all' || story.priority === state.priorityFilter;

      // Status filter
      const matchesStatus = state.statusFilter === 'all' || story.status === state.statusFilter;

      // Assignee filter
      const matchesAssignee =
        state.assigneeFilter === 'all' ||
        (!state.assigneeFilter && !story.assignee) ||
        (story.assignee && story.assignee.id === state.assigneeFilter);

      return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (state.sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'storyPoints':
          comparison = a.storyPoints - b.storyPoints;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

  const getPriorityColor = (priority: UserStory['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: UserStory['status']) => {
    switch (status) {
      case 'backlog':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_sprint':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTotalStoryPoints = () => {
    return filteredStories.reduce((total, story) => total + story.storyPoints, 0);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Backlog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user stories and prioritize development work
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {(isManagement || isAdmin) && (
            <>
              <button
                onClick={handleSprintAssignmentOpen}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Sprint Planning
              </button>
              <Link
                to="/backlog/stories/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Story
              </Link>
            </>
          )}
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <span>{filteredStories.length} stories</span>
            <span>•</span>
            <span>{getTotalStoryPoints()} points</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={state.searchQuery}
                onChange={handleSearchChange}
                placeholder="Search stories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Priority Filter */}
            <select
              value={state.priorityFilter}
              onChange={e => handlePriorityFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={state.statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="backlog">Backlog</option>
              <option value="in_sprint">In Sprint</option>
              <option value="completed">Completed</option>
            </select>

            {/* Sort */}
            <button
              onClick={() => handleSortChange('priority')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Priority {state.sortBy === 'priority' && (state.sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <button
              onClick={() => handleSortChange('storyPoints')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Points {state.sortBy === 'storyPoints' && (state.sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            {/* View Mode */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => handleViewModeChange('cards')}
                className={`px-3 py-2 text-sm ${state.viewMode === 'cards' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleViewModeChange('table')}
                className={`px-3 py-2 text-sm ${state.viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {state.selectedStories.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={state.selectedStories.length === filteredStories.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {state.selectedStories.length} stories selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkActionsOpen}
                className="px-3 py-1 text-sm border border-blue-300 dark:border-blue-700 rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40"
              >
                Bulk Actions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
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
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-400">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stories List */}
      {filteredStories.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No user stories found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {state.searchQuery || state.priorityFilter !== 'all' || state.statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first user story'}
          </p>
          {(isManagement || isAdmin) &&
            !state.searchQuery &&
            state.priorityFilter === 'all' &&
            state.statusFilter === 'all' && (
              <div className="mt-6">
                <Link
                  to="/backlog/stories/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create User Story
                </Link>
              </div>
            )}
        </div>
      ) : (
        <div>
          {/* Cards View */}
          {state.viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStories.map(story => (
                <div
                  key={story.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 p-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={state.selectedStories.includes(story.id)}
                        onChange={e => handleStorySelect(story.id, e.target.checked)}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                      />
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                      >
                        {story.priority}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}
                    >
                      {story.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                    {story.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {story.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {story.storyPoints} pts
                      </span>
                      {story.epic && (
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: story.epic.color }}
                          ></div>
                          <span>{story.epic.name}</span>
                        </div>
                      )}
                    </div>
                    <span>{new Date(story.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Labels */}
                  {story.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.labels.map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Assignee */}
                  {story.assignee && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-medium">
                          {getUserInitials(story.assignee.name)}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {story.assignee.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {(isManagement || isAdmin) && (
                          <button
                            onClick={() => handleEstimationOpen(story)}
                            className="text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            Estimate
                          </button>
                        )}
                        <button
                          onClick={() => handleStoryDetailOpen(story.id)}
                          className="text-xs text-brand-primary hover:text-brand-primary/80"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {state.viewMode === 'table' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={state.selectedStories.length === filteredStories.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Story
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStories.map(story => (
                    <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={state.selectedStories.includes(story.id)}
                          onChange={e => handleStorySelect(story.id, e.target.checked)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {story.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {story.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                        >
                          {story.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        {story.storyPoints}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}
                        >
                          {story.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {story.assignee ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-medium">
                              {getUserInitials(story.assignee.name)}
                            </div>
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {story.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(isManagement || isAdmin) && (
                            <button
                              onClick={() => handleEstimationOpen(story)}
                              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                              Estimate
                            </button>
                          )}
                          <button
                            onClick={() => handleStoryDetailOpen(story.id)}
                            className="text-brand-primary hover:text-brand-primary/80"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Story Detail Modal */}
      <UserStoryDetailModal
        story={mockUserStoryDetail}
        isOpen={state.showStoryDetailModal}
        onClose={handleStoryDetailClose}
        onEdit={story => {
          // Navigate to edit page or open edit modal
          console.log('Edit story:', story);
          handleStoryDetailClose();
        }}
      />

      {/* Story Point Estimation Modal */}
      {state.selectedStoryForEstimation && (
        <StoryPointEstimationModal
          isOpen={state.showEstimationModal}
          onClose={handleEstimationClose}
          onEstimationComplete={handleEstimationComplete}
          story={{
            id: state.selectedStoryForEstimation.id,
            title: state.selectedStoryForEstimation.title,
            description: state.selectedStoryForEstimation.description,
            currentEstimate: state.selectedStoryForEstimation.storyPoints,
          }}
          currentUser={{
            id: user?.id || 'current-user',
            name:
              user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'Current User',
            email: user?.email || 'current@example.com',
          }}
          teamMembers={[
            {
              id: 'user-1',
              name: 'John Developer',
              email: 'john@example.com',
            },
            {
              id: 'user-2',
              name: 'Jane Product',
              email: 'jane@example.com',
            },
            {
              id: 'user-3',
              name: 'Mike Scrum',
              email: 'mike@example.com',
            },
          ]}
        />
      )}

      {/* Priority Management Modal */}
      <PriorityManagementModal
        isOpen={state.showPriorityModal}
        onClose={handlePriorityModalClose}
        stories={state.stories}
        onUpdatePriorities={handlePriorityUpdates}
      />

      {/* Bulk Actions Panel */}
      {state.selectedStories.length > 0 && (
        <BulkActionsPanel
          selectedStories={state.stories.filter(story => state.selectedStories.includes(story.id))}
          teamMembers={[
            { id: 'user-1', name: 'John Developer', email: 'john@example.com' },
            { id: 'user-2', name: 'Jane Product', email: 'jane@example.com' },
            { id: 'user-3', name: 'Mike Scrum', email: 'mike@example.com' },
            { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com' },
            { id: 'user-5', name: 'Tom Brown', email: 'tom@example.com' },
          ]}
          epics={[
            { id: 'epic-1', name: 'User Management', color: '#3b82f6' },
            { id: 'epic-2', name: 'Project Management', color: '#10b981' },
            { id: 'epic-3', name: 'Sprint Management', color: '#f59e0b' },
            { id: 'epic-4', name: 'Communication', color: '#8b5cf6' },
          ]}
          sprints={[
            { id: 'sprint-1', name: 'Sprint 1', status: 'completed', capacity: 40 },
            { id: 'sprint-2', name: 'Sprint 2', status: 'completed', capacity: 45 },
            { id: 'sprint-3', name: 'Sprint 3', status: 'active', capacity: 42 },
            { id: 'sprint-4', name: 'Sprint 4', status: 'planned', capacity: 38 },
          ]}
          isOpen={state.showBulkActions}
          onClose={handleBulkActionsClose}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Sprint Assignment Modal */}
      <SprintAssignmentModal
        isOpen={state.showSprintAssignment}
        onClose={handleSprintAssignmentClose}
        stories={state.stories}
        teamMembers={[
          {
            id: 'user-1',
            name: 'John Developer',
            email: 'john@example.com',
            capacity: 40,
            assignedPoints: 8,
          },
          {
            id: 'user-2',
            name: 'Jane Product',
            email: 'jane@example.com',
            capacity: 40,
            assignedPoints: 13,
          },
          {
            id: 'user-3',
            name: 'Mike Scrum',
            email: 'mike@example.com',
            capacity: 40,
            assignedPoints: 21,
          },
          {
            id: 'user-4',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            capacity: 40,
            assignedPoints: 5,
          },
          {
            id: 'user-5',
            name: 'Tom Brown',
            email: 'tom@example.com',
            capacity: 40,
            assignedPoints: 3,
          },
        ]}
        sprints={[
          {
            id: 'sprint-1',
            name: 'Sprint 1 - Foundation',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            capacity: 40,
            status: 'completed',
            assignedStories: state.stories
              .filter(story => story.status === 'completed')
              .slice(0, 3),
            velocity: 42,
          },
          {
            id: 'sprint-2',
            name: 'Sprint 2 - Core Features',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            capacity: 42,
            status: 'active',
            assignedStories: state.stories.filter(story => story.status === 'in_sprint'),
            velocity: 38,
          },
          {
            id: 'sprint-3',
            name: 'Sprint 3 - Enhancement',
            startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            capacity: 45,
            status: 'planning',
            assignedStories: [],
            velocity: 40,
          },
          {
            id: 'sprint-4',
            name: 'Sprint 4 - Polish',
            startDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            capacity: 40,
            status: 'planning',
            assignedStories: [],
            velocity: 45,
          },
        ]}
        onAssignStories={handleAssignStoriesToSprint}
        onCreateSprint={handleCreateSprint}
      />
    </div>
  );
};
