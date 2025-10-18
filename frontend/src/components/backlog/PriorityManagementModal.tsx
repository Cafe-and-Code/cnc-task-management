import React, { useState, useMemo } from 'react';
import { X, Flag, TrendingUp, AlertTriangle, ArrowUpDown, CheckCircle, Info } from 'lucide-react';

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
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels: string[];
  dependencies?: string[];
  blockedBy?: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  businessValue?: number;
  effort?: number;
}

interface PrioritySuggestion {
  storyId: string;
  currentPriority: string;
  suggestedPriority: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface PriorityConflict {
  storyId: string;
  conflictType: 'dependency' | 'resource' | 'deadline' | 'business_value';
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface PriorityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: UserStory[];
  onUpdatePriorities: (updates: { storyId: string; priority: string }[]) => void;
}

const PRIORITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };
const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const getPriorityScore = (story: UserStory): number => {
  let score = PRIORITY_ORDER[story.priority] * 10;

  // Business value factor
  if (story.businessValue) {
    score += story.businessValue * 2;
  }

  // Story points factor (higher points might need higher priority)
  score += Math.min(story.storyPoints, 13);

  // Due date urgency
  if (story.dueDate) {
    const daysUntilDue = Math.ceil(
      (new Date(story.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 7) score += 15;
    else if (daysUntilDue <= 14) score += 10;
    else if (daysUntilDue <= 30) score += 5;
  }

  // Blocked items get higher priority
  if (story.status === 'blocked') score += 20;

  // Dependencies reduce priority (they can't be started yet)
  if (story.blockedBy && story.blockedBy.length > 0) score -= 10;

  return score;
};

const getSuggestedPriority = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 60) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
};

