import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  Flag,
  AlertCircle,
  CheckCircle,
  Circle,
  Play,
  Pause,
  Plus,
  X,
  Save,
  Link2,
  Tag,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  content: string;
  createdAt: string;
  editedAt?: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'testing' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  storyPoints: number;
  labels: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: Subtask[];
  comments?: Comment[];
  attachments?: Attachment[];
  blockedBy?: string[];
  blocks?: string[];
  tags?: string[];
}

interface DetailedTaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  isExpanded?: boolean;
  onToggleExpand: () => void;
}

export const DetailedTaskCard: React.FC<DetailedTaskCardProps> = ({
  task,
  onUpdate,
  onDelete,
  onDuplicate,
  onArchive,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'testing':
        return <AlertCircle className="w-4 h-4" />;
      case 'review':
        return <Clock className="w-4 h-4" />;
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const handleSaveEdit = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        id: 'current-user',
        name: 'Current User',
        role: 'Developer',
      },
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    onUpdate({
      comments: [...(task.comments || []), comment],
      updatedAt: new Date().toISOString(),
    });

    setNewComment('');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    const subtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtask,
      completed: false,
    };

    onUpdate({
      subtasks: [...(task.subtasks || []), subtask],
      updatedAt: new Date().toISOString(),
    });

    setNewSubtask('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    onUpdate({
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskId);

    onUpdate({
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-2 flex-1">
            <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
              <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-2 py-1 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Task title"
                  />
                  <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={2}
                    placeholder="Task description"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3
                    className="text-sm font-medium text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => onToggleExpand()}
                  >
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    onArchive();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Metadata */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}
            >
              <Flag className="w-3 h-3" />
              <span>{task.priority}</span>
            </span>

            {task.storyPoints > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                {task.storyPoints} pts
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {getStatusIcon(task.status)}
            <span>{task.status.replace('-', ' ')}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map(label => (
              <span
                key={label}
                className="inline-flex items-center px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full dark:bg-purple-900/20 dark:text-purple-400"
              >
                <Tag className="w-3 h-3 mr-1" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {task.assignee && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{task.assignee.name.split(' ')[0]}</span>
              </div>
            )}

            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onToggleExpand()}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 pt-3">
          {/* Tabs */}
          <div className="flex items-center space-x-4 mb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Comments ({task.comments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Time Tracking */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`p-2 rounded-lg transition-colors ${
                      isTimerRunning
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(elapsedTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.actualHours ? `${task.actualHours}h logged` : 'No time logged'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.estimatedHours ? `${task.estimatedHours}h` : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Subtasks</h4>
                  <span className="text-xs text-gray-500">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {task.subtasks?.map(subtask => (
                    <div
                      key={subtask.id}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                      >
                        {subtask.title}
                      </span>
                      {subtask.assignee && (
                        <span className="text-xs text-gray-500">
                          {subtask.assignee.name.split(' ')[0]}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    placeholder="Add subtask..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={e => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Due Date</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-3">
              {/* Add Comment */}
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {task.comments?.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500 italic">
                Task history and activity log will be displayed here.
              </div>
              <div className="text-xs text-gray-400">
                Created: {new Date(task.createdAt).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                Updated: {new Date(task.updatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
