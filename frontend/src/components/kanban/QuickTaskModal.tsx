import React, { useState } from 'react';
import {
  X,
  Plus,
  User,
  Calendar,
  Flag,
  Clock,
  Tag,
  Link,
  Paperclip,
  AlertCircle,
  Hash,
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: any) => void;
  columnId: string;
  columnName: string;
  teamMembers: User[];
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  columnId,
  columnName,
  teamMembers,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [storyPoints, setStoryPoints] = useState(1);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      status: columnId as any,
      priority,
      storyPoints,
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
      dueDate: dueDate || undefined,
      labels,
      tags,
      assignee: assigneeId ? teamMembers.find(m => m.id === assigneeId) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      comments: [],
      attachments: [],
    };

    onCreateTask(newTask);
    onClose();

    // Reset form
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setPriority('medium');
    setStoryPoints(1);
    setEstimatedHours('');
    setDueDate('');
    setLabels([]);
    setTags([]);
    setNewLabel('');
    setNewTag('');
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-700';
      case 'high':
        return 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
      case 'low':
        return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-700';
      default:
        return 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add task to <span className="font-medium">{columnName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[calc(90vh-8rem)] overflow-y-auto"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
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

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(priority)}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Story Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Hash className="w-4 h-4 inline mr-1" />
                Story Points
              </label>
              <input
                type="number"
                min="0"
                max="21"
                value={storyPoints}
                onChange={e => setStoryPoints(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Est. Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Labels
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Add label..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map(label => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full dark:bg-purple-900/20 dark:text-purple-400"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Link className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/20 dark:text-blue-400"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPriority('high');
                  setStoryPoints(5);
                  setEstimatedHours('4');
                }}
                className="p-2 text-left text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Complex Task</div>
                <div className="text-xs text-gray-500">High priority, 5pts, 4h</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPriority('medium');
                  setStoryPoints(3);
                  setEstimatedHours('2');
                }}
                className="p-2 text-left text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Standard Task</div>
                <div className="text-xs text-gray-500">Medium priority, 3pts, 2h</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPriority('low');
                  setStoryPoints(1);
                  setEstimatedHours('1');
                }}
                className="p-2 text-left text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Quick Fix</div>
                <div className="text-xs text-gray-500">Low priority, 1pt, 1h</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPriority('critical');
                  setStoryPoints(8);
                  setEstimatedHours('8');
                }}
                className="p-2 text-left text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium text-gray-900 dark:text-white">Urgent Bug</div>
                <div className="text-xs text-gray-500">Critical priority, 8pts, 8h</div>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Task will be added to {columnName}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
