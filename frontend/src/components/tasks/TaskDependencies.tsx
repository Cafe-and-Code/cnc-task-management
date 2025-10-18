import React, { useState, useEffect } from 'react';
import {
  Link2,
  Unlink,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  GitBranch,
  Network,
  Info,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'testing' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'task' | 'bug' | 'feature' | 'improvement';
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  projectId: string;
  projectKey: string;
  storyPoints: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Dependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'blocks' | 'depends_on';
  description?: string;
  createdAt: string;
  createdBy: string;
}

interface TaskDependenciesProps {
  taskId: string;
  availableTasks: Task[];
  currentDependencies: Dependency[];
  onAddDependency: (
    predecessorId: string,
    successorId: string,
    type: 'blocks' | 'depends_on',
    description?: string
  ) => void;
  onRemoveDependency: (dependencyId: string) => void;
  onUpdateDependency: (dependencyId: string, updates: Partial<Dependency>) => void;
  className?: string;
}

export const TaskDependencies: React.FC<TaskDependenciesProps> = ({
  taskId,
  availableTasks,
  currentDependencies,
  onAddDependency,
  onRemoveDependency,
  onUpdateDependency,
  className = '',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [dependencyType, setDependencyType] = useState<'blocks' | 'depends_on'>('depends_on');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dependencyDetails, setDependencyDetails] = useState<string | null>(null);

  // Get tasks that can be dependencies
  const getDependentTasks = (type: 'blocks' | 'depends_on') => {
    if (type === 'blocks') {
      // Tasks that this task blocks (successors)
      return currentDependencies
        .filter(dep => dep.predecessorId === taskId && dep.type === 'blocks')
        .map(dep => availableTasks.find(task => task.id === dep.successorId))
        .filter(Boolean) as Task[];
    } else {
      // Tasks that this task depends on (predecessors)
      return currentDependencies
        .filter(dep => dep.successorId === taskId && dep.type === 'depends_on')
        .map(dep => availableTasks.find(task => task.id === dep.predecessorId))
        .filter(Boolean) as Task[];
    }
  };

  // Get potential tasks for new dependencies
  const getAvailableTasksForDependency = (type: 'blocks' | 'depends_on') => {
    const currentTaskIds = currentDependencies.map(dep =>
      type === 'blocks' ? dep.successorId : dep.predecessorId
    );

    return availableTasks
      .filter(task => task.id !== taskId) // Exclude current task
      .filter(task => !currentTaskIds.includes(task.id)) // Exclude existing dependencies
      .filter(task => {
        // Filter by search term
        if (searchTerm) {
          return (
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return true;
      })
      .filter(task => {
        // Filter by status
        if (statusFilter === 'all') return true;
        return task.status === statusFilter;
      });
  };

  const handleAddDependency = () => {
    if (!selectedTask) return;

    if (dependencyType === 'blocks') {
      // This task blocks the selected task
      onAddDependency(taskId, selectedTask, 'blocks', description);
    } else {
      // This task depends on the selected task
      onAddDependency(selectedTask, taskId, 'depends_on', description);
    }

    // Reset form
    setSelectedTask('');
    setDescription('');
    setShowAddModal(false);
  };

  const getDependencyStatus = (task: Task) => {
    switch (task.status) {
      case 'done':
        return {
          color: 'text-green-600 dark:text-green-400',
          icon: CheckCircle,
          label: 'Completed',
        };
      case 'blocked':
        return { color: 'text-red-600 dark:text-red-400', icon: AlertTriangle, label: 'Blocked' };
      case 'in-progress':
        return { color: 'text-blue-600 dark:text-blue-400', icon: Clock, label: 'In Progress' };
      case 'testing':
        return { color: 'text-purple-600 dark:text-purple-400', icon: Clock, label: 'Testing' };
      case 'review':
        return { color: 'text-orange-600 dark:text-orange-400', icon: Clock, label: 'Review' };
      default:
        return { color: 'text-gray-600 dark:text-gray-400', icon: Clock, label: 'To Do' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20';
      case 'low':
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'blocked':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'testing':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'review':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const blocks = getDependentTasks('blocks');
  const dependsOn = getDependentTasks('depends_on');
  const availableForBlocks = getAvailableTasksForDependency('blocks');
  const availableForDependsOn = getAvailableTasksForDependency('depends_on');

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dependencies</h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Add dependency"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Dependencies Content */}
      <div className="p-4 space-y-6">
        {/* Dependencies this task has on other tasks */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Blocks</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Tasks that cannot start until this task is completed)
            </span>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ArrowUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">This task doesn't block any other tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map(task => {
                const status = getDependencyStatus(task);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${getPriorityColor(task.priority)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <ArrowUp className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(task.status)}`}
                          >
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <span>
                            {task.projectKey}-{task.id.slice(-4)}
                          </span>
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDependencyDetails(task.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          const dependency = currentDependencies.find(
                            dep =>
                              dep.predecessorId === taskId &&
                              dep.successorId === task.id &&
                              dep.type === 'blocks'
                          );
                          if (dependency) {
                            onRemoveDependency(dependency.id);
                          }
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Remove dependency"
                      >
                        <Unlink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dependencies this task has from other tasks */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Depends On</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Tasks that must be completed before this task can start)
            </span>
          </div>

          {dependsOn.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ArrowDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">This task doesn't depend on any other tasks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dependsOn.map(task => {
                const status = getDependencyStatus(task);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${getPriorityColor(task.priority)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <ArrowDown className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(task.status)}`}
                          >
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <span>
                            {task.projectKey}-{task.id.slice(-4)}
                          </span>
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDependencyDetails(task.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          const dependency = currentDependencies.find(
                            dep =>
                              dep.successorId === taskId &&
                              dep.predecessorId === task.id &&
                              dep.type === 'depends_on'
                          );
                          if (dependency) {
                            onRemoveDependency(dependency.id);
                          }
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Remove dependency"
                      >
                        <Unlink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dependency Chain Visualization */}
        {(blocks.length > 0 || dependsOn.length > 0) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Dependency Chain
            </h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                {dependsOn.length > 0 && (
                  <>
                    <div className="text-center">
                      <p className="font-medium">Predecessors</p>
                      <p className="text-xs">{dependsOn.length} tasks</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                      <ArrowDown className="w-4 h-4" />
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                    </div>
                  </>
                )}
                <div className="text-center">
                  <p className="font-medium">Current Task</p>
                  <p className="text-xs">ID: {taskId.slice(-4)}</p>
                </div>
                {blocks.length > 0 && (
                  <>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                      <ArrowUp className="w-4 h-4" />
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Successors</p>
                      <p className="text-xs">{blocks.length} tasks</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Dependency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Dependency
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Dependency Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dependency Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="depends_on"
                      checked={dependencyType === 'depends_on'}
                      onChange={e => setDependencyType(e.target.value as any)}
                      className="mr-2"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Depends On</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This task requires the selected task to be completed first
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="blocks"
                      checked={dependencyType === 'blocks'}
                      onChange={e => setDependencyType(e.target.value as any)}
                      className="mr-2"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Blocks</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This task must be completed before the selected task can start
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Task Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Task
                </label>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search tasks..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                  {dependencyType === 'depends_on' ? (
                    availableForDependsOn.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No available tasks to depend on
                      </div>
                    ) : (
                      availableForDependsOn.map(task => (
                        <label
                          key={task.id}
                          className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={task.id}
                            checked={selectedTask === task.id}
                            onChange={e => setSelectedTask(e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(task.status)}`}
                              >
                                {task.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {task.projectKey}-{task.id.slice(-4)} • {task.storyPoints} points
                              {task.dueDate &&
                                ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                            </div>
                          </div>
                        </label>
                      ))
                    )
                  ) : availableForBlocks.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No available tasks to block
                    </div>
                  ) : (
                    availableForBlocks.map(task => (
                      <label
                        key={task.id}
                        className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={task.id}
                          checked={selectedTask === task.id}
                          onChange={e => setSelectedTask(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(task.status)}`}
                            >
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {task.projectKey}-{task.id.slice(-4)} • {task.storyPoints} points
                            {task.dueDate &&
                              ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description for this dependency..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDependency}
                disabled={!selectedTask}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Dependency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {dependencyDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h3>
              <button
                onClick={() => setDependencyDetails(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const task = [...blocks, ...dependsOn, ...availableTasks].find(
                  t => t.id === dependencyDetails
                );
                if (!task) return null;

                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Project:</span>
                        <span>
                          {task.projectKey}-{task.id.slice(-4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Story Points:</span>
                        <span>{task.storyPoints}</span>
                      </div>
                    </div>

                    {task.dueDate && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDependencyDetails(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dependency graph visualization component
export const DependencyGraph: React.FC<{
  taskId: string;
  tasks: Task[];
  dependencies: Dependency[];
  className?: string;
}> = ({ taskId, tasks, dependencies, className = '' }) => {
  const [centerTask, setCenterTask] = useState<Task | null>(null);

  useEffect(() => {
    setCenterTask(tasks.find(t => t.id === taskId) || null);
  }, [taskId, tasks]);

  if (!centerTask) return null;

  // Get connected tasks
  const connectedTasks = dependencies
    .filter(dep => dep.predecessorId === taskId || dep.successorId === taskId)
    .map(dep => {
      if (dep.predecessorId === taskId) {
        return {
          dependency: dep,
          task: tasks.find(t => t.id === dep.successorId),
          type: 'successor',
        };
      } else {
        return {
          dependency: dep,
          task: tasks.find(t => t.id === dep.predecessorId),
          type: 'predecessor',
        };
      }
    })
    .filter(item => item.task);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <GitBranch className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dependency Graph</h3>
      </div>

      <div className="flex items-center justify-center space-x-8">
        {/* Predecessors */}
        <div className="space-y-2">
          {connectedTasks
            .filter(item => item.type === 'predecessor')
            .map(item => (
              <div key={item.task.id} className="text-center">
                <div className="w-24 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 truncate">
                  {item.task.title}
                </div>
                <div className="w-full h-4 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-gray-400"></div>
                  <ArrowDown className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            ))}
        </div>

        {/* Center Task */}
        <div className="text-center">
          <div className="w-32 p-3 bg-blue-100 dark:bg-blue-900/20 rounded border-2 border-blue-300 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 truncate">
              {centerTask.title}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              {centerTask.projectKey}-{centerTask.id.slice(-4)}
            </p>
          </div>
        </div>

        {/* Successors */}
        <div className="space-y-2">
          {connectedTasks
            .filter(item => item.type === 'successor')
            .map(item => (
              <div key={item.task.id} className="text-center">
                <div className="w-full h-4 flex items-center justify-center">
                  <ArrowUp className="w-3 h-3 text-gray-500" />
                  <div className="w-2 h-0.5 bg-gray-400"></div>
                </div>
                <div className="w-24 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 truncate">
                  {item.task.title}
                </div>
              </div>
            ))}
        </div>
      </div>

      {connectedTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No dependencies found</p>
        </div>
      )}
    </div>
  );
};
