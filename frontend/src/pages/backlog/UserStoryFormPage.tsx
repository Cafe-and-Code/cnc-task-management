import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@hooks/redux'
import { LoadingSpinner } from '@components/ui/LoadingSpinner'

interface UserStory {
  id?: string
  title: string
  description: string
  storyPoints: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'backlog' | 'in_sprint' | 'completed'
  assigneeId?: string
  epicId?: string
  acceptanceCriteria: string[]
  labels: string[]
  startDate?: string
  dueDate?: string
  estimatedHours?: number
}

interface Epic {
  id: string
  name: string
  color: string
}

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: string
}

const userStorySchema = z.object({
  title: z.string().min(3, 'Story title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  storyPoints: z.number().min(1, 'Story points must be at least 1').max(21, 'Story points cannot exceed 21'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['backlog', 'in_sprint', 'completed']),
  assigneeId: z.string().optional(),
  epicId: z.string().optional(),
  acceptanceCriteria: z.array(z.string().min(5, 'Each acceptance criterion must be at least 5 characters')).min(1, 'At least one acceptance criterion is required'),
  labels: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
})

type UserStoryFormData = z.infer<typeof userStorySchema>

interface FormState {
  isLoading: boolean
  error: string | null
  epics: Epic[]
  users: User[]
  isEditing: boolean
}

export const UserStoryFormPage: React.FC = () => {
  const { storyId } = useParams<{ storyId?: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    epics: [],
    users: [],
    isEditing: !!storyId
  })

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
    setValue,
    getValues
  } = useForm<UserStoryFormData>({
    resolver: zodResolver(userStorySchema),
    defaultValues: {
      title: '',
      description: '',
      storyPoints: 5,
      priority: 'medium',
      status: 'backlog',
      acceptanceCriteria: [''],
      labels: []
    }
  })

  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([''])
  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setFormState(prev => ({ ...prev, isLoading: true, error: null }))

        // Mock epics data
        const mockEpics: Epic[] = [
          { id: 'epic-1', name: 'User Management', color: '#3b82f6' },
          { id: 'epic-2', name: 'Project Management', color: '#10b981' },
          { id: 'epic-3', name: 'Sprint Management', color: '#f59e0b' },
          { id: 'epic-4', name: 'Communication', color: '#8b5cf6' },
          { id: 'epic-5', name: 'Reporting', color: '#06b6d4' }
        ]

        // Mock users data
        const mockUsers: User[] = [
          { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Developer' },
          { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Product Owner' },
          { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'Scrum Master' },
          { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@example.com', role: 'Developer' },
          { id: '5', name: 'Tom Brown', email: 'tom.brown@example.com', role: 'Tester' }
        ]

        setFormState(prev => ({
          ...prev,
          epics: mockEpics,
          users: mockUsers,
          isLoading: false
        }))

        // If editing, load the story data
        if (storyId) {
          // Mock story data for editing
          const mockStory: UserStory = {
            id: storyId,
            title: 'User Authentication and Authorization',
            description: 'As a user, I want to be able to log in to the system using my email and password, so that I can access my personalized dashboard.',
            storyPoints: 8,
            priority: 'critical',
            status: 'backlog',
            assigneeId: '1',
            epicId: 'epic-1',
            acceptanceCriteria: [
              'User can log in with valid email and password',
              'System validates credentials against database',
              'Session token is generated upon successful login',
              'Failed login attempts are logged',
              'Password reset functionality is available'
            ],
            labels: ['authentication', 'security', 'frontend'],
            estimatedHours: 16
          }

          reset(mockStory)
          setAcceptanceCriteria(mockStory.acceptanceCriteria)
          setLabels(mockStory.labels)
        }
      } catch (error: any) {
        console.error('Failed to load form data:', error)
        setFormState(prev => ({
          ...prev,
          error: error.message || 'Failed to load form data',
          isLoading: false
        }))
      }
    }

    loadData()
  }, [storyId])

  const onSubmit = async (data: UserStoryFormData) => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }))

      const storyData = {
        ...data,
        acceptanceCriteria,
        labels,
        estimatedHours: data.estimatedHours
      }

      console.log('Saving user story:', storyData)

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate back to backlog
      navigate('/backlog')
    } catch (error: any) {
      console.error('Failed to save story:', error)
      setFormState(prev => ({
        ...prev,
        error: error.message || 'Failed to save story',
        isLoading: false
      }))
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const addAcceptanceCriterion = () => {
    setAcceptanceCriteria(prev => [...prev, ''])
  }

  const removeAcceptanceCriterion = (index: number) => {
    setAcceptanceCriteria(prev => prev.filter((_, i) => i !== index))
  }

  const updateAcceptanceCriterion = (index: number, value: string) => {
    setAcceptanceCriteria(prev => prev.map((item, i) => i === index ? value : item))
  }

  const addLabel = (label: string) => {
    if (label.trim()) {
      setLabels(prev => [...prev, label.trim()])
    }
  }

  const removeLabel = (index: number) => {
    setLabels(prev => prev.filter((_, i) => i !== index))
  }

  const updateLabel = (index: number, value: string) => {
    setLabels(prev => prev.map((item, i) => i === index ? value : item))
  }

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
      'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (formState.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formState.isEditing ? 'Edit User Story' : 'Create User Story'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formState.isEditing
              ? 'Update user story details and requirements'
              : 'Create a new user story with clear acceptance criteria'
            }
          </p>
        </div>
        <Link
          to="/backlog"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7m0 0h18m-9-4h.01M6 15l-3-3m0 0L6 15l3 3" />
          </svg>
          Back to Backlog
        </Link>
      </div>

      {/* Error Message */}
      {formState.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-400">{formState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>

            <div className="grid grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Story Title *
                </label>
                <input
                  {...control('title')}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter story title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* Story Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Story Points *
                </label>
                <select
                  {...control('storyPoints', { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[1, 2, 3, 5, 8, 13, 21].map(points => (
                    <option key={points} value={points}>
                      {points} point{points !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                {errors.storyPoints && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.storyPoints.message}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority *
                </label>
                <select
                  {...control('priority')}
                  className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${getPriorityColor(watch('priority'))}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  {...control('status')}
                  className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${getStatusColor(watch('status'))}`}
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_sprint">In Sprint</option>
                  <option value="completed">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                {...control('description')}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the user story from the user's perspective"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <select
                  {...control('assigneeId')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {formState.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                {errors.assigneeId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assigneeId.message}</p>
                )}
              </div>

              {/* Epic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Epic
                </label>
                <select
                  {...control('epicId')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No Epic</option>
                  {formState.epics.map((epic) => (
                    <option key={epic.id} value={epic.id}>
                      {epic.name}
                    </option>
                  ))}
                </select>
                {errors.epicId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.epicId.message}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  {...control('startDate')}
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  {...control('dueDate')}
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Acceptance Criteria
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({acceptanceCriteria.length} items)
              </span>
            </div>

            <div className="space-y-3">
              {acceptanceCriteria.map((criterion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={criterion}
                      onChange={(e) => updateAcceptanceCriterion(index, e.target.value)}
                      placeholder="Enter acceptance criterion"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => removeAcceptanceCriterion(index)}
                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 011.732 3H5.07a2 2 0 01-1.995-1.858L3.34 16A2 2 0 0 014 15.17V9a2 2 0 012-2V7a2 2 0 01-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2-2v-6a2 2 0 00-2-2H5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addAcceptanceCriterion}
              className="mt-3 w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4m8 0v8m0 0l-8 8m0 0v-8m0 0H4" />
              </svg>
              Add Acceptance Criterion
            </button>
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Labels
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({labels.length} labels)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                >
                  <span className="text-gray-800 dark:text-gray-200">{label}</span>
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => removeLabel(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add label and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  addLabel(e.currentTarget.value)
                  e.currentTarget.value = ''
                }}
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Hours
            </label>
            <input
              {...control('estimatedHours', { valueAsNumber: true })}
              type="number"
              min="0"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter estimated hours"
            />
            {errors.estimatedHours && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estimatedHours.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                formState.isEditing ? 'Update Story' : 'Create Story'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}