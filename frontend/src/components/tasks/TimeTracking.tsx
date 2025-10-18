import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  User,
  Edit3,
  Trash2,
  Plus,
  TrendingUp,
  BarChart3,
  Timer,
  History,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  description: string;
  duration: number; // in seconds
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime?: string; // HH:MM:SS
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TimeTrackingProps {
  taskId: string;
  taskTitle: string;
  estimatedHours?: number;
  onTimeEntryCreate: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTimeEntryUpdate: (entryId: string, updates: Partial<TimeEntry>) => void;
  onTimeEntryDelete: (entryId: string) => void;
  entries: TimeEntry[];
  currentUserId: string;
  className?: string;
}

export const TimeTracking: React.FC<TimeTrackingProps> = ({
  taskId,
  taskTitle,
  estimatedHours,
  onTimeEntryCreate,
  onTimeEntryUpdate,
  onTimeEntryDelete,
  entries,
  currentUserId,
  className = '',
}) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [currentDescription, setCurrentDescription] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    description: '',
    duration: 0,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
  });
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total time spent
  const totalSeconds = entries.reduce((sum, entry) => sum + entry.duration, 0) + currentSessionTime;
  const totalHours = totalSeconds / 3600;
  const formattedTotalTime = formatTime(totalSeconds);

  // Get time entries for this task
  const taskEntries = entries.filter(entry => entry.taskId === taskId);
  const runningEntry = taskEntries.find(entry => entry.isRunning);

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Check for running timer on mount
  useEffect(() => {
    if (runningEntry) {
      setIsTimerRunning(true);
      const elapsed = Math.floor((Date.now() - new Date(runningEntry.startTime).getTime()) / 1000);
      setCurrentSessionTime(elapsed);
    }
  }, [runningEntry]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStartTimer = () => {
    if (!currentDescription.trim()) {
      alert('Please enter a description before starting the timer');
      return;
    }

    const newEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      taskId,
      taskTitle,
      description: currentDescription.trim(),
      duration: 0,
      user: {
        id: currentUserId,
        name: 'Current User', // In real implementation, get from auth context
      },
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      isRunning: true,
    };

    onTimeEntryCreate(newEntry);
    setIsTimerRunning(true);
    setCurrentSessionTime(0);
  };

  const handlePauseTimer = () => {
    if (runningEntry) {
      const endTime = new Date().toISOString();
      const duration = currentSessionTime;

      onTimeEntryUpdate(runningEntry.id, {
        endTime,
        duration: runningEntry.duration + duration,
        isRunning: false,
      });

      setCurrentSessionTime(0);
      setIsTimerRunning(false);
    }
  };

  const handleStopTimer = () => {
    if (runningEntry) {
      const endTime = new Date().toISOString();
      const duration = currentSessionTime;

      onTimeEntryUpdate(runningEntry.id, {
        endTime,
        duration: runningEntry.duration + duration,
        isRunning: false,
      });

      setCurrentSessionTime(0);
      setCurrentDescription('');
      setIsTimerRunning(false);
    }
  };

  const handleManualEntry = () => {
    if (!manualEntry.description.trim() || manualEntry.duration <= 0) {
      alert('Please enter a description and valid duration');
      return;
    }

    const durationInSeconds = manualEntry.duration * 3600; // Convert hours to seconds
    const startTime = new Date(`${manualEntry.date}T${manualEntry.startTime}:00`).toISOString();
    const endTime = new Date(
      new Date(startTime).getTime() + durationInSeconds * 1000
    ).toISOString();

    const newEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      taskId,
      taskTitle,
      description: manualEntry.description.trim(),
      duration: durationInSeconds,
      user: {
        id: currentUserId,
        name: 'Current User',
      },
      date: manualEntry.date,
      startTime,
      endTime,
      isRunning: false,
    };

    onTimeEntryCreate(newEntry);
    setShowManualEntry(false);
    setManualEntry({
      description: '',
      duration: 0,
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      onTimeEntryDelete(entryId);
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry.id);
    // In a real implementation, this would open an edit modal
  };

  const handleSaveEdit = (entryId: string, updates: Partial<TimeEntry>) => {
    onTimeEntryUpdate(entryId, updates);
    setEditingEntry(null);
  };

  // Calculate efficiency
  const efficiency = estimatedHours ? Math.round((totalHours / estimatedHours) * 100) : 0;
  const isOverBudget = estimatedHours && totalHours > estimatedHours;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Tracking</h3>
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Add manual time entry"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Current Timer */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(currentSessionTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current session</div>
          </div>
          <div className="flex items-center space-x-2">
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                disabled={!currentDescription.trim()}
                className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Start timer"
              >
                <Play className="w-4 h-4" />
                <span>Start</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseTimer}
                  className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
                  title="Pause timer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={handleStopTimer}
                  className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  title="Stop timer"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What are you working on?
          </label>
          <input
            type="text"
            value={currentDescription}
            onChange={e => setCurrentDescription(e.target.value)}
            disabled={isTimerRunning}
            placeholder="Enter task description..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          />
        </div>
      </div>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Add Manual Time Entry
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={manualEntry.description}
                onChange={e => setManualEntry({ ...manualEntry, description: e.target.value })}
                placeholder="Enter work description..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={manualEntry.duration}
                  onChange={e =>
                    setManualEntry({ ...manualEntry, duration: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualEntry.date}
                  onChange={e => setManualEntry({ ...manualEntry, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={manualEntry.startTime}
                  onChange={e => setManualEntry({ ...manualEntry, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleManualEntry}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formattedTotalTime}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hours</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {totalHours.toFixed(1)}h
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entries</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {taskEntries.length}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg/Entry</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {taskEntries.length > 0 ? formatDuration(totalSeconds / taskEntries.length) : '0m'}
          </div>
        </div>
      </div>

      {/* Progress vs Estimated */}
      {estimatedHours && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress vs Estimated
            </span>
            <span
              className={`text-sm font-medium ${
                isOverBudget
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {efficiency}% ({isOverBudget ? 'Over budget' : 'On track'})
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(efficiency, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>{totalHours.toFixed(1)}h spent</span>
            <span>{estimatedHours}h estimated</span>
          </div>
        </div>
      )}

      {/* Time Entries List */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Time Entries</h4>
        <div className="space-y-2">
          {taskEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No time entries yet</p>
              <p className="text-sm">Start tracking time to see entries here</p>
            </div>
          ) : (
            taskEntries.map(entry => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${
                  entry.isRunning ? 'border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {entry.user.avatarUrl ? (
                    <img
                      src={entry.user.avatarUrl}
                      alt={entry.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm">
                      {entry.user.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.description}
                      </p>
                      {entry.isRunning && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                          Running
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>{formatDuration(entry.duration)}</span>
                      <span>{entry.date}</span>
                      {entry.startTime && (
                        <span>
                          {new Date(entry.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingEntry === entry.id ? (
                    <>
                      <button
                        onClick={() => setEditingEntry(null)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(entry.id, {})}
                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Save"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Time tracking widget for dashboards
export const TimeTrackingWidget: React.FC<{
  taskId: string;
  taskTitle: string;
  entries: TimeEntry[];
  estimatedHours?: number;
  className?: string;
}> = ({ taskId, taskTitle, entries, estimatedHours, className = '' }) => {
  const taskEntries = entries.filter(entry => entry.taskId === taskId);
  const totalSeconds = taskEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = totalSeconds / 3600;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Time Tracking</h4>
        <Timer className="w-4 h-4 text-gray-500" />
      </div>

      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {formatDuration(totalSeconds)}
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400">
        {taskEntries.length} {taskEntries.length === 1 ? 'entry' : 'entries'}
      </div>

      {estimatedHours && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span
              className={
                totalHours > estimatedHours
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }
            >
              {Math.round((totalHours / estimatedHours) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                totalHours > estimatedHours ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((totalHours / estimatedHours) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Time tracking summary for reports
export const TimeTrackingSummary: React.FC<{
  entries: TimeEntry[];
  timeRange?: { start: string; end: string };
  groupBy?: 'user' | 'task' | 'date';
  className?: string;
}> = ({ entries, timeRange, groupBy = 'date', className = '' }) => {
  const [activeGroup, setActiveGroup] = useState(groupBy);

  // Filter entries by time range if provided
  const filteredEntries = timeRange
    ? entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const startDate = new Date(timeRange.start);
        const endDate = new Date(timeRange.end);
        return entryDate >= startDate && entryDate <= endDate;
      })
    : entries;

  // Group entries
  const groupedEntries = filteredEntries.reduce(
    (groups, entry) => {
      let key = '';
      switch (activeGroup) {
        case 'user':
          key = entry.user.name;
          break;
        case 'task':
          key = entry.taskTitle;
          break;
        case 'date':
          key = entry.date;
          break;
        default:
          key = entry.date;
      }

      if (!groups[key]) {
        groups[key] = {
          name: key,
          totalSeconds: 0,
          entryCount: 0,
          entries: [],
        };
      }

      groups[key].totalSeconds += entry.duration;
      groups[key].entryCount += 1;
      groups[key].entries.push(entry);

      return groups;
    },
    {} as Record<string, any>
  );

  const totalSeconds = Object.values(groupedEntries).reduce(
    (sum: number, group: any) => sum + group.totalSeconds,
    0
  );
  const totalHours = totalSeconds / 3600;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Time Tracking Summary
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveGroup('date')}
            className={`px-3 py-1 text-sm rounded-lg ${
              activeGroup === 'date'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By Date
          </button>
          <button
            onClick={() => setActiveGroup('user')}
            className={`px-3 py-1 text-sm rounded-lg ${
              activeGroup === 'user'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By User
          </button>
          <button
            onClick={() => setActiveGroup('task')}
            className={`px-3 py-1 text-sm rounded-lg ${
              activeGroup === 'task'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By Task
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatDuration(totalSeconds)}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {totalHours.toFixed(1)}h
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entries</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {filteredEntries.length}
          </div>
        </div>
      </div>

      {/* Grouped Data */}
      <div className="space-y-3">
        {Object.entries(groupedEntries)
          .sort(([, a], [, b]) => b.totalSeconds - a.totalSeconds)
          .slice(0, 10)
          .map(([key, group]) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{group.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {group.entryCount} {group.entryCount === 1 ? 'entry' : 'entries'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDuration(group.totalSeconds)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {(group.totalSeconds / 3600).toFixed(1)}h
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};