export const PriorityManagementModal: React.FC<PriorityManagementModalProps> = ({
  isOpen,
  onClose,
  stories,
  onUpdatePriorities,
}) => {
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [bulkPriority, setBulkPriority] = useState<string>('');
  const [viewMode, setViewMode] = useState<'manage' | 'suggestions' | 'conflicts'>('manage');
  const [priorityUpdates, setPriorityUpdates] = useState<{ [key: string]: string }>({});

  const storiesWithScores = useMemo(() => {
    return stories
      .filter(story => story.status !== 'completed')
      .map(story => ({
        ...story,
        priorityScore: getPriorityScore(story),
      }))
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [stories]);

  const suggestions = useMemo((): PrioritySuggestion[] => {
    return storiesWithScores
      .map(story => {
        const suggestedPriority = getSuggestedPriority(story.priorityScore);
        let reason = '';
        let confidence: 'high' | 'medium' | 'low' = 'medium';

        if (story.priorityScore >= 60) {
          reason = 'High business value, urgent due date, or blocked status';
          confidence = 'high';
        } else if (story.priorityScore >= 45) {
          reason = 'High story points or approaching deadline';
        } else if (story.priorityScore >= 30) {
          reason = 'Medium complexity and business value';
        } else {
          reason = 'Lower urgency, can be scheduled later';
          confidence = 'low';
        }

        return {
          storyId: story.id,
          currentPriority: story.priority,
          suggestedPriority,
          reason,
          confidence,
        };
      })
      .filter(suggestion => suggestion.currentPriority !== suggestion.suggestedPriority);
  }, [storiesWithScores]);

  const conflicts = useMemo((): PriorityConflict[] => {
    const conflicts: PriorityConflict[] = [];

    storiesWithScores.forEach(story => {
      // Dependency conflicts
      if (story.dependencies && story.dependencies.length > 0) {
        story.dependencies.forEach(depId => {
          const dependency = stories.find(s => s.id === depId);
          if (dependency && PRIORITY_ORDER[story.priority] > PRIORITY_ORDER[dependency.priority]) {
            conflicts.push({
              storyId: story.id,
              conflictType: 'dependency',
              description: `Story has higher priority than its dependency "${dependency.title}"`,
              severity: 'high',
            });
          }
        });
      }

      // Resource conflicts
      if (story.assignee) {
        const assigneeStories = storiesWithScores.filter(
          s => s.assignee?.id === story.assignee?.id && s.id !== story.id
        );
        const highPriorityCount = assigneeStories.filter(s =>
          ['critical', 'high'].includes(s.priority)
        ).length;

        if (['critical', 'high'].includes(story.priority) && highPriorityCount >= 3) {
          conflicts.push({
            storyId: story.id,
            conflictType: 'resource',
            description: `Assignee has too many high-priority stories (${highPriorityCount + 1})`,
            severity: 'medium',
          });
        }
      }

      // Deadline conflicts
      if (story.dueDate && story.priority === 'low') {
        const daysUntilDue = Math.ceil(
          (new Date(story.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue <= 7) {
          conflicts.push({
            storyId: story.id,
            conflictType: 'deadline',
            description: `Story has low priority but urgent deadline (${daysUntilDue} days)`,
            severity: 'high',
          });
        }
      }
    });

    return conflicts;
  }, [storiesWithScores, stories]);

  const handleStorySelection = (storyId: string, isSelected: boolean) => {
    setSelectedStories(prev =>
      isSelected ? [...prev, storyId] : prev.filter(id => id !== storyId)
    );
  };

  const handleSelectAll = () => {
    if (selectedStories.length === storiesWithScores.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(storiesWithScores.map(story => story.id));
    }
  };

  const handlePriorityChange = (storyId: string, newPriority: string) => {
    setPriorityUpdates(prev => ({
      ...prev,
      [storyId]: newPriority,
    }));
  };

  const handleBulkPriorityUpdate = () => {
    if (bulkPriority && selectedStories.length > 0) {
      const updates = selectedStories.map(storyId => ({
        storyId,
        priority: bulkPriority,
      }));
      setPriorityUpdates(prev => ({
        ...prev,
        ...Object.fromEntries(selectedStories.map(id => [id, bulkPriority])),
      }));
    }
  };

  const handleApplyUpdates = () => {
    const updates = Object.entries(priorityUpdates).map(([storyId, priority]) => ({
      storyId,
      priority,
    }));
    onUpdatePriorities(updates);
    setPriorityUpdates({});
    setSelectedStories([]);
  };

  const handleApplySuggestion = (suggestion: PrioritySuggestion) => {
    setPriorityUpdates(prev => ({
      ...prev,
      [suggestion.storyId]: suggestion.suggestedPriority,
    }));
  };

  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Priority Management
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage story priorities and resolve conflicts
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-8">
              {[
                { id: 'manage', label: 'Manage', icon: <Flag className="w-4 h-4" /> },
                {
                  id: 'suggestions',
                  label: 'Suggestions',
                  icon: <TrendingUp className="w-4 h-4" />,
                  count: suggestions.length,
                },
                {
                  id: 'conflicts',
                  label: 'Conflicts',
                  icon: <AlertTriangle className="w-4 h-4" />,
                  count: conflicts.length,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
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

          <div className="p-6">
            {viewMode === 'manage' && (
              <div className="space-y-6">
                {/* Bulk Actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStories.length === storiesWithScores.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedStories.length} of {storiesWithScores.length} stories selected
                    </span>

                    {selectedStories.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={bulkPriority}
                          onChange={e => setBulkPriority(e.target.value)}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Set priority...</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <button
                          onClick={handleBulkPriorityUpdate}
                          disabled={!bulkPriority}
                          className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply to Selected
                        </button>
                      </div>
                    )}
                  </div>

                  {Object.keys(priorityUpdates).length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Object.keys(priorityUpdates).length} pending updates
                      </span>
                      <button
                        onClick={handleApplyUpdates}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Apply All Updates
                      </button>
                    </div>
                  )}
                </div>

                {/* Stories List */}
                <div className="space-y-2">
                  {storiesWithScores.map(story => {
                    const currentPriority = priorityUpdates[story.id] || story.priority;
                    const hasUpdate = priorityUpdates[story.id] !== undefined;

                    return (
                      <div
                        key={story.id}
                        className={`p-4 border rounded-lg ${
                          selectedStories.includes(story.id)
                            ? 'border-brand-primary bg-brand-primary/5'
                            : hasUpdate
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                              : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedStories.includes(story.id)}
                            onChange={e => handleStorySelection(story.id, e.target.checked)}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded mt-1"
                          />

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    {story.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[currentPriority as keyof typeof PRIORITY_COLORS]}`}
                                  >
                                    {currentPriority}
                                  </span>
                                  {hasUpdate && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                      Updated
                                    </span>
                                  )}
                                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Flag className="w-3 h-3" />
                                    <span>{story.priorityScore} pts</span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                  {story.description}
                                </p>

                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span>{story.storyPoints} story points</span>
                                  {story.assignee && <span>Assigned to {story.assignee.name}</span>}
                                  {story.dueDate && (
                                    <span>Due {new Date(story.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <select
                                  value={currentPriority}
                                  onChange={e => handlePriorityChange(story.id, e.target.value)}
                                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="critical">Critical</option>
                                  <option value="high">High</option>
                                  <option value="medium">Medium</option>
                                  <option value="low">Low</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'suggestions' && (
              <div className="space-y-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      All priorities are optimized
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current priorities align well with business value and deadlines
                    </p>
                  </div>
                ) : (
                  suggestions.map(suggestion => {
                    const story = storiesWithScores.find(s => s.id === suggestion.storyId)!;
                    const hasApplied =
                      priorityUpdates[suggestion.storyId] === suggestion.suggestedPriority;

                    return (
                      <div
                        key={suggestion.storyId}
                        className={`p-4 border rounded-lg ${
                          hasApplied
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                            : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {story.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[suggestion.currentPriority as keyof typeof PRIORITY_COLORS]}`}
                                >
                                  {suggestion.currentPriority}
                                </span>
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[suggestion.suggestedPriority as keyof typeof PRIORITY_COLORS]}`}
                                >
                                  {suggestion.suggestedPriority}
                                </span>
                              </div>
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  suggestion.confidence === 'high'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : suggestion.confidence === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {suggestion.confidence} confidence
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {suggestion.reason}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{story.storyPoints} story points</span>
                              <span>Priority score: {story.priorityScore}</span>
                              {story.businessValue && (
                                <span>Business value: {story.businessValue}</span>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            {!hasApplied ? (
                              <button
                                onClick={() => handleApplySuggestion(suggestion)}
                                className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
                              >
                                Apply Suggestion
                              </button>
                            ) : (
                              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Applied</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {viewMode === 'conflicts' && (
              <div className="space-y-4">
                {conflicts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No priority conflicts found
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All priorities are consistent with dependencies and resources
                    </p>
                  </div>
                ) : (
                  conflicts.map(conflict => {
                    const story = storiesWithScores.find(s => s.id === conflict.storyId)!;

                    return (
                      <div
                        key={`${conflict.storyId}-${conflict.conflictType}`}
                        className="p-4 border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div className="flex items-start space-x-3">
                          <AlertTriangle
                            className={`w-5 h-5 mt-0.5 ${getConflictSeverityColor(conflict.severity)}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {story.title}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[story.priority as keyof typeof PRIORITY_COLORS]}`}
                              >
                                {story.priority}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConflictSeverityColor(conflict.severity)}`}
                              >
                                {conflict.severity} severity
                              </span>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {conflict.description}
                            </p>

                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Conflict type: {conflict.conflictType.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                              <select
                                value={priorityUpdates[story.id] || story.priority}
                                onChange={e => handlePriorityChange(story.id, e.target.value)}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
