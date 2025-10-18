import React, { useState } from 'react';
import {
  Settings,
  Eye,
  EyeOff,
  Layout,
  Palette,
  Filter,
  Columns,
  Users,
  Save,
  RotateCcw,
  Download,
  Upload,
  X,
  Check,
  Grid3x3,
  List,
  Archive,
  Clock,
  Tag,
  Flag,
} from 'lucide-react';

interface BoardView {
  id: string;
  name: string;
  columns: Array<{
    id: string;
    title: string;
    status: string;
    visible: boolean;
    width: number;
    color: string;
    limit: number;
  }>;
  swimlanes: {
    enabled: boolean;
    teamIds: string[];
    collapsedTeams: string[];
  };
  filters: {
    assignee: string[];
    priority: string[];
    labels: string[];
    teams: string[];
    status: string[];
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showAvatars: boolean;
    showStats: boolean;
    showTimeTracking: boolean;
    cardSize: 'small' | 'medium' | 'large';
    colorCoding: 'priority' | 'status' | 'assignee' | 'none';
  };
  layout: {
    viewMode: 'board' | 'list' | 'calendar';
    groupBy: 'status' | 'assignee' | 'priority' | 'team' | 'none';
    sortBy: 'created' | 'updated' | 'priority' | 'dueDate' | 'title';
    sortOrder: 'asc' | 'desc';
  };
}

interface BoardCustomizationProps {
  boardId: string;
  currentView: BoardView;
  availableTeams: Array<{ id: string; name: string }>;
  availableUsers: Array<{ id: string; name: string }>;
  onViewUpdate: (view: BoardView) => void;
  onSaveView: (view: BoardView) => void;
  onLoadView: (viewId: string) => void;
  onClose: () => void;
  className?: string;
}

