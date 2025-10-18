import React, { useState, useEffect, useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { arrayMove } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import { Plus, MoreHorizontal, Calendar, Users, Filter, Download, Settings, Eye, EyeOff, Column, Rows, Search, Clock, AlertCircle, CheckCircle, XCircle, Target, User } from 'lucide-react'
import { DetailedTaskCard } from '../kanban/DetailedTaskCard'
import { QuickTaskModal } from '../kanban/QuickTaskModal'
import { WIPLimitsIndicator } from '../kanban/WIPLimitsIndicator'
import { WIPManagementPanel } from '../kanban/WIPManagementPanel'

// Types
interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'testing' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: {
    id: string
    name: string
    avatarUrl?: string
    role: string
  }
  reporter: {
    id: string
    name: string
    avatarUrl?: string
    role: string
  }
  storyPoints: number
  labels: string[]
  dueDate?: string
  createdAt: string
  updatedAt: string
  estimatedHours?: number
  actualHours?: number
  blockedBy?: string[]
  dependencies?: string[]
  tags: string[]
  subtasks?: Array<{
    id: string
    title: string
    completed: boolean
  }>
  attachments: Array<{
    id: string
    name: string
    type: string
    size: number
  }>
}

interface Column {
  id: string
  title: string
  status: string
  limit: number
  color: string
  order: number
  tasks: Task[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: string
}

interface KanbanBoardProps {
  projectId?: string
  sprintId?: string
  filter?: {
    assignee?: string
    label?: string
    priority?: string
    search?: string
  }
}

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  onMoveTask: (taskId: string, newStatus: string) => void
  onCreateTask: (columnId: string, task: any) => void
  teamMembers: TeamMember[]
  viewMode: 'cards' | 'list'
}

