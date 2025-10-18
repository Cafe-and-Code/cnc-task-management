import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Flag,
  Tag,
  Clock,
  MessageCircle,
  Paperclip,
  History,
  Edit2,
  Link2,
} from 'lucide-react';

// Types
interface UserStory {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_sprint' | 'completed' | 'in_progress' | 'testing' | 'blocked';
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  comments: Comment[];
  attachments: Attachment[];
  statusHistory: StatusHistory[];
  linkedStories?: LinkedStory[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
}

interface StatusHistory {
  id: string;
  from?: string;
  to: string;
  changedBy: {
    id: string;
    name: string;
  };
  changedAt: string;
  comment?: string;
}

interface LinkedStory {
  id: string;
  title: string;
  type: 'blocks' | 'is_blocked_by' | 'relates_to' | 'duplicates' | 'is_duplicated_by';
}

interface UserStoryDetailModalProps {
  story: UserStory;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (story: UserStory) => void;
}

export const UserStoryDetailModal: React.FC<UserStoryDetailModalProps> = ({
  story,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'links'>(
    'details'
  );
  const [newComment, setNewComment] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'testing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'in_sprint':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would call the API
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const getStoryPointsColor = (points: number) => {
    if (points <= 3) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (points <= 8)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    if (points <= 13)
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStoryPointsColor(story.storyPoints)}`}
                    >
                      {story.storyPoints} pts
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {story.priority}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}
                    >
                      {story.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {story.title}
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Story ID: {story.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(story)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'details', label: 'Details', icon: <Tag className="w-4 h-4" /> },
                {
                  id: 'comments',
                  label: 'Comments',
                  icon: <MessageCircle className="w-4 h-4" />,
                  count: story.comments.length,
                },
                { id: 'activity', label: 'Activity', icon: <History className="w-4 h-4" /> },
                {
                  id: 'links',
                  label: 'Links',
                  icon: <Link2 className="w-4 h-4" />,
                  count: story.linkedStories?.length || 0,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {story.description}
                  </p>
                </div>

                {/* Acceptance Criteria */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Acceptance Criteria
                  </h3>
                  <div className="space-y-2">
                    {story.acceptanceCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 flex-1">{criteria}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Story Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Story Information
                    </h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Story Points</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {story.storyPoints}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Priority</dt>
                        <dd className="text-sm text-gray-900 dark:text-white capitalize">
                          {story.priority}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
                        <dd className="text-sm text-gray-900 dark:text-white capitalize">
                          {story.status.replace('_', ' ')}
                        </dd>
                      </div>
                      {story.dueDate && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600 dark:text-gray-400">Due Date</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {formatDate(story.dueDate)}
                          </dd>
                        </div>
                      )}
                      {story.estimatedHours && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600 dark:text-gray-400">
                            Estimated Hours
                          </dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {story.estimatedHours}h
                          </dd>
                        </div>
                      )}
                      {story.actualHours && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600 dark:text-gray-400">Actual Hours</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {story.actualHours}h
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      People
                    </h3>
                    <dl className="space-y-3">
                      {story.assignee && (
                        <div className="flex items-center space-x-3">
                          <dt className="text-sm text-gray-600 dark:text-gray-400">Assignee</dt>
                          <dd className="flex items-center space-x-2">
                            {story.assignee.avatarUrl ? (
                              <img
                                src={story.assignee.avatarUrl}
                                alt={story.assignee.name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </div>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {story.assignee.name}
                            </span>
                          </dd>
                        </div>
                      )}
                      {story.reporter && (
                        <div className="flex items-center space-x-3">
                          <dt className="text-sm text-gray-600 dark:text-gray-400">Reporter</dt>
                          <dd className="flex items-center space-x-2">
                            {story.reporter.avatarUrl ? (
                              <img
                                src={story.reporter.avatarUrl}
                                alt={story.reporter.name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </div>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {story.reporter.name}
                            </span>
                          </dd>
                        </div>
                      )}
                      {story.epic && (
                        <div className="flex items-center space-x-3">
                          <dt className="text-sm text-gray-600 dark:text-gray-400">Epic</dt>
                          <dd className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: story.epic.color }}
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {story.epic.name}
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Labels */}
                {story.labels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Labels
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {story.labels.map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {story.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {story.attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(attachment.size)} • Uploaded by{' '}
                                {attachment.uploadedBy.name} • {formatDate(attachment.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Timeline
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Created</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {formatDate(story.createdAt)}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Last Updated</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {formatDate(story.updatedAt)}
                        </dd>
                      </div>
                    </div>
                  </dl>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md-md focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {story.comments.map(comment => (
                    <div key={comment.id} className="flex space-x-3">
                      {comment.author.avatarUrl ? (
                        <img
                          src={comment.author.avatarUrl}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {story.comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                {story.statusHistory.map(history => (
                  <div key={history.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {history.changedBy.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(history.changedAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {history.from ? (
                          <>
                            changed status from{' '}
                            <span className="font-medium">{history.from.replace('_', ' ')}</span> to{' '}
                            <span className="font-medium">{history.to.replace('_', ' ')}</span>
                          </>
                        ) : (
                          <>
                            set status to{' '}
                            <span className="font-medium">{history.to.replace('_', ' ')}</span>
                          </>
                        )}
                      </p>
                      {history.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                          "{history.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {story.statusHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No activity history yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-4">
                {story.linkedStories && story.linkedStories.length > 0 ? (
                  story.linkedStories.map(linkedStory => (
                    <div
                      key={linkedStory.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Link2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {linkedStory.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {linkedStory.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/stories/${linkedStory.id}`}
                        className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
                      >
                        View Story
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No linked stories.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for development
export const mockUserStoryDetail: UserStory = {
  id: 'STORY-123',
  title: 'Implement user authentication with JWT tokens',
  description:
    'As a user, I want to be able to authenticate using email and password so that I can access the application securely.\n\nThis story includes implementing:\n- Login functionality\n- Registration process\n- Password reset\n- JWT token management\n- Session handling',
  storyPoints: 8,
  priority: 'high',
  status: 'in_progress',
  assignee: {
    id: 'user-1',
    name: 'John Developer',
    email: 'john@example.com',
    avatarUrl: undefined,
  },
  reporter: {
    id: 'user-2',
    name: 'Jane Product',
    email: 'jane@example.com',
    avatarUrl: undefined,
  },
  epic: {
    id: 'epic-1',
    name: 'User Management',
    color: '#3B82F6',
  },
  labels: ['backend', 'security', 'authentication'],
  acceptanceCriteria: [
    'User can register with email and password',
    'User receives email verification after registration',
    'User can login with valid credentials',
    'User receives JWT token upon successful login',
    'Token is stored securely in localStorage',
    'User can reset password using email link',
    'Password meets security requirements',
    'Login session expires after 24 hours',
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  dueDate: '2024-02-01T00:00:00Z',
  estimatedHours: 16,
  actualHours: 12,
  comments: [
    {
      id: 'comment-1',
      content:
        "I've started working on the JWT implementation. The login endpoint is complete and the token generation is working correctly.",
      author: {
        id: 'user-1',
        name: 'John Developer',
        email: 'john@example.com',
      },
      createdAt: '2024-01-18T09:00:00Z',
    },
    {
      id: 'comment-2',
      content: 'Great progress! Please make sure to implement proper token validation middleware.',
      author: {
        id: 'user-3',
        name: 'Sarah Tech Lead',
        email: 'sarah@example.com',
      },
      createdAt: '2024-01-18T14:30:00Z',
    },
  ],
  attachments: [
    {
      id: 'attachment-1',
      name: 'API-Documentation.pdf',
      url: '/files/api-doc.pdf',
      size: 2048576,
      type: 'application/pdf',
      uploadedBy: {
        id: 'user-2',
        name: 'Jane Product',
      },
      uploadedAt: '2024-01-15T10:15:00Z',
    },
  ],
  statusHistory: [
    {
      id: 'history-1',
      to: 'backlog',
      changedBy: {
        id: 'user-2',
        name: 'Jane Product',
      },
      changedAt: '2024-01-15T10:00:00Z',
      comment: 'Initial story creation',
    },
    {
      id: 'history-2',
      from: 'backlog',
      to: 'in_sprint',
      changedBy: {
        id: 'user-4',
        name: 'Mike Scrum Master',
      },
      changedAt: '2024-01-17T09:00:00Z',
      comment: 'Added to Sprint 3',
    },
    {
      id: 'history-3',
      from: 'in_sprint',
      to: 'in_progress',
      changedBy: {
        id: 'user-1',
        name: 'John Developer',
      },
      changedAt: '2024-01-18T09:00:00Z',
      comment: 'Started development',
    },
  ],
  linkedStories: [
    {
      id: 'STORY-124',
      title: 'Implement password reset functionality',
      type: 'blocks',
    },
    {
      id: 'STORY-125',
      title: 'Add email verification system',
      type: 'relates_to',
    },
  ],
};
