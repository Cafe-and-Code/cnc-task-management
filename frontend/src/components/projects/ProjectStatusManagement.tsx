import React, { useState, useEffect } from 'react';
import { ProjectStatus } from '@types/index';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface StatusTransition {
  from: ProjectStatus;
  to: ProjectStatus;
  allowed: boolean;
  reason?: string;
}

interface StatusHistoryItem {
  id: string;
  from: ProjectStatus;
  to: ProjectStatus;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  changedAt: string;
  reason: string;
  comment?: string;
}

interface ProjectStatusManagementProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusChange?: (newStatus: ProjectStatus, reason: string) => Promise<void>;
  readOnly?: boolean;
}

const statusOptions = [
  {
    value: ProjectStatus.Active,
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: '🟢',
    description: 'Project is actively being worked on',
  },
  {
    value: ProjectStatus.OnHold,
    label: 'On Hold',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: '⏸️',
    description: 'Project is temporarily paused',
  },
  {
    value: ProjectStatus.Completed,
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: '✅',
    description: 'Project has been successfully completed',
  },
  {
    value: ProjectStatus.Archived,
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: '📁',
    description: 'Project is archived and read-only',
  },
];

const statusTransitions: { [key in ProjectStatus]: ProjectStatus[] } = {
  [ProjectStatus.Active]: [ProjectStatus.OnHold, ProjectStatus.Completed, ProjectStatus.Archived],
  [ProjectStatus.OnHold]: [ProjectStatus.Active, ProjectStatus.Archived],
  [ProjectStatus.Completed]: [ProjectStatus.Archived],
  [ProjectStatus.Archived]: [ProjectStatus.Active], // Allow reactivation
};

export const ProjectStatusManagement: React.FC<ProjectStatusManagementProps> = ({
  projectId,
  currentStatus,
  onStatusChange,
  readOnly = false,
}) => {
  const { isManagement, isAdmin } = useRolePermission();

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);

  useEffect(() => {
    const loadStatusHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock status history data - in real implementation, this would come from API
        const mockHistory: StatusHistoryItem[] = [
          {
            id: '1',
            from: ProjectStatus.Active,
            to: ProjectStatus.Active,
            changedBy: {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            changedAt: '2024-01-15T10:00:00Z',
            reason: 'Project initialized',
            comment: 'Initial project setup and team formation completed',
          },
          {
            id: '2',
            from: ProjectStatus.Active,
            to: ProjectStatus.OnHold,
            changedBy: {
              id: '2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
            },
            changedAt: '2024-01-20T14:30:00Z',
            reason: 'Resource constraints',
            comment: 'Waiting for additional team members to be allocated',
          },
          {
            id: '3',
            from: ProjectStatus.OnHold,
            to: ProjectStatus.Active,
            changedBy: {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
            },
            changedAt: '2024-01-25T09:15:00Z',
            reason: 'Resources available',
            comment: 'Team has been allocated and we can proceed with development',
          },
        ];

        setStatusHistory(mockHistory);
      } catch (error: any) {
        console.error('Failed to load status history:', error);
        setError(error.message || 'Failed to load status history');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatusHistory();
  }, [projectId]);

  const canChangeStatus = () => {
    return !readOnly && (isManagement || isAdmin);
  };

  const getAllowedStatusTransitions = (): ProjectStatus[] => {
    if (!canChangeStatus()) return [];
    return statusTransitions[currentStatus] || [];
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(status => status.value === currentStatus);
  };

  const getTransitionAllowedReason = (newStatus: ProjectStatus): string => {
    const transition = statusTransitions[currentStatus]?.find(status => status === newStatus);
    if (transition) return '';

    if (currentStatus === newStatus) {
      return 'Project is already in this status';
    }

    return 'This status transition is not allowed from the current status';
  };

  const handleStatusChangeClick = (status: ProjectStatus) => {
    if (!canChangeStatus()) return;

    const reason = getTransitionAllowedReason(status);
    if (reason) {
      setError(reason);
      return;
    }

    setSelectedStatus(status);
    setStatusReason('');
    setStatusComment('');
    setShowStatusModal(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (!selectedStatus || !statusReason.trim()) {
      setError('Please provide a reason for the status change');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      await onStatusChange?.(selectedStatus, statusReason.trim());

      // Add new status change to history
      const newHistoryItem: StatusHistoryItem = {
        id: `history-${Date.now()}`,
        from: currentStatus,
        to: selectedStatus,
        changedBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'current.user@example.com',
        },
        changedAt: new Date().toISOString(),
        reason: statusReason.trim(),
        comment: statusComment.trim() || undefined,
      };

      setStatusHistory(prev => [newHistoryItem, ...prev]);
      setShowStatusModal(false);
      setSelectedStatus(null);
      setStatusReason('');
      setStatusComment('');
    } catch (error: any) {
      console.error('Failed to change status:', error);
      setError(error.message || 'Failed to change status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const currentStatusInfo = getCurrentStatusInfo();
  const allowedTransitions = getAllowedStatusTransitions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
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
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Status</h3>

        {currentStatusInfo && (
          <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{currentStatusInfo.icon}</div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentStatusInfo.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStatusInfo.description}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.color}`}
            >
              {currentStatusInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Status Transitions */}
      {canChangeStatus() && allowedTransitions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allowedTransitions.map(status => {
              const statusInfo = statusOptions.find(s => s.value === status);
              if (!statusInfo) return null;

              return (
                <button
                  key={status}
                  onClick={() => handleStatusChangeClick(status)}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow text-left"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl">{statusInfo.icon}</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {statusInfo.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status History</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {statusHistory.length} changes
          </span>
        </div>

        {statusHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-sm">No status changes yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statusHistory.map(item => {
              const fromStatus = statusOptions.find(s => s.value === item.from);
              const toStatus = statusOptions.find(s => s.value === item.to);

              return (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {fromStatus && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${fromStatus.color}`}
                          >
                            {fromStatus.icon} {fromStatus.label}
                          </span>
                        )}
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        {toStatus && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${toStatus.color}`}
                          >
                            {toStatus.icon} {toStatus.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(item.changedAt)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Changed by {item.changedBy.name}</span>
                        <span>•</span>
                        <span>{formatDate(item.changedAt)}</span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Reason:</span> {item.reason}
                      </div>
                      {item.comment && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                          "{item.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedStatus && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowStatusModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-3">
                    {statusOptions.find(s => s.value === currentStatus) && (
                      <span className="text-2xl">
                        {statusOptions.find(s => s.value === currentStatus)?.icon}
                      </span>
                    )}
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
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    {statusOptions.find(s => s.value === selectedStatus) && (
                      <span className="text-2xl">
                        {statusOptions.find(s => s.value === selectedStatus)?.icon}
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Change Status to {statusOptions.find(s => s.value === selectedStatus)?.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please provide a reason for this status change
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reason *
                    </label>
                    <input
                      type="text"
                      value={statusReason}
                      onChange={e => setStatusReason(e.target.value)}
                      placeholder="e.g., Project completed successfully"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Comments
                    </label>
                    <textarea
                      rows={3}
                      value={statusComment}
                      onChange={e => setStatusComment(e.target.value)}
                      placeholder="Optional additional context..."
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleStatusChangeConfirm}
                  disabled={isUpdating || !statusReason.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Changing Status...</span>
                    </>
                  ) : (
                    'Change Status'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus(null);
                    setStatusReason('');
                    setStatusComment('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
