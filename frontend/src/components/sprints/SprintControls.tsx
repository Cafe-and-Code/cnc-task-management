import React, { useState } from 'react';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Users,
  Target,
} from 'lucide-react';

// Types
interface Sprint {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  assignedStories: any[];
  team: {
    members: any[];
  };
  goal?: string;
  capacity: number;
}

interface SprintControlsProps {
  sprint: Sprint;
  onStartSprint?: () => Promise<void>;
  onPauseSprint?: () => Promise<void>;
  onCompleteSprint?: (retroData?: any) => Promise<void>;
  onCancelSprint?: (reason: string) => Promise<void>;
  onResumeSprint?: () => Promise<void>;
  onRestartSprint?: () => Promise<void>;
  disabled?: boolean;
  compact?: boolean;
  showLabels?: boolean;
}

export const SprintControls: React.FC<SprintControlsProps> = ({
  sprint,
  onStartSprint,
  onPauseSprint,
  onCompleteSprint,
  onCancelSprint,
  onResumeSprint,
  onRestartSprint,
  disabled = false,
  compact = false,
  showLabels = true,
}) => {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [retroData, setRetroData] = useState({
    whatWentWell: '',
    whatCouldBeBetter: '',
    actionItems: '',
  });

  const canStart = sprint.status === 'planning' && sprint.assignedStories.length > 0;
  const canPause = sprint.status === 'active';
  const canComplete = sprint.status === 'active' || sprint.status === 'paused';
  const canCancel = sprint.status !== 'completed' && sprint.status !== 'cancelled';
  const canResume = sprint.status === 'paused';
  const canRestart = sprint.status === 'completed' || sprint.status === 'cancelled';

  const handleAction = async (action: string, actionFn?: () => Promise<void>) => {
    if (!actionFn || disabled) return;

    setIsActionLoading(action);
    try {
      await actionFn();
    } catch (error) {
      console.error(`Error during ${action}:`, error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!onCancelSprint || !cancelReason.trim()) return;

    setIsActionLoading('cancel');
    try {
      await onCancelSprint(cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling sprint:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (!onCompleteSprint) return;

    setIsActionLoading('complete');
    try {
      await onCompleteSprint(retroData);
      setShowCompleteDialog(false);
      setRetroData({ whatWentWell: '', whatCouldBeBetter: '', actionItems: '' });
    } catch (error) {
      console.error('Error completing sprint:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'start':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'pause':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'complete':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'resume':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'restart':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'start':
        return <Play className="w-4 h-4" />;
      case 'pause':
        return <Pause className="w-4 h-4" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancel':
        return <XCircle className="w-4 h-4" />;
      case 'resume':
        return <Play className="w-4 h-4" />;
      case 'restart':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'start':
        return 'Start Sprint';
      case 'pause':
        return 'Pause Sprint';
      case 'complete':
        return 'Complete Sprint';
      case 'cancel':
        return 'Cancel Sprint';
      case 'resume':
        return 'Resume Sprint';
      case 'restart':
        return 'Restart Sprint';
      default:
        return 'Unknown Action';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'start':
        return 'Begin sprint execution';
      case 'pause':
        return 'Temporarily halt sprint progress';
      case 'complete':
        return 'Mark sprint as finished';
      case 'cancel':
        return 'Cancel sprint and return stories to backlog';
      case 'resume':
        return 'Continue paused sprint';
      case 'restart':
        return 'Restart sprint from planning phase';
      default:
        return 'Execute action';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {canStart && (
          <button
            onClick={() => handleAction('start', onStartSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`p-2 rounded-lg ${getActionColor('start')} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={getActionDescription('start')}
          >
            {getActionIcon('start')}
          </button>
        )}
        {canPause && (
          <button
            onClick={() => handleAction('pause', onPauseSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`p-2 rounded-lg ${getActionColor('pause')} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={getActionDescription('pause')}
          >
            {getActionIcon('pause')}
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => setShowCompleteDialog(true)}
            disabled={disabled || isActionLoading !== null}
            className={`p-2 rounded-lg ${getActionColor('complete')} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={getActionDescription('complete')}
          >
            {getActionIcon('complete')}
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setShowCancelDialog(true)}
            disabled={disabled || isActionLoading !== null}
            className={`p-2 rounded-lg ${getActionColor('cancel')} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={getActionDescription('cancel')}
          >
            {getActionIcon('cancel')}
          </button>
        )}
        {canResume && (
          <button
            onClick={() => handleAction('resume', onResumeSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`p-2 rounded-lg ${getActionColor('resume')} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={getActionDescription('resume')}
          >
            {getActionIcon('resume')}
          </button>
        )}
        {canRestart && (
          <button
            onClick={() => handleAction('restart', onRestartSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`p-2 rounded-lg ${getActionColor('restart')} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={getActionDescription('restart')}
          >
            {getActionIcon('restart')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        {canStart && (
          <button
            onClick={() => handleAction('start', onStartSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${getActionColor('start')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getActionIcon('start')}
            {showLabels && <span className="ml-2">{getActionLabel('start')}</span>}
          </button>
        )}
        {canPause && (
          <button
            onClick={() => handleAction('pause', onPauseSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${getActionColor('pause')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getActionIcon('pause')}
            {showLabels && <span className="ml-2">{getActionLabel('pause')}</span>}
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => setShowCompleteDialog(true)}
            disabled={disabled || isActionLoading !== null}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${getActionColor('complete')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getActionIcon('complete')}
            {showLabels && <span className="ml-2">{getActionLabel('complete')}</span>}
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => setShowCancelDialog(true)}
            disabled={disabled || isActionLoading !== null}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${getActionColor('cancel')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getActionIcon('cancel')}
            {showLabels && <span className="ml-2">{getActionLabel('cancel')}</span>}
          </button>
        )}
        {canResume && (
          <button
            onClick={() => handleAction('resume', onResumeSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${getActionColor('resume')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getActionIcon('resume')}
            {showLabels && <span className="ml-2">{getActionLabel('resume')}</span>}
          </button>
        )}
        {canRestart && (
          <button
            onClick={() => handleAction('restart', onRestartSprint)}
            disabled={disabled || isActionLoading !== null}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${getActionColor('restart')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getActionIcon('restart')}
            {showLabels && <span className="ml-2">{getActionLabel('restart')}</span>}
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isActionLoading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
          <span>
            {isActionLoading.charAt(0).toUpperCase() + isActionLoading.slice(1)}ing sprint...
          </span>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
              onClick={() => setShowCancelDialog(false)}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cancel Sprint
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for cancellation *
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      rows={3}
                      placeholder="Please explain why this sprint is being cancelled..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-400">
                        <p className="font-medium mb-1">Cancellation consequences:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• All assigned stories will return to the backlog</li>
                          <li>• Sprint progress will be lost</li>
                          <li>• Team capacity allocation will be reset</li>
                          <li>• This action will be logged in the sprint history</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCancelDialog(false);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                  >
                    Keep Sprint
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!cancelReason.trim() || isActionLoading === 'cancel'}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Sprint'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
              onClick={() => setShowCompleteDialog(false)}
            />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Complete Sprint
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mark sprint as completed and capture retrospective
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Sprint Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Sprint Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Stories:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {sprint.assignedStories.length} assigned
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Team:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {sprint.team.members.length} members
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {sprint.capacity} points
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Goal:</span>
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {sprint.goal || 'No goal set'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retrospective Questions */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Quick Retrospective
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        What went well during this sprint?
                      </label>
                      <textarea
                        value={retroData.whatWentWell}
                        onChange={e =>
                          setRetroData(prev => ({ ...prev, whatWentWell: e.target.value }))
                        }
                        rows={3}
                        placeholder="Share successes and positive experiences..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        What could be improved?
                      </label>
                      <textarea
                        value={retroData.whatCouldBeBetter}
                        onChange={e =>
                          setRetroData(prev => ({ ...prev, whatCouldBeBetter: e.target.value }))
                        }
                        rows={3}
                        placeholder="Identify challenges and areas for improvement..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Action items for next sprint
                      </label>
                      <textarea
                        value={retroData.actionItems}
                        onChange={e =>
                          setRetroData(prev => ({ ...prev, actionItems: e.target.value }))
                        }
                        rows={3}
                        placeholder="List concrete actions to implement improvements..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCompleteDialog(false);
                      setRetroData({ whatWentWell: '', whatCouldBeBetter: '', actionItems: '' });
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={isActionLoading === 'complete'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActionLoading === 'complete' ? 'Completing...' : 'Complete Sprint'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for sprint status badge with controls
export const SprintStatusWithControls: React.FC<SprintControlsProps & { showStatus?: boolean }> = ({
  sprint,
  showStatus = true,
  ...props
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Calendar className="w-4 h-4" />;
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {showStatus && (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sprint.status)}`}
        >
          {getStatusIcon(sprint.status)}
          <span className="ml-1">{sprint.status}</span>
        </div>
      )}
      <SprintControls {...props} sprint={sprint} compact={true} />
    </div>
  );
};
