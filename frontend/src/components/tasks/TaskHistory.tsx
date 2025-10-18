import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  FileText,
  MessageSquare,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Activity,
  GitBranch,
  Tag,
  Users,
  Link,
  Paperclip,
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: string;
  type:
    | 'created'
    | 'updated'
    | 'commented'
    | 'assigned'
    | 'status_changed'
    | 'priority_changed'
    | 'dependency_added'
    | 'dependency_removed'
    | 'attachment_added'
    | 'attachment_removed'
    | 'time_logged'
    | 'subtask_added'
    | 'subtask_completed'
    | 'label_added'
    | 'label_removed';
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  details: HistoryEntryDetails;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

interface HistoryEntryDetails {
  title?: string;
  description?: string;
  oldValue?: any;
  newValue?: any;
  field?: string;
  comment?: string;
  attachment?: string;
  timeSpent?: number;
  subtask?: string;
  label?: string;
  assignee?: string;
  dependency?: string;
}

interface TaskHistoryProps {
  taskId: string;
  showFilters?: boolean;
  showExport?: boolean;
  className?: string;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({
  taskId,
  showFilters = true,
  showExport = true,
  className = '',
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [showMetadata, setShowMetadata] = useState(false);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockHistory: HistoryEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          type: 'created',
          user: {
            id: 'user-1',
            name: 'John Doe',
            avatarUrl: 'https://picsum.photos/seed/john/32/32.jpg',
          },
          details: {
            title: 'Task created',
            description: 'Initial task creation with all details',
          },
          metadata: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456',
          },
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:35:00Z',
          type: 'assigned',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            avatarUrl: 'https://picsum.photos/seed/jane/32/32.jpg',
          },
          details: {
            title: 'Task assigned',
            assignee: 'Alice Johnson',
            oldValue: null,
            newValue: 'Alice Johnson',
          },
        },
        {
          id: '3',
          timestamp: '2024-01-15T11:00:00Z',
          type: 'commented',
          user: {
            id: 'user-3',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
          },
          details: {
            title: 'Comment added',
            comment:
              "I'll start working on this task right away. I think I can complete it by the end of the day.",
          },
        },
        {
          id: '4',
          timestamp: '2024-01-15T11:15:00Z',
          type: 'status_changed',
          user: {
            id: 'user-3',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
          },
          details: {
            title: 'Status changed',
            field: 'status',
            oldValue: 'todo',
            newValue: 'in-progress',
          },
        },
        {
          id: '5',
          timestamp: '2024-01-15T12:00:00Z',
          type: 'attachment_added',
          user: {
            id: 'user-3',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
          },
          details: {
            title: 'Attachment added',
            attachment: 'mockup-design.fig',
            description: 'Added initial design mockup for review',
          },
        },
        {
          id: '6',
          timestamp: '2024-01-15T13:30:00Z',
          type: 'subtask_added',
          user: {
            id: 'user-3',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
          },
          details: {
            title: 'Subtask added',
            subtask: 'Create wireframe components',
            description: 'Added subtask for wireframe creation',
          },
        },
        {
          id: '7',
          timestamp: '2024-01-15T14:00:00Z',
          type: 'time_logged',
          user: {
            id: 'user-3',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
          },
          details: {
            title: 'Time logged',
            timeSpent: 90,
            description: 'Worked on wireframe components',
          },
        },
        {
          id: '8',
          timestamp: '2024-01-15T15:30:00Z',
          type: 'priority_changed',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            avatarUrl: 'https://picsum.photos/seed/jane/32/32.jpg',
          },
          details: {
            title: 'Priority changed',
            field: 'priority',
            oldValue: 'medium',
            newValue: 'high',
            description: 'Increased priority due to client deadline',
          },
        },
        {
          id: '9',
          timestamp: '2024-01-15T16:00:00Z',
          type: 'label_added',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            avatarUrl: 'https://picsum.photos/seed/jane/32/32.jpg',
          },
          details: {
            title: 'Label added',
            label: 'urgent',
            description: 'Added urgent label for priority tracking',
          },
        },
        {
          id: '10',
          timestamp: '2024-01-15T16:30:00Z',
          type: 'dependency_added',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            avatarUrl: 'https://picsum.photos/seed/jane/32/32.jpg',
          },
          details: {
            title: 'Dependency added',
            dependency: 'TASK-123',
            description: 'Added dependency on API integration task',
          },
        },
        {
          id: '11',
          timestamp: '2024-01-15T17:00:00Z',
          type: 'commented',
          user: {
            id: 'user-4',
            name: 'Bob Wilson',
            avatarUrl: 'https://picsum.photos/seed/bob/32/32.jpg',
          },
          details: {
            title: 'Comment added',
            comment:
              "I've reviewed the wireframes and they look good. One suggestion - can we add a loading state component?",
          },
        },
        {
          id: '12',
          timestamp: '2024-01-15T17:30:00Z',
          type: 'subtask_completed',
          user: {
            id: 'user-3',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
          },
          details: {
            title: 'Subtask completed',
            subtask: 'Create wireframe components',
            description: 'Completed wireframe components with feedback incorporated',
          },
        },
      ];

      setHistory(
        mockHistory.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
      setIsLoading(false);
    }, 500);
  }, [taskId]);

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'commented':
        return <MessageSquare className="w-4 h-4" />;
      case 'assigned':
        return <Users className="w-4 h-4" />;
      case 'status_changed':
        return <ArrowRight className="w-4 h-4" />;
      case 'priority_changed':
        return <AlertCircle className="w-4 h-4" />;
      case 'dependency_added':
      case 'dependency_removed':
        return <GitBranch className="w-4 h-4" />;
      case 'attachment_added':
      case 'attachment_removed':
        return <Paperclip className="w-4 h-4" />;
      case 'time_logged':
        return <Clock className="w-4 h-4" />;
      case 'subtask_added':
        return <Plus className="w-4 h-4" />;
      case 'subtask_completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'label_added':
      case 'label_removed':
        return <Tag className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'updated':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'commented':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'assigned':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20';
      case 'status_changed':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'priority_changed':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'dependency_added':
      case 'dependency_removed':
        return 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/20';
      case 'attachment_added':
      case 'attachment_removed':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
      case 'time_logged':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20';
      case 'subtask_added':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'subtask_completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'label_added':
      case 'label_removed':
        return 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
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
      return 'Just now';
    }
  };

  const getDetailedTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const uniqueUsers = Array.from(new Set(history.map(entry => entry.user.id)))
    .map(userId => history.find(entry => entry.user.id === userId)?.user)
    .filter(Boolean);

  const filteredHistory = history.filter(entry => {
    // Search filter
    if (
      searchQuery &&
      !entry.details.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.details.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && entry.type !== filterType) {
      return false;
    }

    // User filter
    if (filterUser !== 'all' && entry.user.id !== filterUser) {
      return false;
    }

    // Date filter
    if (filterDate !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();

      switch (filterDate) {
        case 'today':
          if (entryDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (entryDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (entryDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  const exportHistory = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Type', 'Title', 'Description'].join(','),
      ...filteredHistory.map(entry =>
        [
          entry.timestamp,
          entry.user.name,
          entry.type,
          entry.details.title,
          entry.details.description || '',
        ]
          .map(field => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-${taskId}-history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task History</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete audit log of all changes and activities
            </p>
          </div>

          {showExport && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className={`p-2 rounded-lg transition-colors ${
                  showMetadata
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={exportHistory}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="commented">Comments</option>
              <option value="status_changed">Status Changes</option>
              <option value="assigned">Assignments</option>
              <option value="time_logged">Time Logged</option>
            </select>

            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user!.id} value={user!.id}>
                  {user!.name}
                </option>
              ))}
            </select>

            <select
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterType !== 'all' || filterUser !== 'all' || filterDate !== 'all'
                ? 'No history entries match your filters'
                : 'No history entries yet'}
            </p>
          </div>
        ) : (
          filteredHistory.map(entry => (
            <div
              key={entry.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${getEntryColor(entry.type)}`}
                >
                  {getEntryIcon(entry.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {entry.details.title}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        by {entry.user.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      <button
                        onClick={() => toggleEntryExpansion(entry.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {expandedEntries.has(entry.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {entry.details.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {entry.details.description}
                    </p>
                  )}

                  {expandedEntries.has(entry.id) && (
                    <div className="mt-4 space-y-3">
                      {/* Detailed Changes */}
                      {entry.details.oldValue !== undefined &&
                        entry.details.newValue !== undefined && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {entry.details.field} changed from:
                            </span>
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                              {entry.details.oldValue}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                              {entry.details.newValue}
                            </span>
                          </div>
                        )}

                      {/* Comment content */}
                      {entry.type === 'commented' && entry.details.comment && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {entry.details.comment}
                          </p>
                        </div>
                      )}

                      {/* Time logged */}
                      {entry.type === 'time_logged' && entry.details.timeSpent && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Time logged: {entry.details.timeSpent} minutes
                          </span>
                        </div>
                      )}

                      {/* Metadata */}
                      {showMetadata && entry.metadata && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>IP Address:</span>
                            <span>{entry.metadata.ipAddress}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Session ID:</span>
                            <span>{entry.metadata.sessionId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Detailed Time:</span>
                            <span>{getDetailedTimestamp(entry.timestamp)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredHistory.length} of {history.length} entries
            </span>
            <span>
              Last updated:{' '}
              {getDetailedTimestamp(filteredHistory[0]?.timestamp || new Date().toISOString())}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
