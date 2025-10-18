import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProjects } from '../../store/store';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { ProjectStatus, UserRole } from '../../types/index';
import { useRolePermission } from '../../components/auth/RoleBasedRoute';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface ProjectFormData {
  name: string;
  description: string;
  productOwnerId: string;
  scrumMasterId: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  velocityGoal: string;
  sprintDuration: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  productOwnerId?: string;
  scrumMasterId?: string;
  startDate?: string;
  endDate?: string;
  velocityGoal?: string;
  sprintDuration?: string;
}

const initialFormData: ProjectFormData = {
  name: '',
  description: '',
  productOwnerId: '',
  scrumMasterId: '',
  status: ProjectStatus.Active,
  startDate: '',
  endDate: '',
  velocityGoal: '21',
  sprintDuration: '14',
};

export const ProjectFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(state => state.projects);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [isEditing] = useState(!!projectId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const pageTitle = isEditing ? 'Edit Project' : 'Create New Project';
  const submitButtonText = isEditing ? 'Update Project' : 'Create Project';

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load project data if editing
        if (isEditing && projectId) {
          let project = projects.find(p => p.id === parseInt(projectId));

          if (!project) {
            const result = await dispatch(fetchProjects({ page: 1, pageSize: 100 })).unwrap();
            project = result.projects.find(p => p.id === parseInt(projectId));
          }

          if (!project) {
            setError('Project not found');
            return;
          }

          setFormData({
            name: project.name || '',
            description: project.description || '',
            productOwnerId: project.productOwnerId?.toString() || '',
            scrumMasterId: project.scrumMasterId?.toString() || '',
            status: project.status || ProjectStatus.Active,
            startDate: project.startDate
              ? new Date(project.startDate).toISOString().split('T')[0]
              : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            velocityGoal: project.velocityGoal?.toString() || '21',
            sprintDuration: project.sprintDuration?.toString() || '14',
          });
        }

        // Load users for Product Owner and Scrum Master selection
        try {
          const [productOwners, scrumMasters, adminResponse] = await Promise.all([
            userService.getProductOwners(),
            userService.getScrumMasters(),
            userService.getUsersByRole(UserRole.Admin, { includeCurrentUser: true })
          ]);

          // Combine all users with their roles, ensuring no duplicates
          const uniqueUsers = new Map();

          // Add all user types to the map with string IDs
          [...productOwners, ...scrumMasters, ...adminResponse.users].forEach(user => {
            uniqueUsers.set(user.id.toString(), { ...user, id: user.id.toString() });
          });

          setUsers(Array.from(uniqueUsers.values()));
        } catch (userError: any) {
          console.error('Failed to load users:', userError);
          setError(userError.message || 'Failed to load users for selection');
        }
      } catch (error: any) {
        console.error('Failed to load data:', error);
        setError(error.message || 'Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditing, projectId, dispatch, projects, isAuthenticated]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Project description must be at least 10 characters';
    }

    if (!formData.productOwnerId) {
      errors.productOwnerId = 'Product Owner is required';
    }

    if (!formData.scrumMasterId) {
      errors.scrumMasterId = 'Scrum Master is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      errors.endDate = 'End date must be after start date';
    }

    const velocityGoal = parseInt(formData.velocityGoal);
    if (!formData.velocityGoal || isNaN(velocityGoal) || velocityGoal < 1 || velocityGoal > 100) {
      errors.velocityGoal = 'Velocity goal must be between 1 and 100';
    }

    const sprintDuration = parseInt(formData.sprintDuration);
    if (
      !formData.sprintDuration ||
      isNaN(sprintDuration) ||
      sprintDuration < 1 ||
      sprintDuration > 30
    ) {
      errors.sprintDuration = 'Sprint duration must be between 1 and 30 days';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        productOwnerId: parseInt(formData.productOwnerId),
        scrumMasterId: parseInt(formData.scrumMasterId),
        status: formData.status,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        velocityGoal: parseInt(formData.velocityGoal),
        sprintDuration: parseInt(formData.sprintDuration),
      };

      if (isEditing && projectId) {
        await projectService.updateProject(parseInt(projectId), projectData);
      } else {
        await projectService.createProject(projectData);
      }

      // Refresh projects list
      await dispatch(fetchProjects({ page: 1, pageSize: 100 })).unwrap();

      // Navigate to project detail or projects list
      if (isEditing && projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate('/projects');
      }
    } catch (error: any) {
      console.error('Failed to save project:', error);
      setError(error.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  // Include Admin users in Product Owner and Scrum Master filtering to expand role assignment flexibility
  const getProductOwners = () => users.filter(u => u.role === UserRole.ProductOwner || u.role === UserRole.Admin);
  const getScrumMasters = () => users.filter(u => u.role === UserRole.ScrumMaster || u.role === UserRole.Admin);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing
              ? 'Update project information and settings'
              : 'Create a new project to manage your work'}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6"
      >
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>

          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.name
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                placeholder="Enter project name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.description
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
                placeholder="Describe the project goals, scope, and objectives"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
              >
                <option value={ProjectStatus.Active}>Active</option>
                <option value={ProjectStatus.OnHold}>On Hold</option>
                <option value={ProjectStatus.Completed}>Completed</option>
                <option value={ProjectStatus.Archived}>Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key People */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key People</h3>

          <div className="space-y-4">
            {/* Product Owner */}
            <div>
              <label
                htmlFor="productOwnerId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Product Owner *
              </label>
              <select
                id="productOwnerId"
                value={formData.productOwnerId}
                onChange={e => handleInputChange('productOwnerId', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.productOwnerId
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <option value="">Select Product Owner</option>
                {getProductOwners().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {formErrors.productOwnerId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.productOwnerId}
                </p>
              )}
            </div>

            {/* Scrum Master */}
            <div>
              <label
                htmlFor="scrumMasterId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Scrum Master *
              </label>
              <select
                id="scrumMasterId"
                value={formData.scrumMasterId}
                onChange={e => handleInputChange('scrumMasterId', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.scrumMasterId
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <option value="">Select Scrum Master</option>
                {getScrumMasters().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {formErrors.scrumMasterId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.scrumMasterId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Timeline</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={e => handleInputChange('startDate', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.startDate
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              />
              {formErrors.startDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={e => handleInputChange('endDate', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.endDate
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              />
              {formErrors.endDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sprint Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Sprint Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Velocity Goal */}
            <div>
              <label
                htmlFor="velocityGoal"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Velocity Goal (points/sprint) *
              </label>
              <input
                type="number"
                id="velocityGoal"
                min="1"
                max="100"
                value={formData.velocityGoal}
                onChange={e => handleInputChange('velocityGoal', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.velocityGoal
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              />
              {formErrors.velocityGoal && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.velocityGoal}
                </p>
              )}
            </div>

            {/* Sprint Duration */}
            <div>
              <label
                htmlFor="sprintDuration"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Sprint Duration (days) *
              </label>
              <input
                type="number"
                id="sprintDuration"
                min="1"
                max="30"
                value={formData.sprintDuration}
                onChange={e => handleInputChange('sprintDuration', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm ${
                  formErrors.sprintDuration
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              />
              {formErrors.sprintDuration && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.sprintDuration}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
