import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Edit,
  MoreHorizontal,
  Target,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  MessageSquare,
  Paperclip,
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
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  capacity: number;
  assignedPoints: number;
  completedPoints: number;
  tasksCompleted: number;
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
  burndownData?: { day: number; remaining: number; ideal: number }[];
  team: {
    id: string;
    name: string;
    members: TeamMember[];
  };
  createdAt: string;
  updatedAt: string;
}

interface SprintActivity {
  id: string;
  type:
    | 'story_assigned'
    | 'story_completed'
    | 'story_started'
    | 'sprint_started'
    | 'sprint_completed'
    | 'member_assigned';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: any;
}

export const SprintDetailPage: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [activities, setActivities] = useState<SprintActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stories' | 'burndown' | 'team' | 'activity'
  >('overview');

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockSprint: Sprint = {
      id: sprintId || 'sprint-2',
      name: 'Sprint 2 - Core Features',
      description:
        'Build core project management features including team collaboration, task tracking, and reporting capabilities',
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      capacity: 42,
      status: 'active',
      velocity: 38,
      goal: 'Implement comprehensive project management with real-time collaboration',
      progress: 65,
      burndownData: [
        { day: 1, remaining: 42, ideal: 42 },
        { day: 2, remaining: 40, ideal: 39 },
        { day: 3, remaining: 38, ideal: 36 },
        { day: 4, remaining: 35, ideal: 33 },
        { day: 5, remaining: 28, ideal: 30 },
        { day: 6, remaining: 25, ideal: 27 },
        { day: 7, remaining: 20, ideal: 24 },
        { day: 8, remaining: 15, ideal: 21 },
        { day: 9, remaining: 15, ideal: 18 },
        { day: 10, remaining: 10, ideal: 15 },
        { day: 11, remaining: 8, ideal: 12 },
        { day: 12, remaining: 8, ideal: 9 },
        { day: 13, remaining: 5, ideal: 6 },
        { day: 14, remaining: 0, ideal: 3 },
      ],
      team: {
        id: 'team-1',
        name: 'Development Team Alpha',
        members: [
          {
            id: 'user-1',
            name: 'John Developer',
            email: 'john@example.com',
            role: 'Senior Developer',
            capacity: 45,
            assignedPoints: 21,
            completedPoints: 13,
            tasksCompleted: 3,
          },
          {
            id: 'user-2',
            name: 'Jane Product',
            email: 'jane@example.com',
            role: 'Product Owner',
            capacity: 40,
            assignedPoints: 8,
            completedPoints: 5,
            tasksCompleted: 2,
          },
          {
            id: 'user-3',
            name: 'Mike Scrum',
            email: 'mike@example.com',
            role: 'Scrum Master',
            capacity: 40,
            assignedPoints: 5,
            completedPoints: 3,
            tasksCompleted: 1,
          },
          {
            id: 'user-4',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            role: 'Developer',
            capacity: 42,
            assignedPoints: 13,
            completedPoints: 8,
            tasksCompleted: 2,
          },
          {
            id: 'user-5',
            name: 'Tom Brown',
            email: 'tom@example.com',
            role: 'Junior Developer',
            capacity: 35,
            assignedPoints: 3,
            completedPoints: 0,
            tasksCompleted: 0,
          },
        ],
      },
      assignedStories: [
        {
          id: 'story-1',
          title: 'Project creation interface',
          description: 'Build comprehensive project creation form with templates and validation',
          storyPoints: 8,
          priority: 'high',
          status: 'completed',
          assignee: { id: 'user-1', name: 'John Developer', email: 'john@example.com' },
          epic: { id: 'epic-1', name: 'Project Management', color: '#3b82f6' },
          labels: ['frontend', 'forms'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-18T16:30:00Z',
          estimatedHours: 16,
          actualHours: 14,
        },
        {
          id: 'story-2',
          title: 'Team management system',
          description: 'Implement team creation, member management, and role assignment',
          storyPoints: 13,
          priority: 'high',
          status: 'completed',
          assignee: { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com' },
          epic: { id: 'epic-2', name: 'Team Management', color: '#10b981' },
          labels: ['backend', 'auth'],
          createdAt: '2024-01-15T11:00:00Z',
          updatedAt: '2024-01-20T14:20:00Z',
          estimatedHours: 26,
          actualHours: 28,
        },
        {
          id: 'story-3',
          title: 'Task assignment workflow',
          description: 'Create drag-and-drop task assignment and notification system',
          storyPoints: 5,
          priority: 'medium',
          status: 'in_progress',
          assignee: { id: 'user-1', name: 'John Developer', email: 'john@example.com' },
          epic: { id: 'epic-3', name: 'Task Management', color: '#f59e0b' },
          labels: ['frontend', 'drag-drop'],
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-22T11:15:00Z',
          estimatedHours: 10,
          actualHours: 7,
        },
        {
          id: 'story-4',
          title: 'Sprint planning tool',
          description: 'Build interactive sprint planning with capacity management',
          storyPoints: 8,
          priority: 'high',
          status: 'in_progress',
          assignee: { id: 'user-4', name: 'Sarah Wilson', email: 'sarah@example.com' },
          epic: { id: 'epic-4', name: 'Sprint Management', color: '#8b5cf6' },
          labels: ['frontend', 'planning'],
          createdAt: '2024-01-17T10:30:00Z',
          updatedAt: '2024-01-23T09:45:00Z',
          estimatedHours: 16,
          actualHours: 9,
        },
        {
          id: 'story-5',
          title: 'Progress tracking dashboard',
          description: 'Real-time progress tracking with charts and metrics',
          storyPoints: 3,
          priority: 'low',
          status: 'backlog',
          assignee: undefined,
          epic: { id: 'epic-5', name: 'Analytics', color: '#ef4444' },
          labels: ['frontend', 'charts'],
          createdAt: '2024-01-18T14:00:00Z',
          updatedAt: '2024-01-18T14:00:00Z',
          estimatedHours: 6,
        },
        {
          id: 'story-6',
          title: 'User role management',
          description: 'Implement role-based permissions and access control',
          storyPoints: 5,
          priority: 'medium',
          status: 'backlog',
          assignee: { id: 'user-2', name: 'Jane Product', email: 'jane@example.com' },
          epic: { id: 'epic-6', name: 'Security', color: '#06b6d4' },
          labels: ['backend', 'security'],
          createdAt: '2024-01-19T16:00:00Z',
          updatedAt: '2024-01-19T16:00:00Z',
          estimatedHours: 10,
        },
      ],
      createdAt: '2024-01-14T10:00:00Z',
      updatedAt: '2024-01-23T15:30:00Z',
    };

    const mockActivities: SprintActivity[] = [
      {
        id: 'activity-1',
        type: 'sprint_started',
        description: 'Sprint started',
        userId: 'user-3',
        userName: 'Mike Scrum',
        timestamp: '2024-01-15T09:00:00Z',
      },
      {
        id: 'activity-2',
        type: 'story_assigned',
        description: 'John Developer assigned to "Project creation interface"',
        userId: 'user-1',
        userName: 'John Developer',
        timestamp: '2024-01-15T10:30:00Z',
        metadata: { storyId: 'story-1' },
      },
      {
        id: 'activity-3',
        type: 'story_started',
        description: 'Started working on "Project creation interface"',
        userId: 'user-1',
        userName: 'John Developer',
        timestamp: '2024-01-16T09:15:00Z',
        metadata: { storyId: 'story-1' },
      },
      {
        id: 'activity-4',
        type: 'story_completed',
        description: 'Completed "Project creation interface"',
        userId: 'user-1',
        userName: 'John Developer',
        timestamp: '2024-01-18T16:30:00Z',
        metadata: { storyId: 'story-1' },
      },
      {
        id: 'activity-5',
        type: 'story_completed',
        description: 'Completed "Team management system"',
        userId: 'user-4',
        userName: 'Sarah Wilson',
        timestamp: '2024-01-20T14:20:00Z',
        metadata: { storyId: 'story-2' },
      },
    ];

    setSprint(mockSprint);
    setActivities(mockActivities);
    setIsLoading(false);
  }, [sprintId]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStoryStats = () => {
    if (!sprint)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        backlog: 0,
        totalPoints: 0,
        completedPoints: 0,
      };

    const total = sprint.assignedStories.length;
    const completed = sprint.assignedStories.filter(s => s.status === 'completed').length;
    const inProgress = sprint.assignedStories.filter(s => s.status === 'in_progress').length;
    const backlog = sprint.assignedStories.filter(s => s.status === 'backlog').length;
    const totalPoints = sprint.assignedStories.reduce((sum, s) => sum + s.storyPoints, 0);
    const completedPoints = sprint.assignedStories
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.storyPoints, 0);

    return { total, completed, inProgress, backlog, totalPoints, completedPoints };
  };

  const getSprintStats = () => {
    if (!sprint) return null;

    const storyStats = getStoryStats();
    const daysElapsed = Math.ceil(
      (new Date().getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalDays = Math.ceil(
      (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    return {
      daysElapsed,
      totalDays,
      daysRemaining,
      utilizationRate: (storyStats.totalPoints / sprint.capacity) * 100,
      completionRate: (storyStats.completedPoints / storyStats.totalPoints) * 100 || 0,
    };
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

  const storyStats = getStoryStats();
  const sprintStats = getSprintStats()!;

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sprint.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date(sprint.startDate).toLocaleDateString()} -{' '}
              {new Date(sprint.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sprint.status)}`}
          >
            {getStatusIcon(sprint.status)}
            <span className="ml-1">{sprint.status}</span>
          </span>

          {sprint.status === 'planning' && (
            <Link
              to={`/sprints/${sprint.id}/plan`}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
            >
              Plan Sprint
            </Link>
          )}

          {sprint.status === 'active' && (
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Complete Sprint
            </button>
          )}

          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Edit className="w-4 h-4" />
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sprint Goal */}
      {sprint.goal && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Sprint Goal
              </h3>
              <p className="text-blue-800 dark:text-blue-200">{sprint.goal}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {storyStats.completed}/{storyStats.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {storyStats.completedPoints} of {storyStats.totalPoints} points
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sprintStats.completionRate.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {sprintStats.daysElapsed} of {sprintStats.totalDays} days
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sprintStats.utilizationRate.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {storyStats.totalPoints} of {sprint.capacity} points
              </p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sprint.team.members.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {sprint.team.members.filter(m => m.completedPoints > 0).length} active
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
            {
              id: 'stories',
              label: 'Stories',
              icon: <Target className="w-4 h-4" />,
              count: storyStats.total,
            },
            { id: 'burndown', label: 'Burndown', icon: <TrendingUp className="w-4 h-4" /> },
            {
              id: 'team',
              label: 'Team',
              icon: <Users className="w-4 h-4" />,
              count: sprint.team.members.length,
            },
            {
              id: 'activity',
              label: 'Activity',
              icon: <Clock className="w-4 h-4" />,
              count: activities.length,
            },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Sprint Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {sprintStats.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{ width: `${sprintStats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Days Elapsed</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {sprintStats.daysElapsed} / {sprintStats.totalDays}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Days Remaining</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {sprintStats.daysRemaining}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Stories Completed</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {storyStats.completed} / {storyStats.total}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Points Completed</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {storyStats.completedPoints} / {storyStats.totalPoints}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Story Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {storyStats.completed} stories ({storyStats.completedPoints} pts)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {storyStats.inProgress} stories (
                      {sprint.assignedStories
                        .filter(s => s.status === 'in_progress')
                        .reduce((sum, s) => sum + s.storyPoints, 0)}{' '}
                      pts)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Backlog</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {storyStats.backlog} stories (
                      {sprint.assignedStories
                        .filter(s => s.status === 'backlog')
                        .reduce((sum, s) => sum + s.storyPoints, 0)}{' '}
                      pts)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Burndown Chart */}
            {sprint.burndownData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Burndown Chart
                </h3>
                <div className="h-64 flex items-end space-x-1">
                  {sprint.burndownData.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col space-y-1">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${(point.remaining / sprint.capacity) * 200}px` }}
                          title={`Day ${point.day}: ${point.remaining} remaining`}
                        ></div>
                        <div
                          className="w-full bg-gray-300 dark:bg-gray-600 rounded-t"
                          style={{ height: `${(point.ideal / sprint.capacity) * 200}px` }}
                          title={`Day ${point.day}: ${point.ideal} ideal`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {point.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Actual</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Ideal</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            {sprint.assignedStories.map(story => (
              <div
                key={story.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {story.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}
                      >
                        {story.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                      >
                        {story.priority}
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {story.storyPoints} pts
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">{story.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {story.assignee && <span>Assigned to {story.assignee.name}</span>}
                      {story.epic && <span>Epic: {story.epic.name}</span>}
                      {story.estimatedHours && story.actualHours && (
                        <span>
                          Time: {story.actualHours}h / {story.estimatedHours}h
                        </span>
                      )}
                      <span>Updated {formatDate(story.updatedAt)}</span>
                    </div>

                    {story.labels.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        {story.labels.map(label => (
                          <span
                            key={label}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Burndown Tab */}
        {activeTab === 'burndown' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Burndown Chart
            </h3>
            {sprint.burndownData ? (
              <div className="space-y-4">
                <div className="h-96">
                  {/* In a real implementation, this would use a charting library like Chart.js or Recharts */}
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Burndown chart would be rendered here</p>
                      <p className="text-sm mt-2">
                        Showing {sprint.burndownData.length} days of data
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Starting Points</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {sprint.capacity}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Current Points</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {sprint.burndownData[sprint.burndownData.length - 1]?.remaining || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Average Daily Burn</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {(
                        (sprint.capacity -
                          (sprint.burndownData[sprint.burndownData.length - 1]?.remaining || 0)) /
                        sprintStats.daysElapsed
                      ).toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Projected Completion</span>
                    <div className="font-medium text-gray-900 dark:text-white">On Track</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No burndown data available yet
              </div>
            )}
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            {sprint.team.members.map(member => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {member.completedPoints} / {member.assignedPoints} pts
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {member.tasksCompleted} tasks completed
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.capacity} pts
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Assigned</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.assignedPoints} pts
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {member.completedPoints} pts
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Completion</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.assignedPoints > 0
                        ? ((member.completedPoints / member.assignedPoints) * 100).toFixed(0)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                    {activity.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
