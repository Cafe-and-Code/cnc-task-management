import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Save,
  X,
  Plus,
  Minus,
  Info,
  AlertCircle,
} from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  capacity: number;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface Sprint {
  id?: string;
  name: string;
  description?: string;
  goal: string;
  startDate: string;
  endDate: string;
  capacity: number;
  teamId: string;
  status?: 'planning' | 'active' | 'completed' | 'cancelled';
}

// Form validation schema
const sprintSchema = z
  .object({
    name: z.string().min(3, 'Sprint name must be at least 3 characters'),
    description: z.string().optional(),
    goal: z.string().min(5, 'Sprint goal must be at least 5 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    capacity: z
      .number()
      .min(10, 'Capacity must be at least 10 story points')
      .max(200, 'Capacity cannot exceed 200 story points'),
    teamId: z.string().min(1, 'Team selection is required'),
  })
  .refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type SprintFormData = z.infer<typeof sprintSchema>;

export const SprintFormPage: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();
  const isEdit = !!sprintId;

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCapacityCalculator, setShowCapacityCalculator] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: '',
      description: '',
      goal: '',
      startDate: '',
      endDate: '',
      capacity: 40,
      teamId: '',
    },
  });

  const watchedValues = watch();
  const selectedTeamId = watchedValues.teamId;

  const selectedTeam = teams.find(team => team.id === selectedTeamId);
  const sprintDuration =
    watchedValues.startDate && watchedValues.endDate
      ? Math.ceil(
          (new Date(watchedValues.endDate).getTime() -
            new Date(watchedValues.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Calculate suggested capacity based on team
  const suggestedCapacity = selectedTeam
    ? selectedTeam.members.reduce((sum, member) => sum + member.capacity, 0)
    : 40;

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockTeams: Team[] = [
      {
        id: 'team-1',
        name: 'Development Team Alpha',
        members: [
          {
            id: 'user-1',
            name: 'John Developer',
            email: 'john@example.com',
            role: 'Senior Developer',
            capacity: 45,
          },
          {
            id: 'user-2',
            name: 'Jane Product',
            email: 'jane@example.com',
            role: 'Product Owner',
            capacity: 40,
          },
          {
            id: 'user-3',
            name: 'Mike Scrum',
            email: 'mike@example.com',
            role: 'Scrum Master',
            capacity: 40,
          },
          {
            id: 'user-4',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            role: 'Developer',
            capacity: 42,
          },
          {
            id: 'user-5',
            name: 'Tom Brown',
            email: 'tom@example.com',
            role: 'Junior Developer',
            capacity: 35,
          },
        ],
      },
      {
        id: 'team-2',
        name: 'Development Team Beta',
        members: [
          {
            id: 'user-6',
            name: 'Alice Chen',
            email: 'alice@example.com',
            role: 'Lead Developer',
            capacity: 45,
          },
          {
            id: 'user-7',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'Developer',
            capacity: 40,
          },
          {
            id: 'user-8',
            name: 'Carol Davis',
            email: 'carol@example.com',
            role: 'QA Engineer',
            capacity: 38,
          },
          {
            id: 'user-9',
            name: 'David Lee',
            email: 'david@example.com',
            role: 'Developer',
            capacity: 42,
          },
        ],
      },
      {
        id: 'team-3',
        name: 'Backend Team',
        members: [
          {
            id: 'user-10',
            name: 'Eve Martinez',
            email: 'eve@example.com',
            role: 'Backend Lead',
            capacity: 45,
          },
          {
            id: 'user-11',
            name: 'Frank White',
            email: 'frank@example.com',
            role: 'Backend Developer',
            capacity: 40,
          },
          {
            id: 'user-12',
            name: 'Grace Taylor',
            email: 'grace@example.com',
            role: 'DevOps Engineer',
            capacity: 42,
          },
        ],
      },
    ];

    // If editing, load existing sprint data
    if (isEdit) {
      const mockSprint: Sprint = {
        id: sprintId,
        name: 'Sprint 3 - Enhancement',
        description: 'Focus on user experience improvements and performance optimizations',
        goal: 'Enhance user experience with improved navigation and faster load times',
        startDate: '2024-01-29',
        endDate: '2024-02-11',
        capacity: 45,
        teamId: 'team-1',
        status: 'planning',
      };

      setValue('name', mockSprint.name);
      setValue('description', mockSprint.description || '');
      setValue('goal', mockSprint.goal);
      setValue('startDate', mockSprint.startDate);
      setValue('endDate', mockSprint.endDate);
      setValue('capacity', mockSprint.capacity);
      setValue('teamId', mockSprint.teamId);
    }

    setTeams(mockTeams);
    setIsLoading(false);
  }, [sprintId, isEdit, setValue]);

  const onSubmit = async (data: SprintFormData) => {
    setIsSaving(true);

    try {
      // In real implementation, this would call the API
      console.log('Sprint data:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to sprints list
      navigate('/sprints');
    } catch (error) {
      console.error('Error saving sprint:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCapacityChange = (delta: number) => {
    const currentValue = watchedValues.capacity || 40;
    const newValue = Math.max(10, Math.min(200, currentValue + delta));
    setValue('capacity', newValue);
  };

  const handleSuggestedCapacity = () => {
    setValue('capacity', suggestedCapacity);
  };

  const getDefaultDates = () => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return { startDate, endDate };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/sprints"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Sprint' : 'Create New Sprint'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit
                ? 'Update sprint details and configuration'
                : 'Set up a new sprint with goals and timeline'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isSaving}
          className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : isEdit ? 'Update Sprint' : 'Create Sprint'}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sprint Name *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g., Sprint 12 - User Authentication"
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.name
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team *
              </label>
              <select
                {...register('teamId')}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.teamId
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select a team...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.members.length} members)
                  </option>
                ))}
              </select>
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.teamId.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Optional description of what this sprint focuses on..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sprint Goal *
            </label>
            <input
              type="text"
              {...register('goal')}
              placeholder="What's the main objective for this sprint?"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.goal
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.goal && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.goal.message}</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h2>
            <button
              type="button"
              onClick={() => {
                const { startDate, endDate } = getDefaultDates();
                setValue('startDate', startDate);
                setValue('endDate', endDate);
              }}
              className="text-sm text-brand-primary hover:text-brand-primary/80"
            >
              Use Default (2 weeks)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.startDate
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.endDate
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {sprintDuration > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-400">
                  Sprint duration: {sprintDuration} days ({Math.ceil(sprintDuration / 7)} weeks)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Capacity Planning */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Capacity Planning
            </h2>
            <button
              type="button"
              onClick={() => setShowCapacityCalculator(!showCapacityCalculator)}
              className="text-sm text-brand-primary hover:text-brand-primary/80"
            >
              {showCapacityCalculator ? 'Hide' : 'Show'} Calculator
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capacity (story points) *
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleCapacityChange(-5)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                min="10"
                max="200"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
              />
              <button
                type="button"
                onClick={() => handleCapacityChange(5)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
              {selectedTeam && (
                <button
                  type="button"
                  onClick={handleSuggestedCapacity}
                  className="text-sm text-brand-primary hover:text-brand-primary/80"
                >
                  Use Suggested ({suggestedCapacity})
                </button>
              )}
            </div>
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.capacity.message}
              </p>
            )}
          </div>

          {/* Capacity Calculator */}
          {showCapacityCalculator && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Capacity Calculator
              </h3>
              {selectedTeam ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Based on your team composition:
                  </div>
                  {selectedTeam.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {member.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.capacity} pts
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Total Team Capacity
                      </span>
                      <span className="text-lg font-bold text-brand-primary">
                        {suggestedCapacity} pts
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Select a team to calculate capacity
                </div>
              )}
            </div>
          )}

          {/* Team Overview */}
          {selectedTeam && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Team: {selectedTeam.name}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                    {selectedTeam.members.length} members with a total capacity of{' '}
                    {suggestedCapacity} story points.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sprint Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Sprint Planning Tips
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-500 mt-2 space-y-1">
                <li>• Keep sprint goals focused and achievable</li>
                <li>• Aim for 70-90% capacity utilization for best results</li>
                <li>• Consider team availability, holidays, and time off</li>
                <li>• Include buffer time for unexpected issues</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/sprints"
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : isEdit ? 'Update Sprint' : 'Create Sprint'}
          </button>
        </div>
      </form>
    </div>
  );
};
