import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Filter,
  Search,
  User,
  FileText,
  Settings,
  LogIn,
  LogOut,
  AlertTriangle,
  ChevronDown,
  Eye,
  Download,
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type:
    | 'login'
    | 'logout'
    | 'project_created'
    | 'project_updated'
    | 'task_assigned'
    | 'task_completed'
    | 'file_uploaded'
    | 'file_downloaded'
    | 'settings_changed'
    | 'error'
    | 'warning';
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: {
    projectId?: string;
    projectName?: string;
    taskId?: string;
    taskTitle?: string;
    fileName?: string;
    settingChanged?: string;
    oldValue?: string;
    newValue?: string;
    errorMessage?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ActivityFilters {
  search: string;
  userId: string;
  type: string;
  severity: string;
  dateRange: string;
  startDate: string;
  endDate: string;
}

interface UserActivityMonitorProps {
  userId?: string;
  showFilters?: boolean;
  limit?: number;
}

const UserActivityMonitor: React.FC<UserActivityMonitorProps> = ({
  userId,
  showFilters = true,
  limit,
}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    userId: userId || '',
    type: '',
    severity: '',
    dateRange: '7',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);

  const activitiesPerPage = 20;

  // Mock data generation
  useEffect(() => {
    const generateMockActivities = (): ActivityEvent[] => {
      const types: ActivityEvent['type'][] = [
        'login',
        'logout',
        'project_created',
        'project_updated',
        'task_assigned',
        'task_completed',
        'file_uploaded',
        'file_downloaded',
        'settings_changed',
        'error',
        'warning',
      ];

      const severities: ActivityEvent['severity'][] = ['low', 'medium', 'high', 'critical'];

      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john.doe@company.com' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com' },
        { id: '3', name: 'Mike Wilson', email: 'mike.wilson@company.com' },
      ];

      const descriptions: Record<ActivityEvent['type'], string[]> = {
        login: [
          'User logged in successfully',
          'User logged in from new device',
          'User logged in after password reset',
        ],
        logout: ['User logged out', 'User session expired', 'User logged out due to inactivity'],
        project_created: [
          'Created new project',
          'Cloned project from template',
          'Imported project from external source',
        ],
        project_updated: [
          'Updated project settings',
          'Changed project deadline',
          'Modified project team',
        ],
        task_assigned: [
          'Task assigned to user',
          'Task reassigned to different user',
          'Bulk task assignment completed',
        ],
        task_completed: [
          'Task marked as completed',
          'Task completed with notes',
          'Task automatically completed',
        ],
        file_uploaded: [
          'Uploaded design file',
          'Uploaded project document',
          'Bulk file upload completed',
        ],
        file_downloaded: ['Downloaded project files', 'Exported project data', 'Downloaded report'],
        settings_changed: [
          'Updated profile information',
          'Changed notification preferences',
          'Modified security settings',
        ],
        error: ['Failed to save project', 'Authentication error occurred', 'File upload failed'],
        warning: [
          'Approaching storage limit',
          'Password expires soon',
          'Unusual login pattern detected',
        ],
      };

      return Array.from({ length: limit || 200 }, (_, i) => {
        const type = types[Math.floor(Math.random() * types.length)];
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const timestamp = new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        return {
          id: `activity-${i + 1}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          type,
          description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
          timestamp,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity,
          details:
            type === 'project_created' || type === 'project_updated'
              ? {
                  projectId: `proj-${Math.floor(Math.random() * 100)}`,
                  projectName: `Project ${Math.floor(Math.random() * 100)}`,
                }
              : type === 'task_assigned' || type === 'task_completed'
                ? {
                    taskId: `task-${Math.floor(Math.random() * 1000)}`,
                    taskTitle: `Task ${Math.floor(Math.random() * 1000)}`,
                  }
                : type === 'file_uploaded' || type === 'file_downloaded'
                  ? {
                      fileName: `document_${Math.floor(Math.random() * 100)}.pdf`,
                    }
                  : type === 'settings_changed'
                    ? {
                        settingChanged: 'Email Notification Preferences',
                        oldValue: 'All notifications',
                        newValue: 'Important only',
                      }
                    : type === 'error'
                      ? {
                          errorMessage: 'Database connection timeout',
                        }
                      : undefined,
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    const mockActivities = generateMockActivities();
    setActivities(mockActivities);
    setTotalPages(Math.ceil(mockActivities.length / activitiesPerPage));
    setLoading(false);
  }, [limit]);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (userId && activity.userId !== userId) return false;

    const matchesSearch =
      !filters.search ||
      activity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.userEmail.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = !filters.type || activity.type === filters.type;
    const matchesSeverity = !filters.severity || activity.severity === filters.severity;

    const matchesDateRange = () => {
      if (!filters.dateRange && !filters.startDate && !filters.endDate) return true;

      const activityDate = new Date(activity.timestamp);
      const now = new Date();

      if (filters.dateRange) {
        const days = parseInt(filters.dateRange);
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return activityDate >= startDate;
      }

      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return activityDate >= startDate && activityDate <= endDate;
      }

      return true;
    };

    return matchesSearch && matchesType && matchesSeverity && matchesDateRange();
  });

  // Pagination
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * activitiesPerPage,
    currentPage * activitiesPerPage
  );

  const getActivityIcon = (type: ActivityEvent['type']) => {
    const icons = {
      login: <LogIn className="w-4 h-4" />,
      logout: <LogOut className="w-4 h-4" />,
      project_created: <FileText className="w-4 h-4" />,
      project_updated: <FileText className="w-4 h-4" />,
      task_assigned: <User className="w-4 h-4" />,
      task_completed: <User className="w-4 h-4" />,
      file_uploaded: <FileText className="w-4 h-4" />,
      file_downloaded: <FileText className="w-4 h-4" />,
      settings_changed: <Settings className="w-4 h-4" />,
      error: <AlertTriangle className="w-4 h-4" />,
      warning: <AlertTriangle className="w-4 h-4" />,
    };
    return icons[type] || <Activity className="w-4 h-4" />;
  };

  const getActivityColor = (type: ActivityEvent['type']) => {
    const colors = {
      login: 'text-green-600 bg-green-100',
      logout: 'text-gray-600 bg-gray-100',
      project_created: 'text-blue-600 bg-blue-100',
      project_updated: 'text-blue-600 bg-blue-100',
      task_assigned: 'text-purple-600 bg-purple-100',
      task_completed: 'text-green-600 bg-green-100',
      file_uploaded: 'text-yellow-600 bg-yellow-100',
      file_downloaded: 'text-yellow-600 bg-yellow-100',
      settings_changed: 'text-indigo-600 bg-indigo-100',
      error: 'text-red-600 bg-red-100',
      warning: 'text-orange-600 bg-orange-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getSeverityColor = (severity: ActivityEvent['severity']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // Export functionality
    console.log(`Exporting activities as ${format}`);
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity Monitor</h3>
          <p className="text-sm text-gray-600">
            {userId ? 'User activity history' : 'System-wide activity monitoring'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Filters</h4>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  userId: userId || '',
                  type: '',
                  severity: '',
                  dateRange: '7',
                  startDate: '',
                  endDate: '',
                })
              }
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.type}
                onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="project_created">Project Created</option>
                <option value="project_updated">Project Updated</option>
                <option value="task_assigned">Task Assigned</option>
                <option value="task_completed">Task Completed</option>
                <option value="file_uploaded">File Uploaded</option>
                <option value="file_downloaded">File Downloaded</option>
                <option value="settings_changed">Settings Changed</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.severity}
                onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateRange}
                onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="">Custom range</option>
              </select>
            </div>
          </div>

          {filters.dateRange === '' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.startDate}
                  onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.endDate}
                  onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedActivities.map(activity => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div>{formatTimestamp(activity.timestamp)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                      <div className="text-xs text-gray-500">{activity.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}
                    >
                      {getActivityIcon(activity.type)}
                      <span className="ml-1">
                        {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{activity.description}</div>
                    {activity.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.details.projectName && `Project: ${activity.details.projectName}`}
                        {activity.details.taskTitle && `Task: ${activity.details.taskTitle}`}
                        {activity.details.fileName && `File: ${activity.details.fileName}`}
                        {activity.details.settingChanged &&
                          `Setting: ${activity.details.settingChanged}`}
                        {activity.details.errorMessage && `Error: ${activity.details.errorMessage}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(activity.severity)}`}
                    >
                      {activity.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedActivity(activity);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * activitiesPerPage + 1} to{' '}
              {Math.min(currentPage * activitiesPerPage, filteredActivities.length)} of{' '}
              {filteredActivities.length} activities
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Activity Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">Timestamp:</dt>
                      <dd className="text-gray-900">
                        {new Date(selectedActivity.timestamp).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">User:</dt>
                      <dd className="text-gray-900">
                        {selectedActivity.userName} ({selectedActivity.userEmail})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Activity Type:</dt>
                      <dd className="text-gray-900">{selectedActivity.type.replace(/_/g, ' ')}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Severity:</dt>
                      <dd className="text-gray-900">{selectedActivity.severity.toUpperCase()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-700">{selectedActivity.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">IP Address:</dt>
                      <dd className="text-gray-900">{selectedActivity.ipAddress}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">User Agent:</dt>
                      <dd className="text-gray-900 break-all">{selectedActivity.userAgent}</dd>
                    </div>
                  </dl>
                </div>

                {selectedActivity.details && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                    <dl className="text-sm space-y-2">
                      {Object.entries(selectedActivity.details).map(([key, value]) => (
                        <div key={key} className="flex">
                          <dt className="text-gray-600 w-32 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </dt>
                          <dd className="text-gray-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Export Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="format" value="csv" className="mr-2" />
                      <span className="text-sm">CSV (Comma Separated Values)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="json" className="mr-2" />
                      <span className="text-sm">JSON (JavaScript Object Notation)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" value="pdf" className="mr-2" />
                      <span className="text-sm">PDF (Portable Document Format)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Include all filtered activities</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Include technical details</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Compress file (ZIP)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityMonitor;
