import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Copy,
  Download,
  Upload,
  RefreshCw,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings,
  Play,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

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

interface WorkflowManagerProps {
  onWorkflowChange?: (workflow: Workflow) => void;
  className?: string;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({ onWorkflowChange, className = '' }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStatus, setEditingStatus] = useState<WorkflowStatus | null>(null);
  const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
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
              id: 'done',
              name: 'Done',
              description: 'Task is completed',
              color: '#10B981',
              category: 'done',
              order: 3,
              isLocked: true,
            },
          ],
        },
      ];
      setWorkflows(mockWorkflows);
      setSelectedWorkflow(mockWorkflows[0]);
      setIsLoading(false);
    }, 500);
  }, []);

  const createWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: '',
      statuses: [
        {
          id: 'status-1',
          name: 'To Do',
          description: 'Starting point',
          color: '#6B7280',
          category: 'todo',
          order: 1,
        },
        {
          id: 'status-2',
          name: 'Done',
          description: 'Completion point',
          color: '#10B981',
          category: 'done',
          order: 2,
        },
      ],
      defaultStatusId: 'status-1',
      isDefault: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWorkflows([...workflows, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setIsCreating(false);
  };

  const updateWorkflow = (updatedWorkflow: Workflow) => {
    setWorkflows(workflows.map(w => (w.id === updatedWorkflow.id ? updatedWorkflow : w)));
    setSelectedWorkflow(updatedWorkflow);
    onWorkflowChange?.(updatedWorkflow);
  };

  const deleteWorkflow = (workflowId: string) => {
    if (workflows.find(w => w.id === workflowId)?.isDefault) {
      alert('Cannot delete the default workflow');
      return;
    }
    setWorkflows(workflows.filter(w => w.id !== workflowId));
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null);
    }
  };

  const duplicateWorkflow = (workflow: Workflow) => {
    const duplicated: Workflow = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkflows([...workflows, duplicated]);
  };

  const addStatus = () => {
    if (!selectedWorkflow) return;

    const newStatus: WorkflowStatus = {
      id: `status-${Date.now()}`,
      name: 'New Status',
      description: '',
      color: '#6B7280',
      category: 'todo',
      order: selectedWorkflow.statuses.length + 1,
    };

    updateWorkflow({
      ...selectedWorkflow,
      statuses: [...selectedWorkflow.statuses, newStatus],
    });
  };

  const updateStatus = (updatedStatus: WorkflowStatus) => {
    if (!selectedWorkflow) return;

    updateWorkflow({
      ...selectedWorkflow,
      statuses: selectedWorkflow.statuses.map(s => (s.id === updatedStatus.id ? updatedStatus : s)),
    });
    setEditingStatus(null);
  };

  const deleteStatus = (statusId: string) => {
    if (!selectedWorkflow) return;

    const status = selectedWorkflow.statuses.find(s => s.id === statusId);
    if (status?.isLocked) {
      alert('Cannot delete a locked status');
      return;
    }

    updateWorkflow({
      ...selectedWorkflow,
      statuses: selectedWorkflow.statuses.filter(s => s.id !== statusId),
    });
  };

  const addTransition = (fromStatusId: string, toStatusId: string) => {
    if (!selectedWorkflow) return;

    const newTransition: WorkflowTransition = {
      id: `transition-${Date.now()}`,
      fromStatus: fromStatusId,
      toStatus: toStatusId,
      name: `${selectedWorkflow.statuses.find(s => s.id === fromStatusId)?.name} → ${selectedWorkflow.statuses.find(s => s.id === toStatusId)?.name}`,
      description: '',
      permissions: [],
    };

    updateWorkflow({
      ...selectedWorkflow,
      statuses: selectedWorkflow.statuses.map(status =>
        status.id === fromStatusId
          ? { ...status, transitions: [...(status.transitions || []), newTransition] }
          : status
      ),
    });
  };

  const exportWorkflow = (workflow: Workflow) => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusCategoryIcon = (category: string) => {
    switch (category) {
      case 'todo':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      case 'blocked':
        return <Ban className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workflow Manager</h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Workflow List */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Workflows</h3>

          <div className="space-y-2">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                    {workflow.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {workflow.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      {workflow.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          Default
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        {workflow.statuses.length} statuses
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        duplicateWorkflow(workflow);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        exportWorkflow(workflow);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {!workflow.isDefault && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteWorkflow(workflow.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Editor */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedWorkflow.name}
                  </h3>
                  {selectedWorkflow.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedWorkflow.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={addStatus}
                    className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Status
                  </button>
                </div>
              </div>

              {/* Workflow Visualization */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {selectedWorkflow.statuses
                      .sort((a, b) => a.order - b.order)
                      .map((status, index) => (
                        <React.Fragment key={status.id}>
                          <div className="flex flex-col items-center">
                            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 min-w-[120px]">
                              <div className="flex items-center justify-between w-full mb-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusCategoryIcon(status.category)}
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: status.color }}
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => setEditingStatus(status)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  {!status.isLocked && (
                                    <button
                                      onClick={() => deleteStatus(status.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <h5 className="font-medium text-gray-900 dark:text-white text-sm text-center">
                                {status.name}
                              </h5>

                              {status.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                                  {status.description}
                                </p>
                              )}

                              {status.isLocked && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded mt-2">
                                  Locked
                                </span>
                              )}
                            </div>

                            {selectedWorkflow.defaultStatusId === status.id && (
                              <span className="mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                Default
                              </span>
                            )}
                          </div>

                          {index < selectedWorkflow.statuses.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              </div>

              {/* Status List */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Status Details
                </h4>

                <div className="space-y-3">
                  {selectedWorkflow.statuses
                    .sort((a, b) => a.order - b.order)
                    .map(status => (
                      <div
                        key={status.id}
                        className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              {getStatusCategoryIcon(status.category)}
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {status.name}
                              </h5>
                              {status.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {status.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                              {status.category}
                            </span>
                            {status.isLocked && (
                              <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a workflow to edit or create a new one
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Edit Modal */}
      {editingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Status</h3>
              <button
                onClick={() => setEditingStatus(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingStatus.name}
                  onChange={e => setEditingStatus({ ...editingStatus, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingStatus.description || ''}
                  onChange={e =>
                    setEditingStatus({ ...editingStatus, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={editingStatus.category}
                  onChange={e =>
                    setEditingStatus({ ...editingStatus, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={editingStatus.color}
                  onChange={e => setEditingStatus({ ...editingStatus, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateStatus(editingStatus)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingStatus(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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

export default WorkflowManager;