export const BoardCustomization: React.FC<BoardCustomizationProps> = ({
  boardId,
  currentView,
  availableTeams,
  availableUsers,
  onViewUpdate,
  onSaveView,
  onLoadView,
  onClose,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<
    'columns' | 'swimlanes' | 'appearance' | 'layout' | 'filters'
  >('columns');
  const [customView, setCustomView] = useState<BoardView>(currentView);
  const [savedViews, setSavedViews] = useState<BoardView[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const tabs = [
    { id: 'columns', label: 'Columns', icon: Columns },
    { id: 'swimlanes', label: 'Swimlanes', icon: Users },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'filters', label: 'Filters', icon: Filter },
  ];

  const updateView = (updates: Partial<BoardView>) => {
    const updatedView = { ...customView, ...updates };
    setCustomView(updatedView);
    onViewUpdate(updatedView);
  };

  const updateColumn = (columnId: string, updates: Partial<(typeof customView.columns)[0]>) => {
    const updatedColumns = customView.columns.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    );
    updateView({ columns: updatedColumns });
  };

  const resetToDefaults = () => {
    const defaultView: BoardView = {
      id: 'default',
      name: 'Default View',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          status: 'todo',
          visible: true,
          width: 320,
          color: 'gray',
          limit: 10,
        },
        {
          id: 'progress',
          title: 'In Progress',
          status: 'in-progress',
          visible: true,
          width: 320,
          color: 'blue',
          limit: 5,
        },
        {
          id: 'testing',
          title: 'Testing',
          status: 'testing',
          visible: true,
          width: 320,
          color: 'purple',
          limit: 3,
        },
        {
          id: 'review',
          title: 'Review',
          status: 'review',
          visible: true,
          width: 320,
          color: 'orange',
          limit: 3,
        },
        {
          id: 'done',
          title: 'Done',
          status: 'done',
          visible: true,
          width: 320,
          color: 'green',
          limit: 20,
        },
      ],
      swimlanes: {
        enabled: false,
        teamIds: [],
        collapsedTeams: [],
      },
      filters: {
        assignee: [],
        priority: [],
        labels: [],
        teams: [],
        status: [],
      },
      appearance: {
        theme: 'auto',
        compactMode: false,
        showAvatars: true,
        showStats: true,
        showTimeTracking: true,
        cardSize: 'medium',
        colorCoding: 'priority',
      },
      layout: {
        viewMode: 'board',
        groupBy: 'status',
        sortBy: 'updated',
        sortOrder: 'desc',
      },
    };
    setCustomView(defaultView);
    onViewUpdate(defaultView);
  };

  const saveView = () => {
    if (!newViewName.trim()) return;

    const viewToSave = {
      ...customView,
      name: newViewName.trim(),
      id: `view_${Date.now()}`,
    };

    onSaveView(viewToSave);
    setSavedViews(prev => [...prev, viewToSave]);
    setNewViewName('');
    setShowSaveDialog(false);
  };

  const loadView = (view: BoardView) => {
    setCustomView(view);
    onViewUpdate(view);
    onLoadView(view.id);
  };

  const exportView = () => {
    const dataStr = JSON.stringify(customView, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-view-${customView.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importView = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedView = JSON.parse(e.target?.result as string);
        setCustomView(importedView);
        onViewUpdate(importedView);
      } catch (error) {
        console.error('Failed to import view:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Board Customization
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetToDefaults}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={exportView}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export view"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Import view"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={importView} className="hidden" />
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 p-6 pb-0 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Column Configuration
              </h3>
              <div className="space-y-3">
                {customView.columns.map((column, index) => (
                  <div
                    key={column.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={column.title}
                        onChange={e => updateColumn(column.id, { title: e.target.value })}
                        className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
                      />
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={e => updateColumn(column.id, { visible: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {column.visible ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          value={column.width}
                          onChange={e =>
                            updateColumn(column.id, { width: parseInt(e.target.value) || 320 })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          min="200"
                          max="600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          WIP Limit
                        </label>
                        <input
                          type="number"
                          value={column.limit}
                          onChange={e =>
                            updateColumn(column.id, { limit: parseInt(e.target.value) || 10 })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          min="1"
                          max="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Color
                        </label>
                        <select
                          value={column.color}
                          onChange={e => updateColumn(column.id, { color: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="gray">Gray</option>
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="yellow">Yellow</option>
                          <option value="red">Red</option>
                          <option value="purple">Purple</option>
                          <option value="orange">Orange</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Status: {column.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newColumns = [...customView.columns];
                            const [movedColumn] = newColumns.splice(index, 1);
                            newColumns.splice(Math.max(0, index - 1), 0, movedColumn);
                            updateView({ columns: newColumns });
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => {
                            const newColumns = [...customView.columns];
                            const [movedColumn] = newColumns.splice(index, 1);
                            newColumns.splice(
                              Math.min(newColumns.length - 1, index + 1),
                              0,
                              movedColumn
                            );
                            updateView({ columns: newColumns });
                          }}
                          disabled={index === customView.columns.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'swimlanes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Swimlane Configuration
              </h3>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Enable Swimlanes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Group tasks by teams horizontally
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customView.swimlanes.enabled}
                    onChange={e =>
                      updateView({
                        swimlanes: { ...customView.swimlanes, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {customView.swimlanes.enabled && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Select Teams</h4>
                    <div className="space-y-2">
                      {availableTeams.map(team => (
                        <label
                          key={team.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={customView.swimlanes.teamIds.includes(team.id)}
                            onChange={e => {
                              const teamIds = e.target.checked
                                ? [...customView.swimlanes.teamIds, team.id]
                                : customView.swimlanes.teamIds.filter(id => id !== team.id);
                              updateView({
                                swimlanes: { ...customView.swimlanes, teamIds },
                              });
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-900 dark:text-white">{team.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Appearance Settings
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Theme
                  </label>
                  <select
                    value={customView.appearance.theme}
                    onChange={e =>
                      updateView({
                        appearance: { ...customView.appearance, theme: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Card Size
                  </label>
                  <select
                    value={customView.appearance.cardSize}
                    onChange={e =>
                      updateView({
                        appearance: { ...customView.appearance, cardSize: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color Coding
                  </label>
                  <select
                    value={customView.appearance.colorCoding}
                    onChange={e =>
                      updateView({
                        appearance: {
                          ...customView.appearance,
                          colorCoding: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="assignee">Assignee</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    View Mode
                  </label>
                  <select
                    value={customView.layout.viewMode}
                    onChange={e =>
                      updateView({
                        layout: { ...customView.layout, viewMode: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="board">Board</option>
                    <option value="list">List</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Display Options</h4>

                <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                  <span className="text-gray-900 dark:text-white">Compact Mode</span>
                  <input
                    type="checkbox"
                    checked={customView.appearance.compactMode}
                    onChange={e =>
                      updateView({
                        appearance: { ...customView.appearance, compactMode: e.target.checked },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                  <span className="text-gray-900 dark:text-white">Show Avatars</span>
                  <input
                    type="checkbox"
                    checked={customView.appearance.showAvatars}
                    onChange={e =>
                      updateView({
                        appearance: { ...customView.appearance, showAvatars: e.target.checked },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                  <span className="text-gray-900 dark:text-white">Show Statistics</span>
                  <input
                    type="checkbox"
                    checked={customView.appearance.showStats}
                    onChange={e =>
                      updateView({
                        appearance: { ...customView.appearance, showStats: e.target.checked },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
                  <span className="text-gray-900 dark:text-white">Show Time Tracking</span>
                  <input
                    type="checkbox"
                    checked={customView.appearance.showTimeTracking}
                    onChange={e =>
                      updateView({
                        appearance: {
                          ...customView.appearance,
                          showTimeTracking: e.target.checked,
                        },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Layout Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group By
                  </label>
                  <select
                    value={customView.layout.groupBy}
                    onChange={e =>
                      updateView({
                        layout: { ...customView.layout, groupBy: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="status">Status</option>
                    <option value="assignee">Assignee</option>
                    <option value="priority">Priority</option>
                    <option value="team">Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <select
                    value={customView.layout.sortBy}
                    onChange={e =>
                      updateView({
                        layout: { ...customView.layout, sortBy: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="created">Created Date</option>
                    <option value="updated">Updated Date</option>
                    <option value="priority">Priority</option>
                    <option value="dueDate">Due Date</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <select
                    value={customView.layout.sortOrder}
                    onChange={e =>
                      updateView({
                        layout: { ...customView.layout, sortOrder: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Default Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Assignee
                  </h4>
                  <div className="space-y-2">
                    {availableUsers.map(user => (
                      <label key={user.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customView.filters.assignee.includes(user.id)}
                          onChange={e => {
                            const assignee = e.target.checked
                              ? [...customView.filters.assignee, user.id]
                              : customView.filters.assignee.filter(id => id !== user.id);
                            updateView({
                              filters: { ...customView.filters, assignee },
                            });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white">{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    Priority
                  </h4>
                  <div className="space-y-2">
                    {['low', 'medium', 'high', 'critical'].map(priority => (
                      <label key={priority} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={customView.filters.priority.includes(priority)}
                          onChange={e => {
                            const priorities = e.target.checked
                              ? [...customView.filters.priority, priority]
                              : customView.filters.priority.filter(p => p !== priority);
                            updateView({
                              filters: { ...customView.filters, priority: priorities },
                            });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save View</span>
            </button>

            {savedViews.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Saved views:</span>
                <select
                  onChange={e => {
                    const view = savedViews.find(v => v.id === e.target.value);
                    if (view) loadView(view);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Load saved view...</option>
                  {savedViews.map(view => (
                    <option key={view.id} value={view.id}>
                      {view.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onViewUpdate(customView)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>

      {/* Save View Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Save Current View
            </h3>
            <input
              type="text"
              value={newViewName}
              onChange={e => setNewViewName(e.target.value)}
              placeholder="Enter view name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewViewName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveView}
                disabled={!newViewName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
