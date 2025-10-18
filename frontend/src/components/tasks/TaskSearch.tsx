import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Tag,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Grid,
  List,
  Eye,
  EyeOff,
  Star,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  labels: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  projectId: string;
  projectName: string;
  sprintId?: string;
  sprintName?: string;
  reporter: {
    id: string;
    name: string;
  };
  watchers: Array<{
    id: string;
    name: string;
  }>;
  attachments: number;
  comments: number;
  subtasks: {
    total: number;
    completed: number;
  };
  dependencies: {
    blocking: number;
    blocked: number;
  };
  isBookmarked: boolean;
}

interface SearchFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  label: string;
}

interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isPublic: boolean;
  isDefault: boolean;
  createdAt: string;
  createdBy: string;
  usageCount: number;
}

interface TaskSearchProps {
  tasks: Task[];
  onTasksFiltered?: (filteredTasks: Task[]) => void;
  onTaskSelect?: (task: Task) => void;
  showSavedSearches?: boolean;
  allowSaveSearch?: boolean;
  className?: string;
}

const TaskSearch: React.FC<TaskSearchProps> = ({
  tasks,
  onTasksFiltered,
  onTaskSelect,
  showSavedSearches = true,
  allowSaveSearch = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<string>('');
  const [showSaveSearchDialog, setShowSaveSearchDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock saved searches
  useEffect(() => {
    const mockSavedSearches: SavedSearch[] = [
      {
        id: 'saved-1',
        name: 'My High Priority Tasks',
        description: 'High priority tasks assigned to me',
        filters: [
          {
            id: 'f1',
            field: 'assignee.id',
            operator: 'equals',
            value: 'current-user',
            label: 'Assignee: Me',
          },
          {
            id: 'f2',
            field: 'priority',
            operator: 'in',
            value: ['high', 'critical'],
            label: 'Priority: High, Critical',
          },
        ],
        sortBy: 'priority',
        sortOrder: 'desc',
        isPublic: false,
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'user-1',
        usageCount: 15,
      },
      {
        id: 'saved-2',
        name: 'Overdue Tasks',
        description: 'Tasks that are past their due date',
        filters: [
          {
            id: 'f3',
            field: 'dueDate',
            operator: 'before',
            value: new Date().toISOString(),
            label: 'Due Date: Before Today',
          },
          {
            id: 'f4',
            field: 'status',
            operator: 'not_in',
            value: ['done', 'cancelled'],
            label: 'Status: Not Done',
          },
        ],
        sortBy: 'dueDate',
        sortOrder: 'asc',
        isPublic: true,
        isDefault: false,
        createdAt: '2024-01-02T00:00:00Z',
        createdBy: 'user-2',
        usageCount: 8,
      },
      {
        id: 'saved-3',
        name: "This Week's Tasks",
        description: 'Tasks due this week',
        filters: [
          {
            id: 'f5',
            field: 'dueDate',
            operator: 'between',
            value: {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            label: 'Due Date: This Week',
          },
        ],
        sortBy: 'dueDate',
        sortOrder: 'asc',
        isPublic: true,
        isDefault: true,
        createdAt: '2024-01-03T00:00:00Z',
        createdBy: 'system',
        usageCount: 23,
      },
    ];

    setSavedSearches(mockSavedSearches);
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.labels.some(label => label.toLowerCase().includes(query)) ||
          task.assignee?.name.toLowerCase().includes(query) ||
          task.projectName.toLowerCase().includes(query)
      );
    }

    // Apply advanced filters
    filters.forEach(filter => {
      result = result.filter(task => {
        const fieldValue = getNestedValue(task, filter.field);

        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'not_equals':
            return fieldValue !== filter.value;
          case 'contains':
            return Array.isArray(fieldValue)
              ? fieldValue.includes(filter.value)
              : String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'not_contains':
            return Array.isArray(fieldValue)
              ? !fieldValue.includes(filter.value)
              : !String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          case 'not_in':
            return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
          case 'before':
            return new Date(fieldValue) < new Date(filter.value);
          case 'after':
            return new Date(fieldValue) > new Date(filter.value);
          case 'between':
            const date = new Date(fieldValue);
            return date >= new Date(filter.value.start) && date <= new Date(filter.value.end);
          case 'greater_than':
            return Number(fieldValue) > Number(filter.value);
          case 'less_than':
            return Number(fieldValue) < Number(filter.value);
          case 'is_empty':
            return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
          case 'is_not_empty':
            return fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
          default:
            return true;
        }
      });
    });

    // Sort tasks
    result.sort((a, b) => {
      let aValue = getNestedValue(a, sortBy);
      let bValue = getNestedValue(b, sortBy);

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, searchQuery, filters, sortBy, sortOrder]);

  useEffect(() => {
    onTasksFiltered?.(filteredTasks);
  }, [filteredTasks, onTasksFiltered]);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const addFilter = (field: string, operator: string, value: any, label: string) => {
    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}`,
      field,
      operator,
      value,
      label,
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters([]);
    setSelectedSavedSearch('');
  };

  const applySavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setSortBy(savedSearch.sortBy);
    setSortOrder(savedSearch.sortOrder);
    setSelectedSavedSearch(savedSearch.id);

    // Increment usage count
    setSavedSearches(searches =>
      searches.map(s => (s.id === savedSearch.id ? { ...s, usageCount: s.usageCount + 1 } : s))
    );
  };

  const saveCurrentSearch = () => {
    if (!searchName.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: `saved-${Date.now()}`,
      name: searchName,
      description: searchDescription,
      filters: [...filters],
      sortBy,
      sortOrder,
      isPublic: false,
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      usageCount: 0,
    };

    setSavedSearches([...savedSearches, newSavedSearch]);
    setShowSaveSearchDialog(false);
    setSearchName('');
    setSearchDescription('');
  };

  const exportResults = () => {
    const csvContent = [
      ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Project', 'Due Date', 'Created'].join(','),
      ...filteredTasks.map(task =>
        [
          task.id,
          task.title,
          task.status,
          task.priority,
          task.assignee?.name || '',
          task.projectName,
          task.dueDate || '',
          task.createdAt,
        ]
          .map(field => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-search-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const availableFilters = [
    {
      group: 'Basic',
      fields: [
        {
          field: 'status',
          label: 'Status',
          type: 'select',
          options: ['todo', 'in-progress', 'review', 'done'],
        },
        {
          field: 'priority',
          label: 'Priority',
          type: 'select',
          options: ['low', 'medium', 'high', 'critical'],
        },
        { field: 'assignee.id', label: 'Assignee', type: 'select', options: [] },
        { field: 'reporter.id', label: 'Reporter', type: 'select', options: [] },
        { field: 'projectId', label: 'Project', type: 'select', options: [] },
      ],
    },
    {
      group: 'Dates',
      fields: [
        { field: 'dueDate', label: 'Due Date', type: 'date' },
        { field: 'createdAt', label: 'Created Date', type: 'date' },
        { field: 'updatedAt', label: 'Updated Date', type: 'date' },
      ],
    },
    {
      group: 'Values',
      fields: [
        { field: 'storyPoints', label: 'Story Points', type: 'number' },
        { field: 'estimatedHours', label: 'Estimated Hours', type: 'number' },
        { field: 'actualHours', label: 'Actual Hours', type: 'number' },
      ],
    },
    {
      group: 'Advanced',
      fields: [
        { field: 'labels', label: 'Labels', type: 'tags' },
        { field: 'attachments', label: 'Attachments', type: 'number' },
        { field: 'comments', label: 'Comments', type: 'number' },
        { field: 'isBookmarked', label: 'Bookmarked', type: 'boolean' },
      ],
    },
  ];

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'storyPoints', label: 'Story Points' },
    { value: 'estimatedHours', label: 'Estimated Hours' },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title, description, labels..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              filters.length > 0
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
            } border`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {filters.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {filters.length}
              </span>
            )}
          </button>

          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {allowSaveSearch && filters.length > 0 && (
            <button
              onClick={() => setShowSaveSearchDialog(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Save search"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={exportResults}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Export results"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.map(filter => (
              <span
                key={filter.id}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {filter.label}
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Saved Searches */}
      {showSavedSearches && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Saved Searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedSearches.map(savedSearch => (
              <div
                key={savedSearch.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSavedSearch === savedSearch.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => applySavedSearch(savedSearch)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {savedSearch.name}
                    </h4>
                    {savedSearch.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {savedSearch.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {savedSearch.filters.length} filters
                      </span>
                      <span className="text-xs text-gray-500">
                        Used {savedSearch.usageCount} times
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {savedSearch.isPublic && <Eye className="w-4 h-4 text-gray-400" />}
                    {savedSearch.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {availableFilters.map(group => (
              <div key={group.group}>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  {group.group}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.fields.map(fieldConfig => (
                    <div key={fieldConfig.field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {fieldConfig.label}
                      </label>
                      <div className="flex items-center space-x-2">
                        {fieldConfig.type === 'select' && (
                          <>
                            <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="equals">equals</option>
                              <option value="not_equals">not equals</option>
                              <option value="in">in</option>
                              <option value="not_in">not in</option>
                            </select>
                            <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="">Select value...</option>
                              {fieldConfig.options.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                        {fieldConfig.type === 'date' && (
                          <>
                            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="on">on</option>
                              <option value="before">before</option>
                              <option value="after">after</option>
                              <option value="between">between</option>
                            </select>
                            <input
                              type="date"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </>
                        )}
                        {fieldConfig.type === 'number' && (
                          <>
                            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="equals">equals</option>
                              <option value="greater_than">greater than</option>
                              <option value="less_than">less than</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Value"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </>
                        )}
                        <button className="p-2 text-blue-600 hover:text-blue-700">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
            {searchQuery && (
              <span className="text-sm text-gray-600 dark:text-gray-400">for "{searchQuery}"</span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
          </div>
        </div>
      </div>

      {/* Save Search Dialog */}
      {showSaveSearchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Save Search</h3>
              <button
                onClick={() => setShowSaveSearchDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Name
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter search name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={searchDescription}
                  onChange={e => setSearchDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe this search..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={saveCurrentSearch}
                  disabled={!searchName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Save Search
                </button>
                <button
                  onClick={() => setShowSaveSearchDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSearch;
