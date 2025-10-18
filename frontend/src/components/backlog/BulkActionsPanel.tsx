import React, { useState } from 'react';
import { X, Users, Tag, Calendar, Archive, Trash2, Copy, Move, AlertTriangle } from 'lucide-react';

// Types
interface UserStory {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_sprint' | 'completed' | 'in_progress' | 'testing' | 'blocked';
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels: string[];
  storyPoints: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Epic {
  id: string;
  name: string;
  color: string;
}

interface Sprint {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'completed';
  capacity: number;
}

interface BulkActionsPanelProps {
  selectedStories: UserStory[];
  teamMembers: TeamMember[];
  epics: Epic[];
  sprints: Sprint[];
  onClose: () => void;
  onBulkAction: (action: string, data: any) => void;
}

type BulkAction =
  | 'assign'
  | 'status'
  | 'priority'
  | 'labels'
  | 'epic'
  | 'sprint'
  | 'delete'
  | 'archive'
  | 'duplicate';

export const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  selectedStories,
  teamMembers,
  epics,
  sprints,
  onClose,
  onBulkAction,
}) => {
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [actionData, setActionData] = useState<any>({});

  const handleActionSelect = (action: BulkAction) => {
    setSelectedAction(action);
    setActionData({});
  };

  const handleExecuteAction = () => {
    if (selectedAction && actionData) {
      onBulkAction(selectedAction, actionData);
      onClose();
    }
  };

  const getActionIcon = (action: BulkAction) => {
    switch (action) {
      case 'assign':
        return <Users className="w-4 h-4" />;
      case 'status':
        return <Calendar className="w-4 h-4" />;
      case 'priority':
        return <AlertTriangle className="w-4 h-4" />;
      case 'labels':
        return <Tag className="w-4 h-4" />;
      case 'epic':
        return <Archive className="w-4 h-4" />;
      case 'sprint':
        return <Move className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'archive':
        return <Archive className="w-4 h-4" />;
      case 'duplicate':
        return <Copy className="w-4 h-4" />;
    }
  };

  const getActionTitle = (action: BulkAction) => {
    switch (action) {
      case 'assign':
        return 'Assign to Team Member';
      case 'status':
        return 'Change Status';
      case 'priority':
        return 'Update Priority';
      case 'labels':
        return 'Manage Labels';
      case 'epic':
        return 'Move to Epic';
      case 'sprint':
        return 'Assign to Sprint';
      case 'delete':
        return 'Delete Stories';
      case 'archive':
        return 'Archive Stories';
      case 'duplicate':
        return 'Duplicate Stories';
    }
  };

  const getActionDescription = (action: BulkAction) => {
    switch (action) {
      case 'assign':
        return 'Assign selected stories to a team member';
      case 'status':
        return 'Change the status of selected stories';
      case 'priority':
        return 'Update priority for selected stories';
      case 'labels':
        return 'Add or remove labels from selected stories';
      case 'epic':
        return 'Move selected stories to a different epic';
      case 'sprint':
        return 'Assign selected stories to a sprint';
      case 'delete':
        return 'Permanently delete selected stories';
      case 'archive':
        return 'Archive selected stories';
      case 'duplicate':
        return 'Create copies of selected stories';
    }
  };

  const renderActionContent = () => {
    if (!selectedAction) return null;

    switch (selectedAction) {
      case 'assign':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign to
              </label>
              <select
                value={actionData.assigneeId || ''}
                onChange={e => setActionData({ assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select team member...</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reassign-current"
                checked={actionData.reassignCurrent || false}
                onChange={e =>
                  setActionData(prev => ({ ...prev, reassignCurrent: e.target.checked }))
                }
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <label
                htmlFor="reassign-current"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Reassign stories that already have an assignee
              </label>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Status
              </label>
              <select
                value={actionData.status || ''}
                onChange={e => setActionData({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select status...</option>
                <option value="backlog">Backlog</option>
                <option value="in_sprint">In Sprint</option>
                <option value="in_progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        );

      case 'priority':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Priority
              </label>
              <select
                value={actionData.priority || ''}
                onChange={e => setActionData({ priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select priority...</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        );

      case 'labels':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Labels to Add
              </label>
              <input
                type="text"
                value={actionData.labelsToAdd || ''}
                onChange={e => setActionData(prev => ({ ...prev, labelsToAdd: e.target.value }))}
                placeholder="Enter labels separated by commas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Labels to Remove
              </label>
              <input
                type="text"
                value={actionData.labelsToRemove || ''}
                onChange={e => setActionData(prev => ({ ...prev, labelsToRemove: e.target.value }))}
                placeholder="Enter labels separated by commas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );

      case 'epic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Epic
              </label>
              <select
                value={actionData.epicId || ''}
                onChange={e => setActionData({ epicId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select epic...</option>
                <option value="">Remove from epic</option>
                {epics.map(epic => (
                  <option key={epic.id} value={epic.id}>
                    {epic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'sprint':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Sprint
              </label>
              <select
                value={actionData.sprintId || ''}
                onChange={e => setActionData({ sprintId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select sprint...</option>
                <option value="">Remove from sprint</option>
                {sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.capacity} pts) - {sprint.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  This action cannot be undone
                </h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-500 mt-2">
                Deleting {selectedStories.length} story(ies) will permanently remove them from the
                system.
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirm-delete"
                checked={actionData.confirmed || false}
                onChange={e => setActionData({ confirmed: e.target.checked })}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label
                htmlFor="confirm-delete"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                I understand this action cannot be undone
              </label>
            </div>
          </div>
        );

      case 'archive':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Archive className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Archive stories
                </h3>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-2">
                Archiving will hide these stories from the active backlog but preserve them for
                future reference.
              </p>
            </div>
          </div>
        );

      case 'duplicate':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Duplicate stories
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-500 mt-2">
                This will create copies of the selected {selectedStories.length} story(ies).
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="copy-assignee"
                checked={actionData.copyAssignee !== false}
                onChange={e => setActionData(prev => ({ ...prev, copyAssignee: e.target.checked }))}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <label
                htmlFor="copy-assignee"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Copy assignee information
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="copy-labels"
                checked={actionData.copyLabels !== false}
                onChange={e => setActionData(prev => ({ ...prev, copyLabels: e.target.checked }))}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <label
                htmlFor="copy-labels"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Copy labels and other metadata
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isActionExecutable = () => {
    if (!selectedAction) return false;

    switch (selectedAction) {
      case 'assign':
        return !!actionData.assigneeId;
      case 'status':
        return !!actionData.status;
      case 'priority':
        return !!actionData.priority;
      case 'labels':
        return !!(actionData.labelsToAdd || actionData.labelsToRemove);
      case 'epic':
        return actionData.epicId !== undefined;
      case 'sprint':
        return actionData.sprintId !== undefined;
      case 'delete':
        return actionData.confirmed;
      case 'archive':
      case 'duplicate':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bulk Actions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedStories.length} stories selected
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Action Selection */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Select Action
              </h3>
              <div className="space-y-2">
                {(
                  [
                    'assign',
                    'status',
                    'priority',
                    'labels',
                    'epic',
                    'sprint',
                    'archive',
                    'duplicate',
                    'delete',
                  ] as BulkAction[]
                ).map(action => (
                  <button
                    key={action}
                    onClick={() => handleActionSelect(action)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAction === action
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getActionIcon(action)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getActionTitle(action)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getActionDescription(action)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Configuration */}
            <div className="flex-1 p-6">
              {selectedAction ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      {getActionIcon(selectedAction)}
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {getActionTitle(selectedAction)}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getActionDescription(selectedAction)}
                    </p>
                  </div>

                  {renderActionContent()}

                  {/* Affected Stories Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Affected Stories ({selectedStories.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {selectedStories.slice(0, 5).map(story => (
                        <div
                          key={story.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                        >
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {story.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {story.storyPoints} pts
                          </span>
                        </div>
                      ))}
                      {selectedStories.length > 5 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                          ... and {selectedStories.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteAction}
                      disabled={!isActionExecutable()}
                      className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Execute Action
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Copy className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select an action
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Choose an action from the left panel to configure and execute
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
