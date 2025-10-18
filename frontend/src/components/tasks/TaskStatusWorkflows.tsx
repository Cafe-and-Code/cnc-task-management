import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Plus,
  Settings,
  Trash2,
  Edit2,
  Save,
  X,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Play,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface WorkflowTransition {
  id: string;
  fromStatus: string;
  toStatus: string;
  name: string;
  description?: string;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  permissions?: string[];
  isRequired?: boolean;
  autoExecute?: boolean;
}

interface WorkflowCondition {
  id: string;
  type: 'field' | 'dependency' | 'approval' | 'custom';
  field?: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty';
  value?: any;
  description: string;
}

interface WorkflowAction {
  id: string;
  type: 'update_field' | 'send_notification' | 'assign_user' | 'create_task' | 'custom';
  field?: string;
  value?: any;
  description: string;
}

interface WorkflowStatus {
  id: string;
  name: string;
  description?: string;
  color: string;
  category: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  isLocked?: boolean;
  order: number;
  transitions?: WorkflowTransition[];
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  statuses: WorkflowStatus[];
  defaultStatusId: string;
  isDefault: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaskStatusWorkflowsProps {
  taskId?: string;
  currentStatus?: string;
  workflowId?: string;
  onStatusChange?: (newStatus: string, transition?: WorkflowTransition) => void;
  className?: string;
}

const TaskStatusWorkflows: React.FC<TaskStatusWorkflowsProps> = ({
  taskId,
  currentStatus = 'todo',
  workflowId = 'default',
  onStatusChange,
  className = '',
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [availableTransitions, setAvailableTransitions] = useState<WorkflowTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransition, setSelectedTransition] = useState<WorkflowTransition | null>(null);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    setTimeout(() => {
      const mockWorkflows: Workflow[] = [
        {
          id: 'default',
          name: 'Standard Task Workflow',
          description: 'Default workflow for most tasks',
          isDefault: true,
          isLocked: false,
          defaultStatusId: 'todo',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statuses: [
            {
              id: 'todo',
              name: 'To Do',
              description: 'Task is ready to be started',
              color: '#6B7280',
              category: 'todo',
              order: 1,
              isLocked: true,
            },
            {
              id: 'in-progress',
              name: 'In Progress',
              description: 'Task is currently being worked on',
              color: '#3B82F6',
              category: 'in_progress',
              order: 2,
            },
            {
              id: 'testing',
              name: 'Testing',
              description: 'Task is being tested',
              color: '#8B5CF6',
              category: 'review',
              order: 3,
            },
            {
              id: 'review',
              name: 'Review',
              description: 'Task is ready for review',
              color: '#F59E0B',
              category: 'review',
              order: 4,
            },
            {
              id: 'done',
              name: 'Done',
              description: 'Task is completed',
              color: '#10B981',
              category: 'done',
              order: 5,
              isLocked: true,
            },
            {
              id: 'blocked',
              name: 'Blocked',
              description: 'Task is blocked',
              color: '#EF4444',
              category: 'blocked',
              order: 6,
            },
          ],
        },
        {
          id: 'bug-fix',
          name: 'Bug Fix Workflow',
          description: 'Specialized workflow for bug fixes',
          isDefault: false,
          isLocked: false,
          defaultStatusId: 'identified',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          statuses: [
            {
              id: 'identified',
              name: 'Identified',
              description: 'Bug has been identified',
              color: '#EF4444',
              category: 'todo',
              order: 1,
            },
            {
              id: 'investigating',
              name: 'Investigating',
              description: 'Investigating the root cause',
              color: '#F59E0B',
              category: 'in_progress',
              order: 2,
            },
            {
              id: 'fixing',
              name: 'Fixing',
              description: 'Developing the fix',
              color: '#3B82F6',
              category: 'in_progress',
              order: 3,
            },
            {
              id: 'testing-fix',
              name: 'Testing Fix',
              description: 'Testing the implemented fix',
              color: '#8B5CF6',
              category: 'review',
              order: 4,
            },
            {
              id: 'deployed',
              name: 'Deployed',
              description: 'Fix has been deployed',
              color: '#10B981',
              category: 'done',
              order: 5,
            },
          ],
        },
      ];

      // Add mock transitions
      const addTransitions = (workflow: Workflow): Workflow => {
        const transitions: WorkflowTransition[] = [
          {
            id: 'start-work',
            name: 'Start Work',
            fromStatus: 'todo',
            toStatus: 'in-progress',
            description: 'Begin working on this task',
            permissions: ['assignee', 'project_lead'],
            actions: [
              {
                id: 'set-start-date',
                type: 'update_field',
                field: 'startDate',
                value: new Date().toISOString(),
                description: 'Set the start date to now',
              },
            ],
          },
          {
            id: 'move-to-testing',
            name: 'Ready for Testing',
            fromStatus: 'in-progress',
            toStatus: 'testing',
            description: 'Mark task as ready for testing',
            permissions: ['assignee'],
            conditions: [
              {
                id: 'completion-check',
                type: 'field',
                field: 'completionPercentage',
                operator: 'greater_than',
                value: 90,
                description: 'Task must be at least 90% complete',
              },
            ],
          },
          {
            id: 'request-review',
            name: 'Request Review',
            fromStatus: 'testing',
            toStatus: 'review',
            description: 'Submit task for review',
            permissions: ['tester', 'assignee'],
            actions: [
              {
                id: 'notify-reviewer',
                type: 'send_notification',
                value: 'Task is ready for review',
                description: 'Notify assigned reviewers',
              },
            ],
          },
          {
            id: 'approve',
            name: 'Approve',
            fromStatus: 'review',
            toStatus: 'done',
            description: 'Approve and complete task',
            permissions: ['reviewer', 'project_lead'],
            conditions: [
              {
                id: 'no-blockers',
                type: 'dependency',
                operator: 'is_empty',
                description: 'No blocking dependencies',
              },
            ],
            actions: [
              {
                id: 'set-completion-date',
                type: 'update_field',
                field: 'completedAt',
                value: new Date().toISOString(),
                description: 'Mark task as completed',
              },
            ],
          },
          {
            id: 'reject',
            name: 'Reject',
            fromStatus: 'review',
            toStatus: 'in-progress',
            description: 'Reject and send back for more work',
            permissions: ['reviewer'],
            actions: [
              {
                id: 'add-comment',
                type: 'custom',
                value: 'Task rejected during review',
                description: 'Add rejection comment',
              },
            ],
          },
          {
            id: 'block',
            name: 'Block',
            fromStatus: 'in-progress',
            toStatus: 'blocked',
            description: 'Block this task',
            permissions: ['assignee', 'project_lead'],
          },
          {
            id: 'unblock',
            name: 'Unblock',
            fromStatus: 'blocked',
            toStatus: 'in-progress',
            description: 'Unblock this task',
            permissions: ['assignee', 'project_lead'],
          },
        ];

        return {
          ...workflow,
          statuses: workflow.statuses.map(status => ({ ...status, transitions })),
        };
      };

      const workflowsWithTransitions = mockWorkflows.map(addTransitions);
      setWorkflows(workflowsWithTransitions);

      const workflow =
        workflowsWithTransitions.find(w => w.id === workflowId) || workflowsWithTransitions[0];
      setCurrentWorkflow(workflow);

      // Calculate available transitions from current status
      const transitions =
        workflow.statuses
          .find(s => s.id === currentStatus)
          ?.transitions?.filter(t => t.fromStatus === currentStatus) || [];

      setAvailableTransitions(transitions);
      setIsLoading(false);
    }, 500);
  }, [workflowId, currentStatus]);

  const handleTransition = (transition: WorkflowTransition) => {
    // Check if user has permission
    if (transition.permissions && transition.permissions.length > 0) {
      // In real implementation, check user permissions
      console.log('Checking permissions:', transition.permissions);
    }

    // Check conditions
    if (transition.conditions && transition.conditions.length > 0) {
      // In real implementation, check conditions
      console.log('Checking conditions:', transition.conditions);
    }

    // Execute transition
    setSelectedTransition(transition);

    // Execute actions
    if (transition.actions) {
      transition.actions.forEach(action => {
        console.log('Executing action:', action);
        // In real implementation, execute actions based on type
      });
    }

    // Notify parent component
    onStatusChange?.(transition.toStatus, transition);
  };

  const getStatusColor = (statusId: string) => {
    return currentWorkflow?.statuses.find(s => s.id === statusId)?.color || '#6B7280';
  };

  const getStatusName = (statusId: string) => {
    return currentWorkflow?.statuses.find(s => s.id === statusId)?.name || statusId;
  };

  const getStatusCategory = (statusId: string) => {
    return currentWorkflow?.statuses.find(s => s.id === statusId)?.category || 'todo';
  };

  const getTransitionIcon = (transition: WorkflowTransition) => {
    const category = getStatusCategory(transition.toStatus);

    switch (category) {
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      case 'blocked':
        return <Ban className="w-4 h-4" />;
      default:
        return <ChevronRight className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Current Status */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getStatusColor(currentStatus) }}
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getStatusName(currentStatus)}
              </h3>
            </div>

            {currentWorkflow && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {currentWorkflow.name}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {currentWorkflow?.statuses.find(s => s.id === currentStatus)?.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {currentWorkflow.statuses.find(s => s.id === currentStatus)?.description}
          </p>
        )}
      </div>

      {/* Available Transitions */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Available Actions
        </h4>

        {availableTransitions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No transitions available from current status
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {availableTransitions.map(transition => (
              <button
                key={transition.id}
                onClick={() => handleTransition(transition)}
                className="flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                    style={{ backgroundColor: getStatusColor(transition.toStatus) }}
                  >
                    {getTransitionIcon(transition)}
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{transition.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transition.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {transition.isRequired && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                      Required
                    </span>
                  )}

                  {transition.autoExecute && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      Auto
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Visualization */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Workflow Progress
        </h4>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {currentWorkflow?.statuses
            .sort((a, b) => a.order - b.order)
            .map((status, index) => (
              <React.Fragment key={status.id}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      status.id === currentStatus
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : getStatusCategory(status.id) === 'done' &&
                            currentWorkflow.statuses.findIndex(s => s.id === currentStatus) > index
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                  </div>

                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {status.name}
                  </span>
                </div>

                {index < currentWorkflow.statuses.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TaskStatusWorkflows;
