import React, { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  User,
  Calendar,
  Flag,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Move,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

interface Subtask {
  id: string
  title: string
  description?: string
  completed: boolean
  assignee?: {
    id: string
    name: string
    avatarUrl?: string
    role: string
  }
  estimatedHours?: number
  actualHours?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  order: number
}

interface TeamMember {
  id: string
  name: string
  avatarUrl?: string
  role: string
}

interface SubtaskManagerProps {
  taskId: string
  subtasks: Subtask[]
  teamMembers: TeamMember[]
  onCreateSubtask: (subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void
  onDeleteSubtask: (subtaskId: string) => void
  onReorderSubtasks: (subtaskIds: string[]) => void
  isReadOnly?: boolean
  className?: string
  compact?: boolean
  showProgress?: boolean
}

export const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  taskId,
  subtasks,
  teamMembers,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onReorderSubtasks,
  isReadOnly = false,
  className = '',
  compact = false,
  showProgress = true
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [newEstimatedHours, setNewEstimatedHours] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [sortBy, setSortBy] = useState<'order' | 'dueDate' | 'priority' | 'completed'>('order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterAssignee, setFilterAssignee] = useState<string>('')
  const [showCompleted, setShowCompleted] = useState(true)

  // Sort and filter subtasks
  const processedSubtasks = React.useMemo(() => {
    let filtered = subtasks.filter(subtask => {
      if (!showCompleted && subtask.completed) return false
      if (filterAssignee && subtask.assignee?.id !== filterAssignee) return false
      return true
    })

    return filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'order':
          comparison = a.order - b.order
          break
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'priority':
          // Priority could be inferred from task metadata or other logic
          comparison = 0
          break
        case 'completed':
          comparison = (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
          break
        default:
          comparison = a.order - b.order
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }, [subtasks, sortBy, sortOrder, showCompleted, filterAssignee])

  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const handleCreateSubtask = () => {
    if (!newSubtask.trim()) return

    const subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt' | 'order'> = {
      title: newSubtask.trim(),
      description: newDescription.trim() || undefined,
      completed: false,
      assignee: newAssignee ? teamMembers.find(m => m.id === newAssignee) : undefined,
      estimatedHours: newEstimatedHours ? parseFloat(newEstimatedHours) : undefined,
      dueDate: newDueDate || undefined,
      order: subtasks.length
    }

    onCreateSubtask(subtask)
    setShowAddForm(false)
    setNewSubtask('')
    setNewDescription('')
    setNewAssignee('')
    setNewEstimatedHours('')
    setNewDueDate('')
  }

  const handleToggleComplete = (subtaskId: string) => {
    const subtask = subtasks.find(st => st.id === subtaskId)
    if (!subtask) return

    const now = new Date().toISOString()
    onUpdateSubtask(subtaskId, {
      completed: !subtask.completed,
      completedAt: !subtask.completed ? now : undefined,
      updatedAt: now
    })
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    const subtask = subtasks.find(st => st.id === subtaskId)
    if (!subtask) return

    if (confirm(`Are you sure you want to delete "${subtask.title}"?`)) {
      onDeleteSubtask(subtaskId)
    }
  }

  const handleEditSubtask = (subtaskId: string) => {
    const subtask = subtasks.find(st => st.id === subtaskId)
    if (!subtask) return

    setEditingSubtask(subtaskId)
    setNewSubtask(subtask.title)
    setNewDescription(subtask.description || '')
    setNewAssignee(subtask.assignee?.id || '')
    setNewEstimatedHours(subtask.estimatedHours?.toString() || '')
    setNewDueDate(subtask.dueDate || '')
  }

  const handleSaveEdit = () => {
    if (!editingSubtask || !newSubtask.trim()) return

    onUpdateSubtask(editingSubtask, {
      title: newSubtask.trim(),
      description: newDescription.trim() || undefined,
      assignee: newAssignee ? teamMembers.find(m => m.id === newAssignee) : undefined,
      estimatedHours: newEstimatedHours ? parseFloat(newEstimatedHours) : undefined,
      dueDate: newDueDate || undefined,
      updatedAt: new Date().toISOString()
    })

    setEditingSubtask(null)
    setNewSubtask('')
    setNewDescription('')
    setNewAssignee('')
    setNewEstimatedHours('')
    setNewDueDate('')
  }

  const handleCancelEdit = () => {
    setEditingSubtask(null)
    setNewSubtask('')
    setNewDescription('')
    setNewAssignee('')
    setNewEstimatedHours('')
    setNewDueDate('')
  }

  const handleMoveSubtask = (subtaskId: string, direction: 'up' | 'down') => {
    const currentIndex = processedSubtasks.findIndex(st => st.id === subtaskId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= processedSubtasks.length) return

    const reorderedSubtasks = [...processedSubtasks]
    const [movedSubtask] = reorderedSubtasks.splice(currentIndex, 1)
    reorderedSubtasks.splice(newIndex, 0, movedSubtask)

    const newOrder = reorderedSubtasks.map((st, index) => ({
      ...st,
      order: index
    }))

    onReorderSubtasks(newOrder.map(st => st.id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (hours?: number) => {
    if (!hours) return '0h'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const getAssigneeInfo = (assigneeId?: string) => {
    return teamMembers.find(m => m.id === assigneeId)
  }

  const getStatusColor = (completed: boolean, dueDate?: string) => {
    if (completed) return 'text-green-600 dark:text-green-400'
    if (dueDate && new Date(dueDate) < new Date()) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getStatusIcon = (completed: boolean, dueDate?: string) => {
    if (completed) return <CheckCircle2 className="w-4 h-4" />
    if (dueDate && new Date(dueDate) < new Date()) return <AlertCircle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subtasks</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>

          {showProgress && (
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Add subtask"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Controls */}
      {!compact && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isReadOnly}
              >
                <option value="order">Order</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="completed">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                disabled={isReadOnly}
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Filter:</label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Members</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
                disabled={isReadOnly}
              />
              <label className="text-sm text-gray-600 dark:text-gray-400">Show completed</label>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {formatTime(subtasks.reduce((sum, st) => sum + (st.actualHours || 0), 0))}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {formatTime(subtasks.reduce((sum, st) => sum + (st.estimatedHours || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Subtask Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Enter subtask title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreateSubtask()}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter description (optional)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Est. Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newEstimatedHours}
                  onChange={(e) => setNewEstimatedHours(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewSubtask('')
                  setNewDescription('')
                  setNewAssignee('')
                  setNewEstimatedHours('')
                  setNewDueDate('')
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubtask}
                disabled={!newSubtask.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add Subtask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {processedSubtasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Circle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm">No subtasks yet</p>
            <p className="text-xs mt-1">Add subtasks to break down this task into smaller pieces</p>
          </div>
        ) : (
          processedSubtasks.map((subtask, index) => {
            const isEditing = editingSubtask === subtask.id
            const assigneeInfo = getAssigneeInfo(subtask.assignee?.id)

            return (
              <div
                key={subtask.id}
                className={`p-4 ${compact ? 'py-3' : ''} ${
                  subtask.completed ? 'bg-green-50 dark:bg-green-900/10' : ''
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Subtask title..."
                    />

                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Enter description..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={newEstimatedHours}
                        onChange={(e) => setNewEstimatedHours(e.target.value)}
                        placeholder="Est. hours"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'}`}>
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleMoveSubtask(subtask.id, 'up')}
                        disabled={index === 0 || isReadOnly}
                        className={`p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 ${index === 0 ? 'invisible' : ''}`}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveSubtask(subtask.id, 'down')}
                        disabled={index === processedSubtasks.length - 1 || isReadOnly}
                        className={`p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 ${index === processedSubtasks.length - 1 ? 'invisible' : ''}`}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleComplete(subtask.id)}
                      disabled={isReadOnly}
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(subtask.completed, subtask.dueDate)}
                        <p className={`text-sm font-medium ${
                          subtask.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {subtask.title}
                        </p>

                        {subtask.completed && subtask.completedAt && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Completed {formatDate(subtask.completedAt)}
                          </span>
                        )}
                      </div>

                      {subtask.description && !compact && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {subtask.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 mt-1">
                        {assigneeInfo && (
                          <div className="flex items-center space-x-1">
                            {assigneeInfo.avatarUrl ? (
                              <img
                                src={assigneeInfo.avatarUrl}
                                alt={assigneeInfo.name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                  {assigneeInfo.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {assigneeInfo.name}
                            </span>
                          </div>
                        )}

                        {subtask.estimatedHours && !compact && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Est: {formatTime(subtask.estimatedHours)}
                          </div>
                        )}

                        {subtask.actualHours && !compact && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Actual: {formatTime(subtask.actualHours)}
                          </div>
                        )}

                        {subtask.dueDate && (
                          <div className={`flex items-center space-x-1 text-xs ${getStatusColor(subtask.completed, subtask.dueDate)}`}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(subtask.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isReadOnly && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditSubtask(subtask.id)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        )}
      </div>

      {/* Summary Footer */}
      {!compact && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Progress: {Math.round(progressPercentage)}%</span>
              <span>•</span>
              <span>{completedSubtasks} of {totalSubtasks} completed</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Total Est: {formatTime(subtasks.reduce((sum, st) => sum + (st.estimatedHours || 0), 0))}</span>
              <span>•</span>
              <span>Total Actual: {formatTime(subtasks.reduce((sum, st) => sum + (st.actualHours || 0), 0))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact subtask list widget
export const CompactSubtaskList: React.FC<{
  taskId: string
  subtasks: Subtask[]
  onToggleComplete: (subtaskId: string) => void
  className?: string
}> = ({ taskId, subtasks, onToggleComplete, className = '' }) => {
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Subtasks</h4>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {completedSubtasks}/{totalSubtasks}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
        <div
          className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {subtasks.slice(0, 5).map(subtask => (
          <div
            key={subtask.id}
            className="flex items-center space-x-2 p-1"
          >
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => onToggleComplete(subtask.id)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-xs truncate ${
                subtask.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
              }`}>
                {subtask.title}
              </p>
              {subtask.assignee && (
                <span className="text-xs text-gray-500 truncate">
                  {subtask.assignee.name}
                </span>
              )}
            </div>
          </div>
        ))}
        {subtasks.length > 5 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
            +{subtasks.length - 5} more
          </div>
        )}
      </div>
    </div>
  )
}

export default SubtaskManager