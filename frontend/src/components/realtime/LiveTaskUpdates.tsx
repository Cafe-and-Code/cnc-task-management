import React, { useState, useEffect, useCallback } from 'react';
import { useSignalR, useTaskUpdates } from '../../hooks/useSignalR';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  User,
  Calendar,
  MessageSquare,
  Bell,
  Activity,
  Eye,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Target,
  Flag,
  Star,
} from 'lucide-react';

interface TaskUpdate {
  id: string;
  taskId: string;
  type:
    | 'status_changed'
    | 'assigned'
    | 'unassigned'
    | 'priority_changed'
    | 'updated'
    | 'completed'
    | 'commented';
  previousValue?: any;
  newValue?: any;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  description: string;
  metadata?: {
    sprintId?: string;
    projectId?: string;
    assigneeId?: string;
    assigneeName?: string;
    previousStatus?: string;
    newStatus?: string;
    previousPriority?: string;
    newPriority?: string;
    commentId?: string;
    commentPreview?: string;
  };
}

interface LiveTaskUpdatesProps {
  taskId?: string;
  projectId?: string;
  teamId?: string;
  maxUpdates?: number;
  showDetails?: boolean;
  showFilters?: boolean;
  autoRefresh?: boolean;
  position?: 'sidebar' | 'inline' | 'modal';
  className?: string;
}

