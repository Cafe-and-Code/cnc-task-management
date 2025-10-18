import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  User,
  Users,
  MessageSquare,
  Paperclip,
  Tag,
  Flag,
  AlertCircle,
  CheckCircle,
  Circle,
  Play,
  Pause,
  History,
  Link2,
  MoreVertical,
  Save,
  X,
  Plus,
  Copy,
  Archive,
} from 'lucide-react';

// Types
interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  mentions?: Array<{
    id: string;
    name: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
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
  previewUrl?: string;
}

interface TimeEntry {
  id: string;
  description: string;
  duration: number;
  user: {
    id: string;
    name: string;
  };
  date: string;
  createdAt: string;
}

interface TaskHistory {
  id: string;
  action: string;
  field: string;
  oldValue?: any;
  newValue?: any;
  user: {
    id: string;
    name: string;
  };
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'testing' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'task' | 'bug' | 'feature' | 'improvement';
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  reporter: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  teamId: string;
  projectId: string;
  sprintId?: string;
  storyPoints: number;
  labels: string[];
  tags: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  blockedBy: string[];
  blocks: string[];
  dependencies: string[];
  watchers: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Team {
  id: string;
  name: string;
  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  }>;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history' | 'time'>(
    'details'
  );
  const [newComment, setNewComment] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    if (!taskId) return;

    // Simulate API call
    setTimeout(() => {
      const mockTask: Task = {
        id: taskId,
        title: 'Implement user authentication system',
        description:
          'Create a comprehensive authentication system with JWT tokens, refresh token support, and role-based access control. The system should include login, registration, password reset, and email verification flows.',
        status: 'in-progress',
        priority: 'high',
        type: 'feature',
        assignee: {
          id: 'user-1',
          name: 'John Doe',
          avatarUrl: 'https://picsum.photos/seed/john/40/40.jpg',
          role: 'Developer',
        },
        reporter: {
          id: 'user-2',
          name: 'Jane Smith',
          avatarUrl: 'https://picsum.photos/seed/jane/40/40.jpg',
          role: 'Product Manager',
        },
        teamId: 'team-1',
        projectId: 'proj-1',
        sprintId: 'sprint-1',
        storyPoints: 8,
        labels: ['authentication', 'security', 'backend'],
        tags: ['frontend', 'backend', 'api'],
        dueDate: '2024-01-15',
        startDate: '2024-01-08',
        estimatedHours: 16,
        actualHours: 12,
        subtasks: [
          {
            id: 'sub-1',
            title: 'Design authentication flow',
            description: 'Create wireframes and user flow diagrams',
            completed: true,
            assignee: {
              id: 'user-3',
              name: 'Alice Johnson',
              role: 'UX Designer',
            },
            createdAt: '2024-01-08T10:00:00Z',
            updatedAt: '2024-01-09T14:30:00Z',
          },
          {
            id: 'sub-2',
            title: 'Implement JWT token service',
            description: 'Create token generation and validation logic',
            completed: true,
            assignee: {
              id: 'user-1',
              name: 'John Doe',
              role: 'Developer',
            },
            createdAt: '2024-01-09T09:00:00Z',
            updatedAt: '2024-01-10T16:45:00Z',
          },
          {
            id: 'sub-3',
            title: 'Build login and registration components',
            description: 'Create React components with form validation',
            completed: false,
            createdAt: '2024-01-11T11:00:00Z',
            updatedAt: '2024-01-11T11:00:00Z',
          },
        ],
        comments: [
          {
            id: 'comm-1',
            content:
              "I've completed the design mockups for the authentication flow. Please review and provide feedback.",
            author: {
              id: 'user-3',
              name: 'Alice Johnson',
              role: 'UX Designer',
            },
            createdAt: '2024-01-09T14:30:00Z',
            mentions: [{ id: 'user-1', name: 'John Doe' }],
          },
        ],
        attachments: [
          {
            id: 'att-1',
            name: 'authentication-flow.pdf',
            url: '#',
            type: 'application/pdf',
            size: 2048576,
            uploadedBy: {
              id: 'user-3',
              name: 'Alice Johnson',
            },
            uploadedAt: '2024-01-09T14:25:00Z',
          },
        ],
        timeEntries: [
          {
            id: 'time-1',
            description: 'JWT token implementation',
            duration: 3600,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            date: '2024-01-09',
            createdAt: '2024-01-09T18:00:00Z',
          },
          {
            id: 'time-2',
            description: 'Login component development',
            duration: 7200,
            user: {
              id: 'user-1',
              name: 'John Doe',
            },
            date: '2024-01-10',
            createdAt: '2024-01-10T19:30:00Z',
          },
        ],
        blockedBy: [],
        blocks: [],
        dependencies: ['task-2'],
        watchers: ['user-1', 'user-2', 'user-4'],
        createdAt: '2024-01-08T09:00:00Z',
        updatedAt: '2024-01-11T15:30:00Z',
      };

      const mockTeam: Team = {
        id: 'team-1',
        name: 'Development Team',
        members: [
          {
            id: 'user-1',
            name: 'John Doe',
            avatarUrl: 'https://picsum.photos/seed/john/40/40.jpg',
            role: 'Developer',
          },
          {
            id: 'user-2',
            name: 'Jane Smith',
            avatarUrl: 'https://picsum.photos/seed/jane/40/40.jpg',
            role: 'Product Manager',
          },
          {
            id: 'user-3',
            name: 'Alice Johnson',
            role: 'UX Designer',
          },
        ],
      };

      const mockProject: Project = {
        id: 'proj-1',
        name: 'CNC Task Management System',
        key: 'CNCTMS',
      };

      setTask(mockTask);
      setTeam(mockTeam);
      setProject(mockProject);
      setIsLoading(false);
    }, 1000);
  }, [taskId]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const handleSaveEdit = () => {
    if (!task) return;

    const updatedTask = { ...task, ...editData, updatedAt: new Date().toISOString() };
    setTask(updatedTask);
    setIsEditing(false);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return;

    const comment: Comment = {
      id: `comm-${Date.now()}`,
      content: newComment.trim(),
      author: {
        id: 'current-user',
        name: 'Current User',
        role: 'Developer',
      },
      createdAt: new Date().toISOString(),
    };

    setTask(prev =>
      prev
        ? {
            ...prev,
            comments: [...prev.comments, comment],
            updatedAt: new Date().toISOString(),
          }
        : null
    );

    setNewComment('');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || !task) return;

    const subtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTask(prev =>
      prev
        ? {
            ...prev,
            subtasks: [...prev.subtasks, subtask],
            updatedAt: new Date().toISOString(),
          }
        : null
    );

    setNewSubtask('');
    setShowSubtaskForm(false);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    setTask(prev =>
      prev
        ? {
            ...prev,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);

    setTask(prev =>
      prev
        ? {
            ...prev,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  };

  const completedSubtasks = task?.subtasks.filter(st => st.completed).length || 0;
  const totalSubtasks = task?.subtasks.length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Task not found</h2>
          <Link to="/projects" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project?.key}-{task.id.slice(-4)}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{project?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Archive className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.title || task.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
                      className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 outline-none w-full"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h2>
                  )}

                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}
                    >
                      {task.status.replace('-', ' ')}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                      {task.type}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-full">
                      {task.storyPoints} points
                    </span>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`p-3 rounded-lg transition-colors ${
                      isTimerRunning
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="text-right">
                    <div className="text-lg font-mono font-medium text-gray-900 dark:text-white">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.actualHours ? `${task.actualHours}h logged` : 'No time logged'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={editData.description || task.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {task.assignee?.avatarUrl ? (
                      <img
                        src={task.assignee.avatarUrl}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {task.assignee?.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-900 dark:text-white">
                      {task.assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Reporter:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {task.reporter.avatarUrl ? (
                      <img
                        src={task.reporter.avatarUrl}
                        alt={task.reporter.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {task.reporter.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-900 dark:text-white">{task.reporter.name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <div className="text-gray-900 dark:text-white">{formatDate(task.createdAt)}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                  <div className="text-gray-900 dark:text-white">{formatDate(task.updatedAt)}</div>
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subtasks</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                  <button
                    onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {totalSubtasks > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Subtask Form */}
              {showSubtaskForm && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    placeholder="Enter subtask title..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    onKeyPress={e => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <div className="flex items-center justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setShowSubtaskForm(false);
                        setNewSubtask('');
                      }}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSubtask}
                      disabled={!newSubtask.trim()}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Subtasks List */}
              <div className="space-y-2">
                {task.subtasks.map(subtask => (
                  <div
                    key={subtask.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                        >
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {subtask.description}
                          </p>
                        )}
                        {subtask.assignee && (
                          <div className="flex items-center space-x-1 mt-1">
                            {subtask.assignee.avatarUrl ? (
                              <img
                                src={subtask.assignee.avatarUrl}
                                alt={subtask.assignee.name}
                                className="w-4 h-4 rounded-full"
                              />
                            ) : (
                              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                  {subtask.assignee.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {subtask.assignee.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'details', label: 'Details', count: 0 },
                    { id: 'comments', label: 'Comments', count: task.comments.length },
                    { id: 'history', label: 'History', count: 0 },
                    { id: 'time', label: 'Time Tracking', count: task.timeEntries.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Time Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Time Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400">
                            Estimated Hours
                          </label>
                          <input
                            type="number"
                            value={editData.estimatedHours || task.estimatedHours || ''}
                            onChange={e =>
                              setEditData({
                                ...editData,
                                estimatedHours: parseInt(e.target.value) || undefined,
                              })
                            }
                            disabled={!isEditing}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400">
                            Actual Hours
                          </label>
                          <div className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                            {task.actualHours || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Dates
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={editData.startDate || task.startDate || ''}
                            onChange={e => setEditData({ ...editData, startDate: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={editData.dueDate || task.dueDate || ''}
                            onChange={e => setEditData({ ...editData, dueDate: e.target.value })}
                            disabled={!isEditing}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Labels */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Labels
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {task.labels.map(label => (
                          <span
                            key={label}
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div>
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Comment
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {task.comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.author.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Task history will be displayed here</p>
                  </div>
                )}

                {activeTab === 'time' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Time Entries
                      </h4>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        Add Time Entry
                      </button>
                    </div>

                    <div className="space-y-3">
                      {task.timeEntries.map(entry => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {entry.user.name}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {entry.date}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.floor(entry.duration / 3600)}h{' '}
                            {Math.floor((entry.duration % 3600) / 60)}m
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Time</span>
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {task.actualHours ? `${task.actualHours}h` : '0h'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Add to Sprint
                </button>
                <button className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Create Subtask
                </button>
                <button className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Add Time Entry
                </button>
                <button className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Watch Task
                </button>
              </div>
            </div>

            {/* Team Information */}
            {team && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team</h3>
                <div className="space-y-3">
                  {team.members.map(member => (
                    <div key={member.id} className="flex items-center space-x-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h3>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {task.attachments.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No attachments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {task.attachments.map(attachment => (
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
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB •{' '}
                            {attachment.uploadedBy.name}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetailPage;
