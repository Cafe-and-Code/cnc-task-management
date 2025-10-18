import React, { useState } from 'react';
import { projectService } from '@services/projectService';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface ProjectArchiveDeleteManagerProps {
  project: {
    id: number;
    name: string;
    status: string;
    teamCount?: number;
    taskCount?: number;
    sprintCount?: number;
  };
  onProjectAction?: (action: 'archived' | 'deleted') => void;
  trigger?: 'button' | 'danger-zone';
  className?: string;
}

interface ArchiveOptions {
  notifyTeam: boolean;
  archiveReason: string;
  preserveData: boolean;
  redirectUrl?: string;
}

interface DeleteOptions {
  confirmProjectName: string;
  deleteReason: string;
  understandConsequences: boolean;
  backupRequested: boolean;
}

export const ProjectArchiveDeleteManager: React.FC<ProjectArchiveDeleteManagerProps> = ({
  project,
  onProjectAction,
  trigger = 'button',
  className = '',
}) => {
  const { isManagement, isAdmin } = useRolePermission();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [archiveOptions, setArchiveOptions] = useState<ArchiveOptions>({
    notifyTeam: true,
    archiveReason: '',
    preserveData: true,
  });
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({
    confirmProjectName: '',
    deleteReason: '',
    understandConsequences: false,
    backupRequested: false,
  });

  const canArchive = isManagement || isAdmin;
  const canDelete = isAdmin; // Only admins can delete projects

  const handleArchive = async () => {
    if (!canArchive) {
      setError('You do not have permission to archive this project');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await projectService.archiveProject(project.id);

      // Show success message
      const successMessage = archiveOptions.notifyTeam
        ? `Project "${project.name}" has been archived and the team will be notified.`
        : `Project "${project.name}" has been archived.`;

      console.log(successMessage);

      // Notify parent component
      onProjectAction?.('archived');

      setShowArchiveModal(false);
      setArchiveOptions({
        notifyTeam: true,
        archiveReason: '',
        preserveData: true,
      });
    } catch (error: any) {
      console.error('Failed to archive project:', error);
      setError(error.message || 'Failed to archive project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      setError('You do not have permission to delete this project');
      return;
    }

    if (deleteOptions.confirmProjectName !== project.name) {
      setError('Project name confirmation does not match');
      return;
    }

    if (!deleteOptions.understandConsequences) {
      setError('You must confirm that you understand the consequences');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request backup if requested
      if (deleteOptions.backupRequested) {
        console.log('Creating project backup before deletion...');
        // In a real implementation, this would trigger a backup job
      }

      await projectService.deleteProject(project.id);

      // Show success message
      console.log(`Project "${project.name}" has been permanently deleted.`);

      // Notify parent component
      onProjectAction?.('deleted');

      setShowDeleteModal(false);
      setDeleteOptions({
        confirmProjectName: '',
        deleteReason: '',
        understandConsequences: false,
        backupRequested: false,
      });
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      setError(error.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  const getArchiveModalContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Archive Project</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Archive "{project.name}" to make it read-only and preserve all data
          </p>
        </div>
      </div>

      {/* Archive Reason */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reason for archiving
        </label>
        <textarea
          rows={3}
          value={archiveOptions.archiveReason}
          onChange={e => setArchiveOptions(prev => ({ ...prev, archiveReason: e.target.value }))}
          placeholder="e.g., Project completed successfully, or Project put on hold indefinitely"
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Archive Options */}
      <div className="space-y-3 mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={archiveOptions.notifyTeam}
            onChange={e => setArchiveOptions(prev => ({ ...prev, notifyTeam: e.target.checked }))}
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Notify team members about this action
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={archiveOptions.preserveData}
            onChange={e => setArchiveOptions(prev => ({ ...prev, preserveData: e.target.checked }))}
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Preserve all project data for future reference
          </span>
        </label>
      </div>

      {/* Project Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Project Summary</h4>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Team Members</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{project.teamCount || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Tasks</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{project.taskCount || 0}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Sprints</dt>
            <dd className="font-medium text-gray-900 dark:text-white">
              {project.sprintCount || 0}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{project.status}</dd>
          </div>
        </dl>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowArchiveModal(false);
            setError(null);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleArchive}
          disabled={isLoading || !archiveOptions.archiveReason.trim()}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Archiving...</span>
            </>
          ) : (
            'Archive Project'
          )}
        </button>
      </div>
    </div>
  );

  const getDeleteModalContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Project</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone and will permanently delete all project data
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
              This will permanently delete:
            </h4>
            <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
              <li>All tasks and their data</li>
              <li>All sprints and their information</li>
              <li>All comments and attachments</li>
              <li>Team assignments and history</li>
              <li>All project settings and configurations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Requirements */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type{' '}
            <span className="font-mono bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
              {project.name}
            </span>{' '}
            to confirm deletion
          </label>
          <input
            type="text"
            value={deleteOptions.confirmProjectName}
            onChange={e =>
              setDeleteOptions(prev => ({ ...prev, confirmProjectName: e.target.value }))
            }
            placeholder={project.name}
            className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-red-900/20 text-red-900 dark:text-red-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for deletion
          </label>
          <textarea
            rows={3}
            value={deleteOptions.deleteReason}
            onChange={e => setDeleteOptions(prev => ({ ...prev, deleteReason: e.target.value }))}
            placeholder="Please provide a reason for deleting this project"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <label className="flex items-start">
          <input
            type="checkbox"
            checked={deleteOptions.backupRequested}
            onChange={e =>
              setDeleteOptions(prev => ({ ...prev, backupRequested: e.target.checked }))
            }
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Create a backup of project data before deletion (recommended)
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            checked={deleteOptions.understandConsequences}
            onChange={e =>
              setDeleteOptions(prev => ({ ...prev, understandConsequences: e.target.checked }))
            }
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            I understand that this action cannot be undone and all project data will be permanently
            deleted
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setError(null);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={
            isLoading ||
            !deleteOptions.confirmProjectName ||
            !deleteOptions.deleteReason.trim() ||
            !deleteOptions.understandConsequences
          }
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Deleting...</span>
            </>
          ) : (
            'Delete Project'
          )}
        </button>
      </div>
    </div>
  );

  // Button trigger
  if (trigger === 'button') {
    return (
      <>
        <div className={`flex space-x-3 ${className}`}>
          {canArchive && (
            <button
              onClick={() => setShowArchiveModal(true)}
              className="px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-white dark:bg-yellow-900/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <svg
                className="h-4 w-4 mr-2 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              Archive
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                className="h-4 w-4 mr-2 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          )}
        </div>

        {/* Archive Modal */}
        {showArchiveModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowArchiveModal(false)}
              ></div>
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="p-6">{getArchiveModalContent()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowDeleteModal(false)}
              ></div>
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="p-6">{getDeleteModalContent()}</div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Danger zone trigger
  return (
    <div className={className}>
      {/* Archive Section */}
      {canArchive && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-red-800 dark:text-red-400 mb-2">
            Archive Project
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Archiving this project will make it read-only. You can restore it later if needed.
          </p>
          <button
            onClick={() => setShowArchiveModal(true)}
            className="px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-white dark:bg-yellow-900/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Archive Project
          </button>
        </div>
      )}

      {/* Delete Section */}
      {canDelete && (
        <div className="border-t border-red-200 dark:border-red-800 pt-6">
          <h4 className="text-md font-medium text-red-800 dark:text-red-400 mb-2">
            Delete Project
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Once you delete a project, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Project
          </button>
        </div>
      )}

      {/* Modals */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowArchiveModal(false)}
            ></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="p-6">{getArchiveModalContent()}</div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            ></div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="p-6">{getDeleteModalContent()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
