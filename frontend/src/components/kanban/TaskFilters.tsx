import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  Tag,
  Flag,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Plus,
} from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  availableFilters: {
    assignees: FilterOption[];
    labels: FilterOption[];
    priorities: FilterOption[];
    statuses: FilterOption[];
    teams: FilterOption[];
    storyPoints: FilterOption[];
  };
  initialFilters?: TaskFilters;
  compact?: boolean;
  showSaveFilters?: boolean;
}

export interface TaskFilters {
  search: string;
  assignee: string[];
  labels: string[];
  priorities: string[];
  statuses: string[];
  teams: string[];
  storyPoints: string[];
  dueDateRange: {
    start?: string;
    end?: string;
  };
  createdDateRange: {
    start?: string;
    end?: string;
  };
  hasAttachments?: boolean;
  hasComments?: boolean;
  isBlocked?: boolean;
  isOverdue?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  onFiltersChange,
  onClearFilters,
  availableFilters,
  initialFilters,
  compact = false,
  showSaveFilters = false,
}) => {
  const [filters, setFilters] = useState<TaskFilters>(
    initialFilters || {
      search: '',
      assignee: [],
      labels: [],
      priorities: [],
      statuses: [],
      teams: [],
      storyPoints: [],
      dueDateRange: {},
      createdDateRange: {},
    }
  );
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: TaskFilters }>>(
    []
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const addArrayFilter = (key: keyof TaskFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeArrayFilter = (key: keyof TaskFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    updateFilter(
      key,
      currentArray.filter(item => item !== value)
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.assignee.length;
    count += filters.labels.length;
    count += filters.priorities.length;
    count += filters.statuses.length;
    count += filters.teams.length;
    count += filters.storyPoints.length;
    if (filters.dueDateRange.start || filters.dueDateRange.end) count++;
    if (filters.createdDateRange.start || filters.createdDateRange.end) count++;
    if (filters.hasAttachments !== undefined) count++;
    if (filters.hasComments !== undefined) count++;
    if (filters.isBlocked !== undefined) count++;
    if (filters.isOverdue !== undefined) count++;
    return count;
  };

  const clearAllFilters = () => {
    const emptyFilters: TaskFilters = {
      search: '',
      assignee: [],
      labels: [],
      priorities: [],
      statuses: [],
      teams: [],
      storyPoints: [],
      dueDateRange: {},
      createdDateRange: {},
    };
    setFilters(emptyFilters);
    onClearFilters();
  };

  const saveFilter = () => {
    if (!newFilterName.trim()) return;

    setSavedFilters(prev => [...prev, { name: newFilterName.trim(), filters: { ...filters } }]);
    setNewFilterName('');
    setShowSaveDialog(false);
  };

  const loadSavedFilter = (savedFilter: { name: string; filters: TaskFilters }) => {
    setFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
  };

  const deleteSavedFilter = (index: number) => {
    setSavedFilters(prev => prev.filter((_, i) => i !== index));
  };

  const activeFilterCount = getActiveFilterCount();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={clearAllFilters}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableFilters.priorities.map(priority => (
                <button
                  key={priority.value}
                  onClick={() => addArrayFilter('priorities', priority.value)}
                  className={`p-2 text-sm border rounded-lg transition-colors ${
                    filters.priorities.includes(priority.value)
                      ? getPriorityColor(priority.value)
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Task Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                {activeFilterCount} active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showSaveFilters && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              title="Save filters"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="Clear all filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search by task title, description, or tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Status Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.statuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => addArrayFilter('statuses', status.value)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    filters.statuses.includes(status.value)
                      ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {status.label}
                  {status.count && <span className="ml-1 text-xs">({status.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Priority</h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.priorities.map(priority => (
                <button
                  key={priority.value}
                  onClick={() => addArrayFilter('priorities', priority.value)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    filters.priorities.includes(priority.value)
                      ? getPriorityColor(priority.value)
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Flag className="w-3 h-3 inline mr-1" />
                  {priority.label}
                  {priority.count && <span className="ml-1 text-xs">({priority.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Assignee</h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.assignees.map(assignee => (
                <button
                  key={assignee.value}
                  onClick={() => addArrayFilter('assignee', assignee.value)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    filters.assignee.includes(assignee.value)
                      ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <User className="w-3 h-3 inline mr-1" />
                  {assignee.label}
                  {assignee.count && <span className="ml-1 text-xs">({assignee.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Label Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Labels</h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.labels.map(label => (
                <button
                  key={label.value}
                  onClick={() => addArrayFilter('labels', label.value)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    filters.labels.includes(label.value)
                      ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {label.label}
                  {label.count && <span className="ml-1 text-xs">({label.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Team Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Teams</h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.teams.map(team => (
                <button
                  key={team.value}
                  onClick={() => addArrayFilter('teams', team.value)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    filters.teams.includes(team.value)
                      ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {team.label}
                  {team.count && <span className="ml-1 text-xs">({team.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Story Points */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Story Points</h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.storyPoints.map(points => (
                <button
                  key={points.value}
                  onClick={() => addArrayFilter('storyPoints', points.value)}
                  className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                    filters.storyPoints.includes(points.value)
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {points.label}
                  {points.count && <span className="ml-1 text-xs">({points.count})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Date Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Due Date Range
              </h4>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dueDateRange.start || ''}
                  onChange={e =>
                    updateFilter('dueDateRange', { ...filters.dueDateRange, start: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={filters.dueDateRange.end || ''}
                  onChange={e =>
                    updateFilter('dueDateRange', { ...filters.dueDateRange, end: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Created Date Range
              </h4>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.createdDateRange.start || ''}
                  onChange={e =>
                    updateFilter('createdDateRange', {
                      ...filters.createdDateRange,
                      start: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={filters.createdDateRange.end || ''}
                  onChange={e =>
                    updateFilter('createdDateRange', {
                      ...filters.createdDateRange,
                      end: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Special Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Special Filters
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments || false}
                  onChange={e => updateFilter('hasAttachments', e.target.checked || undefined)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has Attachments</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasComments || false}
                  onChange={e => updateFilter('hasComments', e.target.checked || undefined)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Has Comments</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isBlocked || false}
                  onChange={e => updateFilter('isBlocked', e.target.checked || undefined)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Is Blocked</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isOverdue || false}
                  onChange={e => updateFilter('isOverdue', e.target.checked || undefined)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Is Overdue</span>
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Active Filters
              </h4>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    Search: "{filters.search}"
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.priorities.map(priority => (
                  <span
                    key={priority}
                    className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getPriorityColor(priority)}`}
                  >
                    Priority: {priority}
                    <button
                      onClick={() => removeArrayFilter('priorities', priority)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.statuses.map(status => (
                  <span
                    key={status}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    Status: {status}
                    <button
                      onClick={() => removeArrayFilter('statuses', status)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.assignee.map(assignee => (
                  <span
                    key={assignee}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    Assignee: {assignee}
                    <button
                      onClick={() => removeArrayFilter('assignee', assignee)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.labels.map(label => (
                  <span
                    key={label}
                    className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full dark:bg-purple-900/20 dark:text-purple-400"
                  >
                    Label: {label}
                    <button
                      onClick={() => removeArrayFilter('labels', label)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {filters.teams.map(team => (
                  <span
                    key={team}
                    className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full dark:bg-green-900/20 dark:text-green-400"
                  >
                    Team: {team}
                    <button
                      onClick={() => removeArrayFilter('teams', team)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Current Filters
            </h3>
            <input
              type="text"
              value={newFilterName}
              onChange={e => setNewFilterName(e.target.value)}
              placeholder="Filter name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewFilterName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveFilter}
                disabled={!newFilterName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Filters */}
      {showSaveFilters && savedFilters.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Saved Filters</h4>
          <div className="space-y-2">
            {savedFilters.map((savedFilter, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <button
                  onClick={() => loadSavedFilter(savedFilter)}
                  className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {savedFilter.name}
                </button>
                <button
                  onClick={() => deleteSavedFilter(index)}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
