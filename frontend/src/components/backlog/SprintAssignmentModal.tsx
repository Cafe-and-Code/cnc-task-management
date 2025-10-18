import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Info,
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
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels: string[];
  dependencies?: string[];
  estimatedHours?: number;
  businessValue?: number;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  assignedStories: UserStory[];
  velocity?: number;
  goal?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  capacity: number; // hours per sprint
  assignedPoints: number;
}

interface SprintAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: UserStory[];
  teamMembers: TeamMember[];
  sprints: Sprint[];
  onAssignStories: (sprintId: string, storyIds: string[]) => void;
  onCreateSprint: (sprintData: Partial<Sprint>) => void;
}

export const SprintAssignmentModal: React.FC<SprintAssignmentModalProps> = ({
  isOpen,
  onClose,
  stories,
  teamMembers,
  sprints,
  onAssignStories,
  onCreateSprint,
}) => {
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'assign' | 'create' | 'planning'>('assign');
  const [newSprintData, setNewSprintData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    capacity: 40,
  });

  // Filter stories that can be assigned (not already in active sprints or completed)
  const assignableStories = useMemo(() => {
    return stories.filter(
      story =>
        story.status !== 'completed' &&
        !sprints.some(
          sprint =>
            sprint.status === 'active' &&
            sprint.assignedStories.some(assignedStory => assignedStory.id === story.id)
        )
    );
  }, [stories, sprints]);

  const selectedSprint = useMemo(() => {
    return sprints.find(sprint => sprint.id === selectedSprintId);
  }, [selectedSprintId, sprints]);

  const selectedStories = useMemo(() => {
    return assignableStories.filter(story => selectedStoryIds.includes(story.id));
  }, [assignableStories, selectedStoryIds]);

  // Calculate capacity metrics
  const capacityMetrics = useMemo(() => {
    if (!selectedSprint) return null;

    const totalAssignedPoints = selectedSprint.assignedStories.reduce(
      (sum, story) => sum + story.storyPoints,
      0
    );
    const totalSelectedPoints = selectedStories.reduce((sum, story) => sum + story.storyPoints, 0);
    const newTotalPoints = totalAssignedPoints + totalSelectedPoints;
    const availableCapacity = selectedSprint.capacity - totalAssignedPoints;
    const utilizationRate = (newTotalPoints / selectedSprint.capacity) * 100;

    return {
      totalAssignedPoints,
      totalSelectedPoints,
      newTotalPoints,
      availableCapacity,
      utilizationRate,
      isOverCapacity: newTotalPoints > selectedSprint.capacity,
      remainingCapacity: selectedSprint.capacity - newTotalPoints,
    };
  }, [selectedSprint, selectedStories]);

  const handleStoryToggle = (storyId: string, isSelected: boolean) => {
    setSelectedStoryIds(prev =>
      isSelected ? [...prev, storyId] : prev.filter(id => id !== storyId)
    );
  };

  const handleSelectAll = () => {
    if (selectedStoryIds.length === assignableStories.length) {
      setSelectedStoryIds([]);
    } else {
      setSelectedStoryIds(assignableStories.map(story => story.id));
    }
  };

  const handleAssignStories = () => {
    if (selectedSprintId && selectedStoryIds.length > 0) {
      onAssignStories(selectedSprintId, selectedStoryIds);
      setSelectedStoryIds([]);
    }
  };

  const handleCreateSprint = () => {
    if (newSprintData.name && newSprintData.startDate && newSprintData.endDate) {
      onCreateSprint({
        ...newSprintData,
        capacity: newSprintData.capacity,
        status: 'planning',
        assignedStories: [],
      });
      setNewSprintData({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        capacity: 40,
      });
      setViewMode('assign');
    }
  };

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

  const getCapacityColor = (utilizationRate: number) => {
    if (utilizationRate > 100) return 'text-red-600 dark:text-red-400';
    if (utilizationRate > 90) return 'text-yellow-600 dark:text-yellow-400';
    if (utilizationRate >= 70) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getCapacityBgColor = (utilizationRate: number) => {
    if (utilizationRate > 100) return 'bg-red-100 dark:bg-red-900/20';
    if (utilizationRate > 90) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (utilizationRate >= 70) return 'bg-green-100 dark:bg-green-900/20';
    return 'bg-blue-100 dark:bg-blue-900/20';
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
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sprint Assignment
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assign stories to sprints and manage capacity
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
                { id: 'assign', label: 'Assign Stories', icon: <Plus className="w-4 h-4" /> },
                {
                  id: 'planning',
                  label: 'Capacity Planning',
                  icon: <TrendingUp className="w-4 h-4" />,
                },
                { id: 'create', label: 'Create Sprint', icon: <Calendar className="w-4 h-4" /> },
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
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {viewMode === 'assign' && (
              <div className="space-y-6">
                {/* Sprint Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Sprint
                  </label>
                  <select
                    value={selectedSprintId}
                    onChange={e => setSelectedSprintId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Choose a sprint...</option>
                    {sprints.map(sprint => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name} ({sprint.capacity} pts) - {sprint.status}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSprint && (
                  <>
                    {/* Sprint Info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                            {selectedSprint.name}
                          </h3>
                          {selectedSprint.goal && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Goal: {selectedSprint.goal}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(selectedSprint.startDate).toLocaleDateString()} -{' '}
                              {new Date(selectedSprint.endDate).toLocaleDateString()}
                            </span>
                            <span>Capacity: {selectedSprint.capacity} points</span>
                          </div>
                        </div>
                        {capacityMetrics && (
                          <div
                            className={`px-3 py-2 rounded-lg ${getCapacityBgColor(capacityMetrics.utilizationRate)}`}
                          >
                            <div
                              className={`text-lg font-bold ${getCapacityColor(capacityMetrics.utilizationRate)}`}
                            >
                              {capacityMetrics.utilizationRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {capacityMetrics.isOverCapacity ? 'Over Capacity' : 'Utilization'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity Metrics */}
                    {capacityMetrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {capacityMetrics.totalAssignedPoints}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Currently Assigned
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {capacityMetrics.totalSelectedPoints}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Selected</div>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {capacityMetrics.newTotalPoints}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">New Total</div>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${capacityMetrics.isOverCapacity ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                        >
                          <div
                            className={`text-2xl font-bold ${capacityMetrics.isOverCapacity ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}
                          >
                            {capacityMetrics.remainingCapacity}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Remaining Capacity
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stories Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Stories ({selectedStoryIds.length} selected)
                        </h3>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedStoryIds.length === assignableStories.length}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Select All
                          </span>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {assignableStories.map(story => {
                          const isSelected = selectedStoryIds.includes(story.id);
                          return (
                            <div
                              key={story.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-brand-primary bg-brand-primary/5'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              onClick={() => handleStoryToggle(story.id, !isSelected)}
                            >
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    e.stopPropagation();
                                    handleStoryToggle(story.id, e.target.checked);
                                  }}
                                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {story.title}
                                    </h4>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}
                                    >
                                      {story.priority}
                                    </span>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      {story.storyPoints} pts
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {story.description}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    {story.assignee && (
                                      <span>Assigned to {story.assignee.name}</span>
                                    )}
                                    {story.epic && <span>Epic: {story.epic.name}</span>}
                                    {story.dependencies && story.dependencies.length > 0 && (
                                      <span className="flex items-center space-x-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Has dependencies</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Capacity Warning */}
                    {capacityMetrics?.isOverCapacity && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                              Over Capacity Warning
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-500">
                              Selected stories exceed sprint capacity by{' '}
                              {Math.abs(capacityMetrics.remainingCapacity)} points. Consider
                              removing some stories or increasing sprint capacity.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignStories}
                        disabled={selectedStoryIds.length === 0}
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Assign {selectedStoryIds.length} Stories
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {viewMode === 'planning' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sprints.map(sprint => {
                    const utilizationRate =
                      (sprint.assignedStories.reduce((sum, story) => sum + story.storyPoints, 0) /
                        sprint.capacity) *
                      100;
                    return (
                      <div
                        key={sprint.id}
                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {sprint.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                              {new Date(sprint.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sprint.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : sprint.status === 'completed'
                                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  : sprint.status === 'planning'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                          >
                            {sprint.status}
                          </span>
                        </div>

                        {sprint.goal && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {sprint.goal}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {sprint.capacity} pts
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Assigned</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {sprint.assignedStories.reduce(
                                (sum, story) => sum + story.storyPoints,
                                0
                              )}{' '}
                              pts
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                            <span className={`font-medium ${getCapacityColor(utilizationRate)}`}>
                              {utilizationRate.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Stories</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {sprint.assignedStories.length}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilizationRate > 100
                                  ? 'bg-red-500'
                                  : utilizationRate > 90
                                    ? 'bg-yellow-500'
                                    : utilizationRate >= 70
                                      ? 'bg-green-500'
                                      : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'create' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sprint Name *
                  </label>
                  <input
                    type="text"
                    value={newSprintData.name}
                    onChange={e => setNewSprintData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Sprint 12 - User Authentication"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sprint Goal
                  </label>
                  <textarea
                    value={newSprintData.goal}
                    onChange={e => setNewSprintData(prev => ({ ...prev, goal: e.target.value }))}
                    placeholder="What's the main goal for this sprint?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newSprintData.startDate}
                      onChange={e =>
                        setNewSprintData(prev => ({ ...prev, startDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={newSprintData.endDate}
                      onChange={e =>
                        setNewSprintData(prev => ({ ...prev, endDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (story points)
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        setNewSprintData(prev => ({
                          ...prev,
                          capacity: Math.max(10, prev.capacity - 5),
                        }))
                      }
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={newSprintData.capacity}
                      onChange={e =>
                        setNewSprintData(prev => ({
                          ...prev,
                          capacity: parseInt(e.target.value) || 40,
                        }))
                      }
                      min="10"
                      max="100"
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                    />
                    <button
                      onClick={() =>
                        setNewSprintData(prev => ({
                          ...prev,
                          capacity: Math.min(100, prev.capacity + 5),
                        }))
                      }
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Based on team velocity: ~45 points/sprint
                    </span>
                  </div>
                </div>

                {/* Team Capacity Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                        Team Capacity
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                        Based on your team members, the suggested capacity is{' '}
                        {teamMembers.reduce((sum, member) => sum + member.capacity, 0)} story
                        points.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setViewMode('assign')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSprint}
                    disabled={
                      !newSprintData.name || !newSprintData.startDate || !newSprintData.endDate
                    }
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Sprint
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