const LiveTaskUpdates: React.FC<LiveTaskUpdatesProps> = ({
  taskId,
  projectId,
  teamId,
  maxUpdates = 10,
  showDetails = true,
  showFilters = true,
  autoRefresh = true,
  position = 'sidebar',
  className = '',
}) => {
  const { isConnected } = useSignalR();
  const taskUpdates = useTaskUpdates(taskId);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<TaskUpdate[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    types: [] as string[],
    users: [] as string[],
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    priority: 'all' as 'all' | 'high' | 'medium' | 'low',
  });
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'type' | 'user'>('latest');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused && autoRefresh) {
      const processedUpdates = taskUpdates.map(update => ({
        id: `${update.timestamp}-${update.type}`,
        taskId: update.data.taskId || taskId || '',
        type: update.type.replace('-', '_') as TaskUpdate['type'],
        previousValue: update.data.previousValue,
        newValue: update.data.newValue,
        userId: update.data.userId,
        userName: update.data.userName,
        userAvatar: update.data.userAvatar,
        timestamp: update.data.timestamp,
        description: generateUpdateDescription(update),
        metadata: {
          ...update.data,
          assigneeName: update.data.assigneeName || update.data.assignee?.name,
        },
      }));

      setUpdates(prev => {
        const allUpdates = [...processedUpdates, ...prev];
        return allUpdates.slice(0, maxUpdates);
      });
    }
  }, [taskUpdates, isPaused, autoRefresh, maxUpdates, taskId]);

  useEffect(() => {
    let filtered = [...updates];

    // Filter by type
    if (filters.types.length > 0) {
      filtered = filtered.filter(update => filters.types.includes(update.type));
    }

    // Filter by users
    if (filters.users.length > 0) {
      filtered = filtered.filter(update => filters.users.includes(update.userId));
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(update => new Date(update.timestamp) >= cutoffDate);
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'user':
        filtered.sort((a, b) => a.userName.localeCompare(b.userName));
        break;
    }

    setFilteredUpdates(filtered);
  }, [updates, filters, sortBy]);

  const generateUpdateDescription = (update: any): string => {
    switch (update.type) {
      case 'task-updated':
        return `Task updated by ${update.userName}`;
      case 'task-status-changed':
        return `Status changed from ${update.data.previousStatus} to ${update.data.newStatus} by ${update.userName}`;
      case 'task-assigned':
        return `Assigned to ${update.data.assigneeName || update.data.assignee?.name} by ${update.userName}`;
      case 'task-completed':
        return `Task completed by ${update.userName}`;
      case 'task-unassigned':
        return `Unassigned by ${update.userName}`;
      case 'task-priority-changed':
        return `Priority changed from ${update.data.previousPriority} to ${update.data.newPriority} by ${update.userName}`;
      case 'comment-added':
        return `New comment added by ${update.userName}: "${update.data.commentPreview?.substring(0, 50)}..."`;
      default:
        return `Updated by ${update.userName}`;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'status_changed':
      case 'task_status_changed':
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case 'assigned':
      case 'task_assigned':
        return <User className="w-4 h-4 text-green-500" />;
      case 'unassigned':
      case 'task_unassigned':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'completed':
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'priority_changed':
      case 'task_priority_changed':
        return <Flag className="w-4 h-4 text-red-500" />;
      case 'commented':
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'updated':
      case 'task_updated':
        return <Edit className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-gray-600 dark:text-gray-400';
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'review':
        return 'text-purple-600 dark:text-purple-400';
      case 'testing':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'done':
        return 'text-green-600 dark:text-green-400';
      case 'blocked':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes} min ago`;
    }
  };

  const toggleFilter = (category: string, value: string) => {
    setFilters(prev => {
      const current = prev[category as keyof typeof prev];
      if (Array.isArray(current)) {
        const updated = current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value];
        return { ...prev, [category]: updated };
      }
      return { ...prev, [category]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      users: [],
      dateRange: 'all',
      priority: 'all',
    });
  };

  const renderSidebar = () => (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">Live Updates</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 rounded ${isPaused ? 'text-gray-400' : 'text-green-500'}`}
            title={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`p-1 rounded ${showFiltersPanel ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showFiltersPanel && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Type
              </label>
              <div className="flex flex-wrap gap-1">
                {['status_changed', 'assigned', 'completed', 'commented'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('types', type)}
                    className={`px-2 py-1 text-xs rounded ${
                      filters.types.includes(type)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Range
              </label>
              <select
                value={filters.dateRange}
                onChange={e => toggleFilter('dateRange', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="type">Type</option>
                <option value="user">User</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredUpdates.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent updates</p>
            {updates.length === 0 && (
              <p className="text-xs mt-1">
                {isConnected ? 'Waiting for activity...' : 'Connect to see live updates'}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUpdates.map(update => (
              <div
                key={update.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => setExpandedUpdate(expandedUpdate === update.id ? null : update.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getUpdateIcon(update.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {update.description}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(update.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <img
                        src={update.userAvatar}
                        alt={update.userName}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {update.userName}
                      </span>
                    </div>

                    {expandedUpdate === update.id && showDetails && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                        <div className="space-y-1">
                          {update.previousValue !== undefined && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Previous:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {String(update.previousValue)}
                              </span>
                            </div>
                          )}
                          {update.newValue !== undefined && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Current:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {String(update.newValue)}
                              </span>
                            </div>
                          )}
                          {update.metadata?.assigneeName && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Assignee:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {update.metadata.assigneeName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {filteredUpdates.length} update{filteredUpdates.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInline = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Recent Updates</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 rounded ${isPaused ? 'text-gray-400' : 'text-green-500'}`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button className="p-1 text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredUpdates.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUpdates.slice(0, 5).map(update => (
            <div
              key={update.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              {getUpdateIcon(update.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">
                  {update.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <img
                    src={update.userAvatar}
                    alt={update.userName}
                    className="w-3 h-3 rounded-full"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {update.userName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(update.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredUpdates.length > 5 && (
            <div className="text-center pt-2">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                View all {filteredUpdates.length} updates
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderModal = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-96">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">Task Updates</h3>
          <button
            onClick={() => {
              /* Close modal */
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-80">
          {filteredUpdates.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent updates</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUpdates.map(update => (
                <div key={update.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{update.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <img
                          src={update.userAvatar}
                          alt={update.userName}
                          className="w-3 h-3 rounded-full"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {update.userName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(update.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {filteredUpdates.length} update{filteredUpdates.length !== 1 ? 's' : ''}
            </span>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (position === 'sidebar') {
    return renderSidebar();
  }

  if (position === 'inline') {
    return renderInline();
  }

  if (position === 'modal') {
    return renderModal();
  }

  return renderInline();
};

export default LiveTaskUpdates;
