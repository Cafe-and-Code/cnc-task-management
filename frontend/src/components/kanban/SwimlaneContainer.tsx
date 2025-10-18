import React, { useState } from 'react';
import { SwimlaneHeader } from './SwimlaneHeader';
import { DetailedTaskCard } from './DetailedTaskCard';
import { QuickTaskModal } from './QuickTaskModal';

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  color: string;
  members: TeamMember[];
  capacity: number;
  leadId?: string;
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
  teamId: string;
  storyPoints: number;
  labels: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  comments?: Array<{
    id: string;
    author: {
      id: string;
      name: string;
      avatarUrl?: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

interface SwimlaneContainerProps {
  teams: Team[];
  tasks: Task[];
  columns: Array<{
    id: string;
    title: string;
    status: string;
    limit: number;
    color: string;
  }>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (teamId: string, columnId: string, task: any) => void;
  allTeamMembers: TeamMember[];
  viewMode: 'cards' | 'list';
  showEmptyTeams?: boolean;
  compact?: boolean;
}

export const SwimlaneContainer: React.FC<SwimlaneContainerProps> = ({
  teams,
  tasks,
  columns,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
  allTeamMembers,
  viewMode,
  showEmptyTeams = true,
  compact = false,
}) => {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(teams.map(t => t.id)));
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const handleAddMember = (teamId: string) => {
    // In a real implementation, this would open a member selection modal
    console.log('Add member to team:', teamId);
  };

  const handleTeamSettings = (teamId: string) => {
    // In a real implementation, this would open team settings
    console.log('Team settings for:', teamId);
  };

  const handleCreateTask = (teamId: string, columnId: string) => {
    setSelectedTeamId(teamId);
    setSelectedColumnId(columnId);
    setShowQuickAddModal(true);
  };

  const handleQuickTaskCreate = (taskData: any) => {
    onCreateTask(selectedTeamId, selectedColumnId, taskData);
    setShowQuickAddModal(false);
    setSelectedTeamId('');
    setSelectedColumnId('');
  };

  const getTasksForTeam = (teamId: string) => {
    return tasks.filter(task => task.teamId === teamId);
  };

  const getTasksForTeamAndColumn = (teamId: string, columnStatus: string) => {
    return tasks.filter(task => task.teamId === teamId && task.status === columnStatus);
  };

  const visibleTeams = showEmptyTeams
    ? teams
    : teams.filter(team => getTasksForTeam(team.id).length > 0);

  return (
    <div className="space-y-4">
      {visibleTeams.map(team => {
        const teamTasks = getTasksForTeam(team.id);
        const isExpanded = expandedTeams.has(team.id);

        return (
          <div
            key={team.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Swimlane Header */}
            <SwimlaneHeader
              teamId={team.id}
              teamName={team.name}
              members={team.members}
              taskCount={teamTasks.length}
              capacity={team.capacity}
              color={team.color}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleTeamExpansion(team.id)}
              onAddMember={() => handleAddMember(team.id)}
              onSettings={() => handleTeamSettings(team.id)}
              showAvatars={!compact}
              compact={compact}
            />

            {/* Swimlane Content */}
            {isExpanded && (
              <div className="min-h-0">
                {teamTasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No tasks assigned to {team.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Tasks assigned to this team will appear here organized by status.
                    </p>
                    <button
                      onClick={() => handleCreateTask(team.id, 'todo')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 p-4 min-w-max">
                      {columns.map(column => {
                        const columnTasks = getTasksForTeamAndColumn(team.id, column.status);

                        return (
                          <div
                            key={column.id}
                            className={`flex-shrink-0 w-80 ${
                              column.status === 'todo'
                                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                : column.status === 'in-progress'
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                  : column.status === 'testing'
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                                    : column.status === 'review'
                                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                            } rounded-lg border`}
                          >
                            {/* Column Header */}
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                    {column.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleCreateTask(team.id, column.status)}
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
                                  title={`Add task to ${team.name} - ${column.title}`}
                                >
                                  <span className="text-lg">+</span>
                                </button>
                              </div>
                            </div>

                            {/* Tasks */}
                            <div className="p-3 space-y-3 min-h-[200px]">
                              {columnTasks.length === 0 ? (
                                <div className="text-center py-8">
                                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-sm">📝</span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    No {column.title.toLowerCase()} tasks
                                  </p>
                                  <button
                                    onClick={() => handleCreateTask(team.id, column.status)}
                                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                  >
                                    Add task
                                  </button>
                                </div>
                              ) : (
                                columnTasks.map(task => (
                                  <DetailedTaskCard
                                    key={task.id}
                                    task={task}
                                    onUpdate={updates => onUpdateTask(task.id, updates)}
                                    onDelete={() => onDeleteTask(task.id)}
                                    onDuplicate={() => {
                                      const duplicatedTask = {
                                        ...task,
                                        id: `task-${Date.now()}`,
                                        title: `${task.title} (Copy)`,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                      };
                                      onCreateTask(team.id, column.status, duplicatedTask);
                                    }}
                                    onArchive={() => {
                                      console.log('Archive task:', task.id);
                                    }}
                                    isExpanded={false}
                                    onToggleExpand={() => {}}
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Quick Task Modal */}
      {showQuickAddModal && (
        <QuickTaskModal
          isOpen={showQuickAddModal}
          onClose={() => setShowQuickAddModal(false)}
          onCreateTask={handleQuickTaskCreate}
          columnId={selectedColumnId}
          columnName={columns.find(c => c.status === selectedColumnId)?.title || ''}
          teamMembers={allTeamMembers}
        />
      )}

      {/* Empty State */}
      {visibleTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No teams configured
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create teams to organize your Kanban board by swimlanes.
          </p>
          <button
            onClick={() => console.log('Create team')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Team
          </button>
        </div>
      )}
    </div>
  );
};
