import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
} from 'lucide-react';

// Types
interface UserStory {
  id: string;
  title: string;
  storyPoints: number;
  status: 'backlog' | 'in_sprint' | 'completed' | 'in_progress' | 'testing' | 'blocked';
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
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
  velocity?: number;
  goal?: string;
  progress?: number;
  burndownData?: { day: number; remaining: number }[];
  team: {
    id: string;
    name: string;
    members: TeamMember[];
  };
}

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

export const SprintsPage: React.FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'cards'>('timeline');

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockSprints: Sprint[] = [
      {
        id: 'sprint-1',
        name: 'Sprint 1 - Foundation',
        description: 'Set up project foundation and core authentication',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        capacity: 40,
        status: 'completed',
        velocity: 42,
        goal: 'Complete authentication system and basic UI',
        progress: 100,
        burndownData: [
          { day: 1, remaining: 40 },
          { day: 3, remaining: 35 },
          { day: 5, remaining: 25 },
          { day: 7, remaining: 18 },
          { day: 9, remaining: 10 },
          { day: 11, remaining: 5 },
          { day: 13, remaining: 0 },
        ],
        team: {
          id: 'team-1',
          name: 'Development Team Alpha',
          members: [
            { id: 'user-1', name: 'John Developer', avatarUrl: '', role: 'Developer' },
            { id: 'user-2', name: 'Jane Product', avatarUrl: '', role: 'Product Owner' },
            { id: 'user-3', name: 'Mike Scrum', avatarUrl: '', role: 'Scrum Master' },
          ],
        },
        assignedStories: [
          {
            id: 'story-1',
            title: 'Set up authentication',
            storyPoints: 8,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-2',
            title: 'Create user registration',
            storyPoints: 5,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-3',
            title: 'Build login page',
            storyPoints: 3,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-4',
            title: 'Implement JWT tokens',
            storyPoints: 8,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-5',
            title: 'Add password reset',
            storyPoints: 5,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-6',
            title: 'Create user dashboard',
            storyPoints: 13,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
        ],
      },
      {
        id: 'sprint-2',
        name: 'Sprint 2 - Core Features',
        description: 'Build core project management features',
        startDate: '2024-01-15',
        endDate: '2024-01-28',
        capacity: 42,
        status: 'active',
        velocity: 38,
        goal: 'Implement project and team management',
        progress: 65,
        burndownData: [
          { day: 1, remaining: 42 },
          { day: 3, remaining: 38 },
          { day: 5, remaining: 28 },
          { day: 7, remaining: 20 },
          { day: 9, remaining: 15 },
        ],
        team: {
          id: 'team-1',
          name: 'Development Team Alpha',
          members: [
            { id: 'user-1', name: 'John Developer', avatarUrl: '', role: 'Developer' },
            { id: 'user-2', name: 'Jane Product', avatarUrl: '', role: 'Product Owner' },
            { id: 'user-3', name: 'Mike Scrum', avatarUrl: '', role: 'Scrum Master' },
            { id: 'user-4', name: 'Sarah Wilson', avatarUrl: '', role: 'Developer' },
          ],
        },
        assignedStories: [
          {
            id: 'story-7',
            title: 'Project creation interface',
            storyPoints: 8,
            status: 'completed',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-8',
            title: 'Team management system',
            storyPoints: 13,
            status: 'completed',
            assignee: { id: 'user-4', name: 'Sarah Wilson' },
          },
          {
            id: 'story-9',
            title: 'Task assignment',
            storyPoints: 5,
            status: 'in_progress',
            assignee: { id: 'user-1', name: 'John Developer' },
          },
          {
            id: 'story-10',
            title: 'Sprint planning tool',
            storyPoints: 8,
            status: 'in_progress',
            assignee: { id: 'user-4', name: 'Sarah Wilson' },
          },
          { id: 'story-11', title: 'Progress tracking', storyPoints: 3, status: 'backlog' },
        ],
      },
      {
        id: 'sprint-3',
        name: 'Sprint 3 - Enhancement',
        description: 'Add advanced features and improvements',
        startDate: '2024-01-29',
        endDate: '2024-02-11',
        capacity: 45,
        status: 'planning',
        velocity: 40,
        goal: 'Enhance user experience and add reporting',
        progress: 0,
        team: {
          id: 'team-1',
          name: 'Development Team Alpha',
          members: [
            { id: 'user-1', name: 'John Developer', avatarUrl: '', role: 'Developer' },
            { id: 'user-2', name: 'Jane Product', avatarUrl: '', role: 'Product Owner' },
            { id: 'user-3', name: 'Mike Scrum', avatarUrl: '', role: 'Scrum Master' },
            { id: 'user-4', name: 'Sarah Wilson', avatarUrl: '', role: 'Developer' },
            { id: 'user-5', name: 'Tom Brown', avatarUrl: '', role: 'Developer' },
          ],
        },
        assignedStories: [],
      },
      {
        id: 'sprint-4',
        name: 'Sprint 4 - Polish & Launch',
        description: 'Final polish and prepare for launch',
        startDate: '2024-02-12',
        endDate: '2024-02-25',
        capacity: 40,
        status: 'planning',
        velocity: 45,
        goal: 'Complete testing and prepare for production',
        progress: 0,
        team: {
          id: 'team-1',
          name: 'Development Team Alpha',
          members: [
            { id: 'user-1', name: 'John Developer', avatarUrl: '', role: 'Developer' },
            { id: 'user-2', name: 'Jane Product', avatarUrl: '', role: 'Product Owner' },
            { id: 'user-3', name: 'Mike Scrum', avatarUrl: '', role: 'Scrum Master' },
            { id: 'user-4', name: 'Sarah Wilson', avatarUrl: '', role: 'Developer' },
            { id: 'user-5', name: 'Tom Brown', avatarUrl: '', role: 'Developer' },
          ],
        },
        assignedStories: [],
      },
    ];

    setSprints(mockSprints);
    setIsLoading(false);
  }, []);

  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch =
      !searchQuery ||
      sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.goal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sprint.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      case 'planning':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSprintStats = () => {
    const total = sprints.length;
    const completed = sprints.filter(s => s.status === 'completed').length;
    const active = sprints.filter(s => s.status === 'active').length;
    const planning = sprints.filter(s => s.status === 'planning').length;
    const cancelled = sprints.filter(s => s.status === 'cancelled').length;

    return { total, completed, active, planning, cancelled };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const stats = getSprintStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sprint Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage sprints and track development progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sprints</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.completed}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Planning</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.planning}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Velocity</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(
                  sprints.filter(s => s.velocity).reduce((sum, s) => sum + (s.velocity || 0), 0) /
                    sprints.filter(s => s.velocity).length || 0
                )}
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sprints..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
              { id: 'list', label: 'List', icon: <Filter className="w-4 h-4" /> },
              { id: 'cards', label: 'Cards', icon: <div className="w-4 h-4" /> },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.id
                    ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <Link
            to="/sprints/new"
            className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Link>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline Header */}
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <div className="relative flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
              <span>Jan 1</span>
              <span>Jan 15</span>
              <span>Jan 29</span>
              <span>Feb 12</span>
              <span>Feb 26</span>
            </div>
          </div>

          {/* Sprint Timeline Items */}
          <div className="space-y-4">
            {filteredSprints.map((sprint, index) => (
              <div key={sprint.id} className="relative">
                <div className="flex items-start space-x-4">
                  {/* Timeline Dot */}
                  <div className="relative z-10">
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                        sprint.status === 'active'
                          ? 'bg-green-500'
                          : sprint.status === 'completed'
                            ? 'bg-blue-500'
                            : sprint.status === 'cancelled'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                      }`}
                    ></div>
                    {index < filteredSprints.length - 1 && (
                      <div className="absolute top-4 left-2 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
                    )}
                  </div>

                  {/* Sprint Card */}
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {sprint.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status)}`}
                          >
                            {getStatusIcon(sprint.status)}
                            <span className="ml-1">{sprint.status}</span>
                          </span>
                        </div>

                        {sprint.goal && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <strong>Goal:</strong> {sprint.goal}
                          </p>
                        )}

                        {sprint.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {sprint.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{sprint.team.members.length} members</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{sprint.capacity} capacity</span>
                          </span>
                          {sprint.velocity && (
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{sprint.velocity} velocity</span>
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        {sprint.status === 'active' && sprint.progress !== undefined && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {sprint.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(sprint.progress)}`}
                                style={{ width: `${sprint.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Burndown Chart Mini */}
                        {sprint.burndownData && sprint.burndownData.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Burndown</span>
                            </div>
                            <div className="h-16 flex items-end space-x-1">
                              {sprint.burndownData.map((point, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 bg-brand-primary rounded-t"
                                  style={{
                                    height: `${(point.remaining / sprint.capacity) * 100}%`,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/sprints/${sprint.id}`}
                          className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sprint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSprints.map(sprint => (
                  <tr key={sprint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {sprint.name}
                        </div>
                        {sprint.goal && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {sprint.goal}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sprint.status)}`}
                      >
                        {getStatusIcon(sprint.status)}
                        <span className="ml-1">{sprint.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.capacity} pts
                      {sprint.velocity && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {' '}
                          ({sprint.velocity} vel)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.assignedStories.length} stories
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sprint.progress !== undefined ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(sprint.progress)}`}
                              style={{ width: `${sprint.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {sprint.progress}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/sprints/${sprint.id}`}
                        className="text-brand-primary hover:text-brand-primary/80"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSprints.map(sprint => (
            <div
              key={sprint.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {sprint.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status)}`}
                  >
                    {getStatusIcon(sprint.status)}
                    <span className="ml-1">{sprint.status}</span>
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {sprint.goal && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{sprint.goal}</p>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                  <span className="text-gray-900 dark:text-white">{sprint.capacity} points</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Team</span>
                  <span className="text-gray-900 dark:text-white">
                    {sprint.team.members.length} members
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Stories</span>
                  <span className="text-gray-900 dark:text-white">
                    {sprint.assignedStories.length}
                  </span>
                </div>
              </div>

              {sprint.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sprint.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(sprint.progress)}`}
                      style={{ width: `${sprint.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Link
                  to={`/sprints/${sprint.id}`}
                  className="flex-1 text-center px-3 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 text-sm font-medium"
                >
                  View Details
                </Link>
                {sprint.status === 'planning' && (
                  <Link
                    to={`/sprints/${sprint.id}/plan`}
                    className="flex-1 text-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                  >
                    Plan Sprint
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSprints.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No sprints found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first sprint'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link
              to="/sprints/new"
              className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Sprint
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
