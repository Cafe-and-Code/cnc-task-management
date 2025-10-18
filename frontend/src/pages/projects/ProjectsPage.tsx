import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { fetchProjects } from '@store/slices/projectsSlice';
import { ProjectStatus } from '@types/index';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

interface ProjectListState {
  projects: any[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: ProjectStatus | 'all';
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error } = useAppSelector(state => state.projects);
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [state, setState] = useState<ProjectListState>({
    projects: [],
    isLoading: true,
    error: null,
    searchQuery: '',
    statusFilter: 'all',
    currentPage: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const params: any = {
          page: state.currentPage,
          pageSize: state.pageSize,
        };

        if (state.searchQuery.trim()) {
          params.search = state.searchQuery.trim();
        }

        if (state.statusFilter !== 'all') {
          params.status = state.statusFilter;
        }

        const result = await dispatch(fetchProjects(params)).unwrap();

        setState(prev => ({
          ...prev,
          projects: result.projects,
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
          isLoading: false,
        }));
      } catch (error: any) {
        console.error('Failed to load projects:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'Failed to load projects',
          isLoading: false,
        }));
      }
    };

    if (isAuthenticated) {
      loadProjects();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    dispatch,
    isAuthenticated,
    state.currentPage,
    state.pageSize,
    state.searchQuery,
    state.statusFilter,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchQuery: e.target.value, currentPage: 1 }));
  };

  const handleStatusFilterChange = (status: ProjectStatus | 'all') => {
    setState(prev => ({ ...prev, statusFilter: status, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case ProjectStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case ProjectStatus.Completed:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case ProjectStatus.Archived:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getProjectProgress = (project: any) => {
    // Mock progress calculation - in real implementation, this would come from API
    return Math.floor(Math.random() * 100);
  };

  const formatDuration = (startDate?: string, endDate?: string) => {
    if (!startDate) return 'Not set';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Not started';
    if (diffDays === 0) return 'Starting today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  if (state.isLoading && state.projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track your project portfolio
          </p>
        </div>
        {(isManagement || isAdmin) && (
          <Link
            to="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Project
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={state.searchQuery}
                onChange={handleSearchChange}
                placeholder="Search projects..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.statusFilter === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.Active)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.statusFilter === ProjectStatus.Active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.OnHold)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.statusFilter === ProjectStatus.OnHold
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              On Hold
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.Completed)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.statusFilter === ProjectStatus.Completed
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.Archived)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.statusFilter === ProjectStatus.Archived
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {state.error && (
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
              <p className="text-sm text-red-800 dark:text-red-400">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {state.projects.length === 0 && !state.isLoading ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No projects found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {state.searchQuery || state.statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          {(isManagement || isAdmin) && !state.searchQuery && state.statusFilter === 'all' && (
            <div className="mt-6">
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Project
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getProjectProgress(project)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProjectProgress(project)}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDuration(project.startDate, project.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Teams</span>
                  <span className="text-gray-900 dark:text-white">{project.teamCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sprints</span>
                  <span className="text-gray-900 dark:text-white">
                    {project.activeSprintCount || 0} active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Velocity Goal</span>
                  <span className="text-gray-900 dark:text-white">
                    {project.velocityGoal} points
                  </span>
                </div>
              </div>

              {/* Team Members */}
              {(project.productOwner || project.scrumMaster) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex -space-x-2">
                    {project.productOwner && (
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800">
                          {project.productOwner.firstName.charAt(0)}
                          {project.productOwner.lastName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white dark:ring-gray-800"></span>
                      </div>
                    )}
                    {project.scrumMaster && (
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800">
                          {project.scrumMaster.firstName.charAt(0)}
                          {project.scrumMaster.lastName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white dark:ring-gray-800"></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(state.currentPage - 1) * state.pageSize + 1} to{' '}
            {Math.min(state.currentPage * state.pageSize, state.totalCount)} of {state.totalCount}{' '}
            results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(state.currentPage - 1)}
              disabled={state.currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                let pageNumber;
                if (state.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (state.currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (state.currentPage >= state.totalPages - 2) {
                  pageNumber = state.totalPages - 4 + i;
                } else {
                  pageNumber = state.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNumber === state.currentPage
                        ? 'bg-brand-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(state.currentPage + 1)}
              disabled={state.currentPage === state.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
