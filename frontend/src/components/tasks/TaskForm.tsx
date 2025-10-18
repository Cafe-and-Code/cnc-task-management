import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Tag,
  Flag,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Edit3,
} from 'lucide-react';

// Types
interface Subtask {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  file?: File;
}

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

interface Sprint {
  id: string;
  name: string;
  status: string;
}

interface TaskFormData {
  title: string;
  description: string;
  type: 'task' | 'bug' | 'feature' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in-progress' | 'testing' | 'review' | 'done';
  assigneeId?: string;
  reporterId?: string;
  projectId: string;
  sprintId?: string;
  teamId?: string;
  storyPoints: number;
  estimatedHours?: number;
  labels: string[];
  tags: string[];
  startDate?: string;
  dueDate?: string;
  subtasks: Subtask[];
  attachments: Attachment[];
  blockedBy: string[];
  dependencies: string[];
  watchers: string[];
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  projects: Project[];
  teamMembers: TeamMember[];
  sprints: Sprint[];
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  className?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  projects,
  teamMembers,
  sprints,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    status: 'todo',
    projectId: initialData?.projectId || projects[0]?.id || '',
    storyPoints: 1,
    estimatedHours: undefined,
    labels: [],
    tags: [],
    subtasks: [],
    attachments: [],
    blockedBy: [],
    dependencies: [],
    watchers: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newLabel, setNewLabel] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (formData.storyPoints < 0) {
      newErrors.storyPoints = 'Story points must be non-negative';
    }

    if (formData.estimatedHours !== undefined && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours must be non-negative';
    }

    if (
      formData.startDate &&
      formData.dueDate &&
      new Date(formData.startDate) > new Date(formData.dueDate)
    ) {
      newErrors.dateRange = 'Start date must be before due date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()],
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    const subtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtask.trim(),
      completed: false,
    };

    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, subtask],
    }));

    setNewSubtask('');
    setShowSubtaskForm(false);
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId),
    }));
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      ),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: `att-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        file,
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment],
      }));
    });
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId),
    }));
  };

  const applyTemplate = (template: 'bug' | 'feature' | 'task') => {
    switch (template) {
      case 'bug':
        setFormData(prev => ({
          ...prev,
          type: 'bug',
          priority: 'high',
          status: 'todo',
          labels: ['bug'],
          storyPoints: 3,
        }));
        break;
      case 'feature':
        setFormData(prev => ({
          ...prev,
          type: 'feature',
          priority: 'medium',
          status: 'todo',
          labels: ['feature'],
          storyPoints: 5,
        }));
        break;
      case 'task':
        setFormData(prev => ({
          ...prev,
          type: 'task',
          priority: 'medium',
          status: 'todo',
          storyPoints: 1,
        }));
        break;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'feature':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'improvement':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'testing':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'review':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'done':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={previewMode ? 'Edit Mode' : 'Preview Mode'}
          >
            {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Templates */}
        {!isEditing && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Templates
            </h3>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => applyTemplate('bug')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                Bug Report
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('feature')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                New Feature
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('task')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                Simple Task
              </button>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              disabled={previewMode}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              disabled={previewMode}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe the task..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="testing">Testing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                max="21"
                value={formData.storyPoints}
                onChange={e =>
                  setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })
                }
                disabled={previewMode}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.storyPoints
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.storyPoints && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.storyPoints}</p>
              )}
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assignee
              </label>
              <select
                value={formData.assigneeId || ''}
                onChange={e =>
                  setFormData({ ...formData, assigneeId: e.target.value || undefined })
                }
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reporter
              </label>
              <select
                value={formData.reporterId || ''}
                onChange={e =>
                  setFormData({ ...formData, reporterId: e.target.value || undefined })
                }
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select reporter</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                disabled={previewMode}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.projectId
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.projectId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sprint
              </label>
              <select
                value={formData.sprintId || ''}
                onChange={e => setFormData({ ...formData, sprintId: e.target.value || undefined })}
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Sprint</option>
                {sprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Time and Dates */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Time & Dates</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                disabled={previewMode}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedHours
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
              />
              {errors.estimatedHours && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.estimatedHours}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value || undefined })}
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate || ''}
              onChange={e => setFormData({ ...formData, startDate: e.target.value || undefined })}
              disabled={previewMode}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {errors.dateRange && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.dateRange}</p>
          )}
        </div>

        {/* Labels and Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Labels & Tags</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Labels
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Add label..."
                disabled={previewMode}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              />
              <button
                type="button"
                onClick={handleAddLabel}
                disabled={previewMode || !newLabel.trim()}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.labels.map(label => (
                <span
                  key={label}
                  className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full"
                >
                  {label}
                  {!previewMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add tag..."
                disabled={previewMode}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={previewMode || !newTag.trim()}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                >
                  #{tag}
                  {!previewMode && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Subtasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subtasks</h3>
            <button
              type="button"
              onClick={() => setShowSubtaskForm(!showSubtaskForm)}
              disabled={previewMode}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showSubtaskForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="Enter subtask title..."
                disabled={previewMode}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubtaskForm(false);
                    setNewSubtask('');
                  }}
                  disabled={previewMode}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={previewMode || !newSubtask.trim()}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {formData.subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                    disabled={previewMode}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                  >
                    {subtask.title}
                  </span>
                </div>
                {!previewMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h3>
            <label className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={previewMode}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            {formData.attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!previewMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || previewMode}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
