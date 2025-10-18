import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface ProjectMetrics {
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalSprints: number;
    completedSprints: number;
    currentSprint?: {
      id: number;
      name: string;
      startDate: string;
      endDate: string;
      progress: number;
    };
    teamMembers: number;
    averageVelocity: number;
    burndownRate: number;
  };
  velocity: Array<{
    sprint: string;
    planned: number;
    completed: number;
    velocity: number;
  }>;
  taskDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  teamPerformance: Array<{
    member: string;
    tasksCompleted: number;
    tasksInProgress: number;
    velocity: number;
    efficiency: number;
  }>;
  sprintProgress: Array<{
    day: string;
    planned: number;
    actual: number;
    ideal: number;
  }>;
  timeTracking: {
    totalHoursLogged: number;
    averageHoursPerTask: number;
    estimatedHoursRemaining: number;
    tasksWithTime: number;
    tasksWithoutTime: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: Date;
    user: string;
  }>;
}

interface ProjectMetricsDashboardProps {
  projectId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  refreshInterval?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ProjectMetricsDashboard: React.FC<ProjectMetricsDashboardProps> = ({
  projectId,
  timeRange = 'month',
  refreshInterval = 30000,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'velocity' | 'team' | 'sprints' | 'tasks'
  >('overview');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock metrics data - in real implementation, this would come from API
        const mockMetrics: ProjectMetrics = {
          overview: {
            totalTasks: 156,
            completedTasks: 89,
            inProgressTasks: 34,
            pendingTasks: 33,
            totalSprints: 8,
            completedSprints: 6,
            currentSprint: {
              id: 8,
              name: 'Sprint 8 - UI Implementation',
              startDate: '2024-01-20',
              endDate: '2024-02-02',
              progress: 65,
            },
            teamMembers: 8,
            averageVelocity: 21.5,
            burndownRate: 3.2,
          },
          velocity: [
            { sprint: 'Sprint 1', planned: 20, completed: 18, velocity: 18 },
            { sprint: 'Sprint 2', planned: 24, completed: 22, velocity: 22 },
            { sprint: 'Sprint 3', planned: 21, completed: 25, velocity: 25 },
            { sprint: 'Sprint 4', planned: 23, completed: 19, velocity: 19 },
            { sprint: 'Sprint 5', planned: 26, completed: 28, velocity: 28 },
            { sprint: 'Sprint 6', planned: 22, completed: 24, velocity: 24 },
            { sprint: 'Sprint 7', planned: 25, completed: 23, velocity: 23 },
          ],
          taskDistribution: [
            { status: 'Completed', count: 89, color: '#10b981' },
            { status: 'In Progress', count: 34, color: '#3b82f6' },
            { status: 'Pending', count: 33, color: '#f59e0b' },
          ],
          teamPerformance: [
            {
              member: 'John Doe',
              tasksCompleted: 23,
              tasksInProgress: 3,
              velocity: 28,
              efficiency: 95,
            },
            {
              member: 'Jane Smith',
              tasksCompleted: 19,
              tasksInProgress: 4,
              velocity: 24,
              efficiency: 88,
            },
            {
              member: 'Mike Johnson',
              tasksCompleted: 21,
              tasksInProgress: 2,
              velocity: 26,
              efficiency: 92,
            },
            {
              member: 'Sarah Wilson',
              tasksCompleted: 18,
              tasksInProgress: 5,
              velocity: 22,
              efficiency: 85,
            },
            {
              member: 'Tom Brown',
              tasksCompleted: 8,
              tasksInProgress: 6,
              velocity: 14,
              efficiency: 78,
            },
          ],
          sprintProgress: [
            { day: 'Day 1', planned: 25, actual: 25, ideal: 25 },
            { day: 'Day 2', planned: 23, actual: 22, ideal: 23 },
            { day: 'Day 3', planned: 21, actual: 20, ideal: 21 },
            { day: 'Day 4', planned: 19, actual: 18, ideal: 19 },
            { day: 'Day 5', planned: 17, actual: 16, ideal: 17 },
            { day: 'Day 6', planned: 15, actual: 14, ideal: 15 },
            { day: 'Day 7', planned: 13, actual: 12, ideal: 13 },
            { day: 'Day 8', planned: 11, actual: 10, ideal: 11 },
          ],
          timeTracking: {
            totalHoursLogged: 342,
            averageHoursPerTask: 3.8,
            estimatedHoursRemaining: 127,
            tasksWithTime: 89,
            tasksWithoutTime: 67,
          },
          recentActivity: [
            {
              id: '1',
              type: 'task_completed',
              title: 'API Authentication completed',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              user: 'John Doe',
            },
            {
              id: '2',
              type: 'sprint_started',
              title: 'Sprint 8 started',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              user: 'Jane Smith',
            },
            {
              id: '3',
              type: 'task_created',
              title: 'New task: Database Optimization',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
              user: 'Mike Johnson',
            },
          ],
        };

        setMetrics(mockMetrics);
      } catch (error: any) {
        console.error('Failed to load metrics:', error);
        setError(error.message || 'Failed to load project metrics');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();

    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [projectId, timeRange, refreshInterval]);

  const refreshMetrics = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      // In a real implementation, this would fetch fresh metrics from the API
      console.log('Refreshing metrics...');
    } catch (error: any) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'velocity', label: 'Velocity', icon: '📈' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'sprints', label: 'Sprints', icon: '🏃' },
    { id: 'tasks', label: 'Tasks', icon: '📝' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !metrics) {
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error || 'Failed to load project metrics'}
        </p>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Tasks
            </span>
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.totalTasks}
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
            <span>{metrics.overview.completedTasks} completed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Team Velocity
            </span>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.averageVelocity}
          </div>
          <div className="flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400">
            <span>points per sprint</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Team Members
            </span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.teamMembers}
          </div>
          <div className="flex items-center mt-2 text-sm text-purple-600 dark:text-purple-400">
            <span>active members</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sprints</span>
            <span className="text-2xl">🏃</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.overview.completedSprints}/{metrics.overview.totalSprints}
          </div>
          <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
            <span>completed</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Task Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ count, percent }) => `${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Sprint Progress */}
        {metrics.overview.currentSprint && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {metrics.overview.currentSprint.name}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.overview.currentSprint.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.overview.currentSprint.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Start: {new Date(metrics.overview.currentSprint.startDate).toLocaleDateString()}
                </p>
                <p>End: {new Date(metrics.overview.currentSprint.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {metrics.recentActivity.map(activity => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm">
                {activity.user.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.user} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVelocityTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sprint Velocity</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.velocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="sprint" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="planned" fill="#3b82f6" name="Planned" />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.velocity.reduce((sum, v) => sum + v.planned, 0) / metrics.velocity.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Planned</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {metrics.velocity.reduce((sum, v) => sum + v.completed, 0) / metrics.velocity.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.overview.averageVelocity}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Velocity</div>
        </div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.teamPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="member" type="category" stroke="#9ca3af" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="tasksCompleted" fill="#10b981" name="Completed" />
              <Bar dataKey="tasksInProgress" fill="#3b82f6" name="In Progress" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.teamPerformance.map(member => (
          <div
            key={member.member}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">{member.member}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Velocity</span>
                <span className="font-medium text-gray-900 dark:text-white">{member.velocity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Efficiency</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {member.efficiency}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {member.tasksCompleted}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSprintsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Sprint Burndown
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.sprintProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Planned"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={2}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Ideal"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sprint History</h3>
          <div className="space-y-3">
            {metrics.velocity.map((sprint, index) => (
              <div
                key={sprint.sprint}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{sprint.sprint}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {sprint.completed}/{sprint.planned} points
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {sprint.velocity}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Time Tracking</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Hours Logged</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {metrics.timeTracking.totalHoursLogged}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Hours per Task</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {metrics.timeTracking.averageHoursPerTask}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Remaining</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {metrics.timeTracking.estimatedHoursRemaining}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tasks with Time</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {metrics.timeTracking.tasksWithTime}/{metrics.overview.totalTasks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {metrics.overview.completedTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.overview.inProgressTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {metrics.overview.pendingTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {Math.round((metrics.overview.completedTasks / metrics.overview.totalTasks) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Task Status Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.taskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="status" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Metrics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed analytics and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isRefreshing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Refreshing...</span>
            </div>
          )}
          <button
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.id
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
        <div className="p-6">
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'velocity' && renderVelocityTab()}
          {selectedTab === 'team' && renderTeamTab()}
          {selectedTab === 'sprints' && renderSprintsTab()}
          {selectedTab === 'tasks' && renderTasksTab()}
        </div>
      </div>
    </div>
  );
};