// Droppable column wrapper
const DroppableColumn: React.FC<{ column: Column; children: React.ReactNode }> = ({ column, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
    >
      {children}
    </div>
  )
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onCreateTask,
  teamMembers,
  viewMode
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)

  const { setNodeRef } = useSortable({ id: column.id })

  const filteredTasks = tasks.filter(task => {
    if (isCollapsed) return false
    return true
  })

  const getColorClasses = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      case 'in-progress':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
      case 'testing':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
      case 'review':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
      case 'done':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getHeaderColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-gray-700 dark:text-gray-300'
      case 'in-progress': return 'text-blue-700 dark:text-blue-300'
      case 'testing': return 'text-purple-700 dark:text-purple-300'
      case 'review': return 'text-orange-700 dark:text-orange-300'
      case 'done': return 'text-green-700 dark:text-green-300'
      default: return 'text-gray-700 dark:text-gray-300'
    }
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    return `${hours.toFixed(1)}h`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Rows className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'testing': return <CheckCircle className="w-4 h-4" />
      case 'review': return <Eye className="w-4 h-4" />
      case 'done': return <CheckCircle className="w-4 h-4" />
      default: return <Rows className="w-4 h-4" />
    }
  }

  const handleCreateTask = (taskData: any) => {
    onCreateTask(column.id, taskData)
  }

  const handleExpandTask = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  return (
    <div className={`flex-shrink-0 w-80 ${getColorClasses(column.status)}`}>
      {/* Column Header */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${getHeaderColor(column.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(column.status)}
            <div>
              <h3 className="font-medium">{column.title}</h3>
              <p className="text-xs opacity-75">
                {filteredTasks.length} / {column.limit} tasks
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {column.limit - filteredTasks.length <= 3 && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {column.limit - filteredTasks.length} left
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: isCollapsed ? 'auto' : '400px' }}>
        {isCollapsed ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <EyeOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Column collapsed</p>
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Show tasks
            </button>
          </div>
        ) : (
          <SortableContext
            items={filteredTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-2 space-y-2">
              {filteredTasks.map((task) => (
                <DetailedTaskCard
                  key={task.id}
                  task={task}
                  onUpdate={(updates) => onUpdateTask(task.id, updates)}
                  onDelete={() => onDeleteTask(task.id)}
                  onDuplicate={() => {
                    const duplicatedTask = {
                      ...task,
                      id: `task-${Date.now()}`,
                      title: `${task.title} (Copy)`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                    onCreateTask(column.id, duplicatedTask)
                  }}
                  onArchive={() => {
                    // In a real implementation, this would archive the task
                    console.log('Archive task:', task.id)
                  }}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() => handleExpandTask(task.id)}
                />
              ))}
              <button
                onClick={() => setShowQuickAddModal(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </SortableContext>

          {/* Quick Task Modal */}
          {showQuickAddModal && (
            <QuickTaskModal
              isOpen={showQuickAddModal}
              onClose={() => setShowQuickAddModal(false)}
              onCreateTask={handleCreateTask}
              columnId={column.id}
              columnName={column.title}
              teamMembers={teamMembers}
            />
          )}
        )}
      </div>

      {/* Column Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTasks.length} tasks
          </span>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {filteredTasks.length > 0 && (
              <span>{filteredTasks.length} days</span>
            )}
          </div>
        </div>

        {/* WIP Limits Indicator */}
        <WIPLimitsIndicator
          columnId={column.id}
          columnTitle={column.title}
          currentCount={filteredTasks.length}
          limit={column.limit}
          onLimitChange={(newLimit) => {
            // This will be handled by the parent component
            const event = new CustomEvent('columnLimitChange', {
              detail: { columnId: column.id, newLimit }
            })
            window.dispatchEvent(event)
          }}
          compact={true}
        />
      </div>
    </div>
  )
}

export const KanbanBoardPage: React.FC<KanbanBoardProps> = ({
  projectId,
  sprintId,
  filter
}) => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      status: 'todo',
      limit: 10,
      color: 'gray',
      order: 0,
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      limit: 5,
      color: 'blue',
      order: 1,
      tasks: []
    },
    {
      id: 'testing',
      title: 'Testing',
      status: 'testing',
      limit: 3,
      color: 'purple',
      order: 2,
      tasks: []
    },
    {
      id: 'review',
      title: 'Review',
      status: 'review',
      limit: 3,
      color: 'orange',
      order: 3,
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      limit: 15,
      color: 'green',
      order: 4,
      tasks: []
    }
  ])

  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [showColumnLimits, setShowColumnLimits] = useState(true)
  const [showWIPPanel, setShowWIPPanel] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Handle column limit changes from child components
  useEffect(() => {
    const handleColumnLimitChange = (event: CustomEvent) => {
      const { columnId, newLimit } = event.detail
      handleColumnLimitChange(columnId, newLimit)
    }

    window.addEventListener('columnLimitChange', handleColumnLimitChange as EventListener)
    return () => {
      window.removeEventListener('columnLimitChange', handleColumnLimitChange as EventListener)
    }
  }, [])

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Implement user authentication system',
        description: 'Build secure login, registration, and password reset functionality with JWT tokens',
        status: 'todo',
        priority: 'high',
        assignee: {
          id: 'user-1',
          name: 'John Developer',
          role: 'Developer'
        },
        reporter: {
          id: 'user-2',
          name: 'Jane Product',
          role: 'Product Owner'
        },
        storyPoints: 8,
        labels: ['backend', 'security'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        estimatedHours: 16,
        actualHours: 14,
        subtasks: [
          { id: 'sub-1-1', title: 'Create login API endpoint', completed: true },
          { id: 'sub-1-2', title: 'Implement JWT token management', completed: true },
          { id: 'sub-1-3', title: 'Add password reset functionality', completed: false }
        ],
        tags: ['authentication']
      },
      {
        id: 'task-2',
        title: 'Design database schema for user management',
        description: 'Create comprehensive database schema for users, roles, and permissions',
        status: 'in-progress',
        priority: 'medium',
        assignee: {
          id: 'user-3',
          name: 'Sarah DBA',
          role: 'Database Architect'
        },
        reporter: {
          id: 'user-4',
          name: 'Mike Architect',
          role: 'Technical Lead'
        },
        storyPoints: 5,
        labels: ['database', 'design'],
        createdAt: '2024-01-16T09:00:00Z',
        updatedAt: 'updatedAt',
        estimatedHours: 8,
        actualHours: 6,
        tags: ['design']
      },
      {
        id: 'task-3',
        title: 'Create responsive dashboard layout',
        description: 'Design and implement a responsive dashboard with key metrics and charts',
        status: 'todo',
        priority: 'medium',
        assignee: {
          id: 'user-5',
          name: 'Lisa Designer',
          role: 'UI/UX Designer'
        },
        reporter: {
          id: 'user-2',
          name: 'Jane Product',
          role: 'Product Owner'
        },
        storyPoints: 13,
        labels: ['frontend', 'design'],
        createdAt: '2024-01-17T14:00:00Z',
        updatedAt: '2024-01-17T14:00:00Z',
        estimatedHours: 20,
        tags: ['design']
      },
      {
        id: 'task-4',
        title: 'Setup testing framework and CI/CD pipeline',
        description: 'Configure automated testing, code quality checks, and deployment pipeline',
        status: 'todo',
        priority: 'high',
        assignee: {
          id: 'user-6',
          name: 'Tom QA',
          role: 'QA Engineer'
        },
        reporter: {
          id: 'user-7',
          name: 'Rick DevOps',
          role: 'DevOps Engineer'
        },
        storyPoints: 3,
        labels: ['testing', 'devops'],
        createdAt: '2024-01-18T11:00:00Z',
        updatedAt: '2024-01-18T11:00:00Z',
        estimatedHours: 6,
        tags: ['testing']
      },
      {
        id: 'task-5',
        title: 'Write comprehensive API documentation',
        description: 'Create detailed documentation for all API endpoints and usage examples',
        status: 'review',
        priority: 'low',
        assignee: {
          id: 'user-8',
          name: 'Amy Writer',
          role: 'Technical Writer'
        },
        reporter: {
          id: 'user-9',
          name: 'Bob Manager',
          role: 'Project Manager'
        },
        storyPoints: 2,
        labels: ['documentation'],
        createdAt: '2024-01-19T16:00:00Z',
        updatedAt: 'updatedAt',
        estimatedHours: 4,
        tags: ['documentation']
      }
    ]

    const mockTeamMembers: TeamMember[] = [
      {
        id: 'user-1',
        name: 'John Developer',
        email: 'john@example.com',
        role: 'Developer',
        avatarUrl: 'https://api.dicebear.com/7y7v5w3?seed=john'
      },
      {
        id: 'user-2',
        name: 'Jane Product',
        email: 'jane@example.com',
        role: 'Product Owner',
        avatarUrl: 'https://api.dicebear.com/7h7v5w3?seed=jane'
      },
      {
        id: 'user-3',
        name: 'Sarah DBA',
        email: 'sarah@example.com',
        role: 'Database Architect',
        avatarUrl: 'https://api.dicebear.com/5h7v5w3?seed=sarah'
      },
      {
        id: 'user-4',
        name: 'Mike Architect',
        email: 'mike@example.com',
        role: 'Technical Lead',
        avatarUrl: 'https://api.dicebear.com/3h7v5w3?seed=mike'
      }
    ]

    // Filter tasks based on props
    const filteredTasks = mockTasks.filter(task => {
      if (filter?.assignee && task.assignee?.id !== filter.assignee) return false
      if (filter?.priority && task.priority !== filter.priority) return false
      if (filter?.label && !task.labels.includes(filter.label)) return false
      if (filter?.search) {
        const searchLower = filter.search.toLowerCase()
        return task.title.toLowerCase().includes(searchLower) ||
               task.description.toLowerCase().includes(searchLower)
      }
      return true
    })

    // Distribute tasks to columns based on status
    const distributedTasks = filteredTasks.reduce((acc, task) => {
      const column = acc.find(col => col.status === task.status)
      if (column) {
        const columnTasks = acc.find(col => col.id === column.id)?.tasks || []
        const updatedColumns = acc.map(col => {
          if (col.id === column.id) {
            return { ...col, tasks: [...columnTasks, task] }
          }
          return col
        })
        return updatedColumns
      }
      return acc
    }, columns)

    setTasks(distributedTasks)
    setTeamMembers(mockTeamMembers)
    setIsLoading(false)
  }, [projectId, sprintId, filter])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Find the task being moved
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Check if dropping on a column
    const destColumn = columns.find(col => col.id === overId)
    if (destColumn) {
      // Move task to new column
      handleMoveTask(taskId, destColumn.status)
      return
    }

    // Check if dropping on another task (reorder within same column)
    const overTask = tasks.find(t => t.id === overId)
    if (overTask && task.status === overTask.status) {
      // Reorder tasks within the same column
      const taskIndex = tasks.findIndex(t => t.id === taskId)
      const overIndex = tasks.findIndex(t => t.id === overId)

      const newTasks = arrayMove(tasks, taskIndex, overIndex)
      setTasks(newTasks)

      // Update column tasks order
      setColumns(prev => prev.map(column => {
        if (column.status === task.status) {
          const columnTasks = newTasks.filter(t => t.status === column.status)
          return { ...column, tasks: columnTasks }
        }
        return column
      }))
    }
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    ))

    // Also update in columns
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    }))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => task.id !== taskId)
    })))
  }

  const handleMoveTask = (taskId: string, newStatus: string) => {
    const destColumn = columns.find(col => col.status === newStatus)
    if (!destColumn) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Check if destination column is at capacity
    if (destColumn.tasks.length >= destColumn.limit) {
      console.log('Column at capacity')
      return
    }

    // Remove from current column
    const updatedColumns = columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(t => t.id !== taskId)
    }))

    // Add to new column
    const updatedDestColumn = {
      ...destColumn,
      tasks: [...destColumn.tasks, { ...task, status: newStatus as Task['status'] }]
    }

    setColumns(prev => prev.map(col =>
      col.id === updatedDestColumn.id ? updatedDestColumn :
      updatedColumns.find(c => c.id === col.id) || col
    ))

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    ))
  }

  const handleCreateTask = (columnId: string, taskData: any) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      comments: [],
      attachments: []
    }

    setTasks(prev => [...prev, newTask])

    // Add to column
    setColumns(prev => prev.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: [...column.tasks, newTask]
        }
      }
      return column
    }))
  }

  const handleColumnLimitChange = (columnId: string, newLimit: number) => {
    setColumns(prev => prev.map(column =>
      column.id === columnId ? { ...column, limit: newLimit } : column
    ))
  }

  const handleDrop = (columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column) return

    const availableTasks = tasks.filter(task => {
      const isAssigned = task.assignee && !task.assignee.id.startsWith('user-')
      return isAssigned || !task.assignee
    })

    // Add up to column limit - current tasks
    const tasksToAdd = availableTasks.slice(0, column.limit - column.tasks.length)

    if (tasksToAdd.length > 0) {
      setColumns(prev => prev.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [...col.tasks, ...tasksToAdd.map(task => ({
              ...task,
              status: column.status as Task['status']
            }))]
          }
        }
        return col
      }))

      setTasks(prev => [
        ...prev.filter(task => !tasksToAdd.find(t => t.id === task.id)),
        ...tasksToAdd.map(task => ({
          ...task,
          status: column.status as Task['status']
        }))
      ])
    }
  }

  const totalStoryPoints = useMemo(() => {
    return tasks.reduce((sum, task) => sum + task.storyPoints, 0)
  }, [tasks])

  const totalTasks = useMemo(() => tasks.length, [tasks])

  const tasksByStatus = useMemo(() => {
    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      testing: 0,
      review: 0,
      done: 0
    }

    tasks.forEach(task => {
      statusCounts[task.status]++
    })

    return statusCounts
  }, [tasks])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visual workflow management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Target className="w-4 h-4" />
            <span>{totalTasks} tasks</span>
            <span>({totalStoryPoints} points)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{teamMembers.length} members</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowWIPPanel(!showWIPPanel)}
              className={`p-2 rounded-lg transition-colors ${
                showWIPPanel
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="WIP Management"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
            <Link
              to="/kanban/settings"
              className="p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button className="p-2 text-gray-600 hover:text-gray-800 dark:hover:text-gray-200">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WIP Management Panel */}
        {showWIPPanel && (
          <div className="px-4 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <WIPManagementPanel
              columns={columns.map(col => ({
                ...col,
                averageTime: Math.random() * 24 + 8, // Mock data: 8-32 hours
                throughput: Math.random() * 3 + 1 // Mock data: 1-4 tasks per day
              }))}
              onLimitChange={handleColumnLimitChange}
              onRefresh={() => {
                // In a real implementation, this would refresh the data
                console.log('Refreshing WIP data...')
              }}
            />
          </div>
        )}

        {/* Filters */}
        <div className="px-4 pb-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filter?.search || ''}
                onChange={(e) => {
                  // In a real implementation, this would update the filter
                  console.log('Search:', e.target.value)
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
              />
            </div>
            <select
              value={filter?.assignee || ''}
              onChange={(e) => {
                // In a real implementation, this would update the filter
                console.log('Filter by assignee:', e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Assignees</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <select
              value={filter?.priority || ''}
              onChange={(e) => {
                // In a real implementation, this would update the filter
                console.log('Filter by priority:', e.target.value)
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={() => setShowColumnLimits(!showColumnLimits)}
              className={`p-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                showColumnLimits
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Column className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="px-4 pb-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-800 text-brand-primary'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-brand-primary'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 p-4 min-w-max h-full">
              {columns.map((column) => (
                <DroppableColumn key={column.id} column={column}>
                  <KanbanColumn
                    column={column}
                    tasks={column.tasks}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onMoveTask={handleMoveTask}
                    onCreateTask={handleCreateTask}
                    teamMembers={teamMembers}
                    viewMode={viewMode}
                  />
                </DroppableColumn>
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="transform rotate-6 opacity-95">
                <DetailedTaskCard
                  task={activeTask}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onArchive={() => {}}
                  isExpanded={false}
                  onToggleExpand={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Column Limits Indicator */}
        {showColumnLimits && (
          <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={`text-sm ${
                    column.tasks.length >= column.limit
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {column.title}: {column.tasks.length}/{column.limit}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Stats */}
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {tasksByStatus.todo}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                To Do
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {tasksByStatus['in-progress']}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                In Progress
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {tasksByStatus.testing}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Testing
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {tasksByStatus.review}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Review
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {tasksByStatus.done}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Done
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}