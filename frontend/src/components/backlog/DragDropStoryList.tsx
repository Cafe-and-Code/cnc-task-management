import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DragDropStoryListProps {
  stories: UserStory[]
  onReorder: (stories: UserStory[]) => void
  onStoryUpdate?: (storyId: string, updates: Partial<UserStory>) => void
  onStorySelect?: (storyId: string, isSelected: boolean) => void
  selectedStories?: string[]
  mode?: 'backlog' | 'sprint-planning'
  readonly?: boolean
}

interface StoryCardProps {
  story: UserStory
  onStoryUpdate?: (storyId: string, updates: Partial<UserStory>) => void
  onStorySelect?: (storyId: string, isSelected: boolean) => void
  isSelected?: boolean
  mode?: 'backlog' | 'sprint-planning'
  readonly?: boolean
}

const SortableStoryCard: React.FC<StoryCardProps> = ({
  story,
  onStoryUpdate,
  onStorySelect,
  isSelected,
  mode = 'backlog',
  readonly = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id, disabled: readonly })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: readonly ? 'default' : 'move'
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'in_sprint':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handlePriorityChange = (newPriority: string) => {
    if (onStoryUpdate && !readonly) {
      onStoryUpdate(story.id, { priority: newPriority as any })
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (onStoryUpdate && !readonly) {
      onStoryUpdate(story.id, { status: newStatus as any })
    }
  }

  const handleStoryPointsChange = (points: number) => {
    if (onStoryUpdate && !readonly) {
      onStoryUpdate(story.id, { storyPoints: points })
    }
  }

  const handleSelect = (isSelected: boolean) => {
    if (onStorySelect) {
      onStorySelect(story.id, isSelected)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
        isDragging ? 'border-brand-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
      } hover:shadow-md transition-all duration-200 p-4`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleSelect(e.target.checked)}
            disabled={readonly}
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded disabled:opacity-50"
          />
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}>
            {story.priority}
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
          {story.status.replace('_', ' ')}
        </span>
      </div>

      {/* Story Title */}
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
        {story.title}
      </h3>

      {/* Story Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {story.description}
      </p>

      {/* Acceptance Criteria Preview */}
      {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Acceptance Criteria ({story.acceptanceCriteria.length})
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {story.acceptanceCriteria.slice(0, 2).map((criteria, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                <span className="line-clamp-1">{criteria}</span>
              </li>
            ))}
            {story.acceptanceCriteria.length > 2 && (
              <li className="text-gray-400">+{story.acceptanceCriteria.length - 2} more...</li>
            )}
          </ul>
        </div>
      )}

      {/* Story Information */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center space-x-2">
          {/* Story Points */}
          {!readonly ? (
            <select
              value={story.storyPoints}
              onChange={(e) => handleStoryPointsChange(parseInt(e.target.value))}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[1, 2, 3, 5, 8, 13, 21].map(points => (
                <option key={points} value={points}>{points} pts</option>
              ))}
            </select>
          ) : (
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {story.storyPoints} pts
            </span>
          )}

          {/* Epic */}
          {story.epic && (
            <div className="flex items-center space-x-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: story.epic.color }}
              ></div>
              <span>{story.epic.name}</span>
            </div>
          )}
        </div>
        <span>{new Date(story.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* Labels */}
      {story.labels && story.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {story.labels.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        {/* Assignee */}
        {story.assignee ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-medium">
              {getUserInitials(story.assignee.name)}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {story.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        )}

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {mode === 'backlog' && !readonly && (
            <>
              <select
                value={story.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={story.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="backlog">Backlog</option>
                <option value="in_sprint">In Sprint</option>
                <option value="completed">Completed</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Drag Handle */}
      {!readonly && (
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      )}
    </div>
  )
}

export const DragDropStoryList: React.FC<DragDropStoryListProps> = ({
  stories,
  onReorder,
  onStoryUpdate,
  onStorySelect,
  selectedStories = [],
  mode = 'backlog',
  readonly = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id === over.id || readonly) {
      return
    }

    const oldIndex = stories.findIndex(story => story.id === active.id)
    const newIndex = stories.findIndex(story => story.id === over.id)

    if (oldIndex !== newIndex) {
      const newStories = arrayMove(stories, oldIndex, newIndex)
      onReorder(newStories)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={stories.map(story => story.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {stories.map((story) => (
            <SortableStoryCard
              key={story.id}
              story={story}
              onStoryUpdate={onStoryUpdate}
              onStorySelect={onStorySelect}
              isSelected={selectedStories.includes(story.id)}
              mode={mode}
              readonly={readonly}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}