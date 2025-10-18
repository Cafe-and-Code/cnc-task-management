import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Minus,
  Clock,
  Target,
  Play,
  Save,
  X,
} from 'lucide-react';

// Types
interface UserStory {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_sprint' | 'completed' | 'in_progress' | 'testing' | 'blocked';
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels: string[];
  dependencies?: string[];
  estimatedHours?: number;
  businessValue?: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  capacity: number; // hours per sprint
  assignedPoints: number;
  skills: string[];
}

interface Sprint {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  assignedStories: UserStory[];
  goal?: string;
  team: {
    id: string;
    name: string;
    members: TeamMember[];
  };
}

export const SprintPlanningPage: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [backlogStories, setBacklogStories] = useState<UserStory[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'stories' | 'capacity' | 'team'>('stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'storyPoints' | 'businessValue'>('priority');

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockSprint: Sprint = {
      id: sprintId || 'sprint-3',
      name: 'Sprint 3 - Enhancement',
      description: 'Add advanced features and improvements',
      startDate: '2024-01-29',
      endDate: '2024-02-11',
      capacity: 45,
      status: 'planning',
      assignedStories: [],
      goal: '',
      team: {
        id: 'team-1',
        name: 'Development Team Alpha',
        members: [
          {
            id: 'user-1',
            name: 'John Developer',
            email: 'john@example.com',
            role: 'Developer',
            capacity: 40,
            assignedPoints: 0,
            skills: ['React', 'TypeScript', 'Node.js'],
          },
          {
            id: 'user-2',
            name: 'Jane Product',
            email: 'jane@example.com',
            role: 'Product Owner',
            capacity: 40,
            assignedPoints: 0,
            skills: ['Product Management', 'User Research'],
          },
          {
            id: 'user-3',
            name: 'Mike Scrum',
            email: 'mike@example.com',
            role: 'Scrum Master',
            capacity: 40,
            assignedPoints: 0,
            skills: ['Agile', 'Scrum', 'Facilitation'],
          },
          {
            id: 'user-4',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            role: 'Senior Developer',
            capacity: 40,
            assignedPoints: 0,
            skills: ['React', 'TypeScript', 'Architecture'],
          },
          {
            id: 'user-5',
            name: 'Tom Brown',
            email: 'tom@example.com',
            role: 'Developer',
            capacity: 40,
            assignedPoints: 0,
            skills: ['Vue.js', 'CSS', 'Testing'],
          },
        ],
      },
    };

    const mockBacklogStories: UserStory[] = [
      {
        id: 'story-1',
        title: 'Implement user profile customization',
        description: 'Allow users to customize their profiles with avatars, bios, and preferences',
        storyPoints: 8,
        priority: 'high',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-1', name: 'User Management', color: '#3b82f6' },
        labels: ['frontend', 'user-experience'],
        businessValue: 8,
      },
      {
        id: 'story-2',
        title: 'Add real-time notifications',
        description: 'Implement push notifications for task updates and mentions',
        storyPoints: 13,
        priority: 'high',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-2', name: 'Real-time Features', color: '#10b981' },
        labels: ['backend', 'websocket'],
        businessValue: 10,
      },
      {
        id: 'story-3',
        title: 'Build advanced reporting dashboard',
        description: 'Create comprehensive reports with charts and analytics',
        storyPoints: 21,
        priority: 'medium',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-3', name: 'Analytics', color: '#f59e0b' },
        labels: ['analytics', 'charts'],
        businessValue: 9,
      },
      {
        id: 'story-4',
        title: 'Implement file upload system',
        description: 'Add support for file attachments to tasks and stories',
        storyPoints: 5,
        priority: 'medium',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-4', name: 'File Management', color: '#8b5cf6' },
        labels: ['backend', 'storage'],
        businessValue: 6,
      },
      {
        id: 'story-5',
        title: 'Add API rate limiting',
        description: 'Implement rate limiting to prevent API abuse',
        storyPoints: 3,
        priority: 'low',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-5', name: 'Security', color: '#ef4444' },
        labels: ['backend', 'security'],
        businessValue: 5,
      },
      {
        id: 'story-6',
        title: 'Create mobile-responsive design',
        description: 'Optimize the application for mobile devices',
        storyPoints: 13,
        priority: 'high',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-6', name: 'Mobile', color: '#06b6d4' },
        labels: ['frontend', 'responsive'],
        businessValue: 8,
      },
      {
        id: 'story-7',
        title: 'Implement team collaboration features',
        description: 'Add chat, mentions, and team activity feeds',
        storyPoints: 34,
        priority: 'medium',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-7', name: 'Collaboration', color: '#84cc16' },
        labels: ['frontend', 'backend'],
        businessValue: 7,
      },
      {
        id: 'story-8',
        title: 'Add time tracking functionality',
        description: 'Allow users to track time spent on tasks',
        storyPoints: 8,
        priority: 'medium',
        status: 'backlog',
        assignee: undefined,
        epic: { id: 'epic-8', name: 'Time Management', color: '#f97316' },
        labels: ['frontend', 'tracking'],
        businessValue: 6,
      },
    ];

    setSprint(mockSprint);
    setBacklogStories(mockBacklogStories);
    setIsLoading(false);
  }, [sprintId]);

  const filteredStories = useMemo(() => {
    return backlogStories
      .filter(story => {
        const matchesSearch =
          !searchQuery ||
          story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority = priorityFilter === 'all' || story.priority === priorityFilter;

        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'storyPoints':
            return b.storyPoints - a.storyPoints;
          case 'businessValue':
            return (b.businessValue || 0) - (a.businessValue || 0);
          default:
            return 0;
        }
      });
  }, [backlogStories, searchQuery, priorityFilter, sortBy]);

  const selectedStories = useMemo(() => {
    return filteredStories.filter(story => selectedStoryIds.includes(story.id));
  }, [filteredStories, selectedStoryIds]);

  const capacityMetrics = useMemo(() => {
    if (!sprint) return null;

    const totalSelectedPoints = selectedStories.reduce((sum, story) => sum + story.storyPoints, 0);
    const utilizationRate = (totalSelectedPoints / sprint.capacity) * 100;
    const availableCapacity = sprint.capacity - totalSelectedPoints;

    return {
      totalSelectedPoints,
      utilizationRate,
      availableCapacity,
      isOverCapacity: totalSelectedPoints > sprint.capacity,
      remainingCapacity: Math.max(0, availableCapacity),
    };
  }, [sprint, selectedStories]);

  const handleStoryToggle = (storyId: string, isSelected: boolean) => {
    setSelectedStoryIds(prev =>
      isSelected ? [...prev, storyId] : prev.filter(id => id !== storyId)
    );
  };

  const handleSelectAll = () => {
    if (selectedStoryIds.length === filteredStories.length) {
      setSelectedStoryIds([]);
    } else {
      setSelectedStoryIds(filteredStories.map(story => story.id));
    }
  };

  const handleStartSprint = () => {
    if (sprint && selectedStories.length > 0) {
      // In real implementation, this would call the API
      console.log('Starting sprint with stories:', selectedStories);
      navigate(`/sprints/${sprint.id}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCapacityColor = (utilizationRate: number) => {
    if (utilizationRate > 100) return 'text-red-600 dark:text-red-400';
    if (utilizationRate > 90) return 'text-yellow-600 dark:text-yellow-400';
    if (utilizationRate >= 70) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getCapacityBgColor = (utilizationRate: number) => {
    if (utilizationRate > 100) return 'bg-red-100 dark:bg-red-900/20';
    if (utilizationRate > 90) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (utilizationRate >= 70) return 'bg-green-100 dark:bg-green-900/20';
    return 'bg-blue-100 dark:bg-blue-900/20';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Sprint not found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          The sprint you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/sprints"
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
        >
          Back to Sprints
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/sprints"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint Planning</h1>
            <p className="text-gray-600 dark:text-gray-400">{sprint.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md">
            Save Draft
          </button>
          <button
            onClick={handleStartSprint}
            disabled={selectedStories.length === 0 || capacityMetrics?.isOverCapacity || false}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2 inline" />
            Start Sprint
          </button>
        </div>
      </div>

      {/* Sprint Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {sprint.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(sprint.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">End Date</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(sprint.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {Math.ceil(
                    (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Team</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {sprint.team.name} ({sprint.team.members.length} members)
                </div>
              </div>
            </div>
          </div>

          {capacityMetrics && (
            <div
              className={`p-4 rounded-lg ${getCapacityBgColor(capacityMetrics.utilizationRate)}`}
            >
              <div
                className={`text-2xl font-bold ${getCapacityColor(capacityMetrics.utilizationRate)}`}
              >
                {capacityMetrics.utilizationRate.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {capacityMetrics.isOverCapacity ? 'Over Capacity' : 'Utilization'}
              </div>
            </div>
          )}
        </div>

        {/* Sprint Goal */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sprint Goal
          </label>
          <input
            type="text"
            placeholder="What's the main goal for this sprint?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'stories', label: 'Story Selection', icon: <Target className="w-4 h-4" /> },
            {
              id: 'capacity',
              label: 'Capacity Planning',
              icon: <TrendingUp className="w-4 h-4" />,
            },
            { id: 'team', label: 'Team Assignment', icon: <Users className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Story Selection Tab */}
      {viewMode === 'stories' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="priority">Sort by Priority</option>
                <option value="storyPoints">Sort by Story Points</option>
                <option value="businessValue">Sort by Business Value</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedStoryIds.length === filteredStories.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Select All ({selectedStoryIds.length} selected)
              </span>
            </div>
          </div>

          {/* Capacity Summary */}
          {capacityMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {sprint.capacity}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Capacity</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {capacityMetrics.totalSelectedPoints}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Selected Points</div>
              </div>
              <div
                className={`p-4 rounded-lg ${capacityMetrics.isOverCapacity ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}
              >
                <div
                  className={`text-2xl font-bold ${capacityMetrics.isOverCapacity ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}
                >
                  {capacityMetrics.remainingCapacity}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Remaining Capacity</div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {selectedStories.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Stories Selected</div>
              </div>
            </div>
          )}

          {/* Stories List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="max-h-96 overflow-y-auto">
              {filteredStories.map(story => {
                const isSelected = selectedStoryIds.includes(story.id);
                return (
                  <div
                    key={story.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                      isSelected ? 'bg-brand-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => handleStoryToggle(story.id, e.target.checked)}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {story.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                          >
                            {story.priority}
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {story.storyPoints} pts
                          </span>
                          {story.businessValue && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              {story.businessValue} value
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {story.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          {story.epic && <span>Epic: {story.epic.name}</span>}
                          {story.labels.length > 0 && (
                            <span>Labels: {story.labels.join(', ')}</span>
                          )}
                          {story.dependencies && story.dependencies.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Has dependencies</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capacity Warning */}
          {capacityMetrics?.isOverCapacity && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                    Over Capacity Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-500">
                    Selected stories exceed sprint capacity by{' '}
                    {Math.abs(capacityMetrics.remainingCapacity)} points. Consider removing some
                    stories or increasing sprint capacity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Capacity Planning Tab */}
      {viewMode === 'capacity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Capacity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Capacity
              </h3>
              <div className="space-y-4">
                {sprint.team.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.capacity}h
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.assignedPoints} pts assigned
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Capacity Utilization
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Capacity</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sprint.capacity} points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div className="h-3 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                  </div>
                </div>
                {capacityMetrics && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Allocated</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {capacityMetrics.totalSelectedPoints} points (
                        {capacityMetrics.utilizationRate.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          capacityMetrics.isOverCapacity
                            ? 'bg-red-500'
                            : capacityMetrics.utilizationRate > 90
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(capacityMetrics.utilizationRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Assignment Tab */}
      {viewMode === 'team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected Stories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selected Stories ({selectedStories.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedStories.map(story => (
                  <div key={story.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {story.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{story.storyPoints} pts</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                          >
                            {story.priority}
                          </span>
                        </div>
                      </div>
                      <select className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Unassigned</option>
                        {sprint.team.members.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Workload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Workload
              </h3>
              <div className="space-y-4">
                {sprint.team.members.map(member => (
                  <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">0 pts</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">0 stories</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
