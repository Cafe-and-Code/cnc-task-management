import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { fetchProjects } from '@store/slices/projectsSlice';
import { ProjectStatus } from '@types/index';
import { useRolePermission } from '@components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';

export const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error } = useAppSelector(state => state.projects);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const loadProjects = async () => {
      if (!isAuthenticated) return;

      const params: any = {
        page: currentPage,
        pageSize: pageSize,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      try {
        await dispatch(fetchProjects(params)).unwrap();
      } catch (error: any) {
        console.error('Failed to load projects:', error);
      }
    };

    loadProjects();
  }, [dispatch, isAuthenticated, currentPage, pageSize, searchQuery, statusFilter]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: ProjectStatus | 'all') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
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
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-sm bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-900 hover:shadow-md"
            title="Create a new project"
          >
            <svg className="flex-shrink-0 w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>New Project</span>
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
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
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search projects..."
                className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.Active)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                statusFilter === ProjectStatus.Active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.OnHold)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                statusFilter === ProjectStatus.OnHold
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              On Hold
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.Completed)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                statusFilter === ProjectStatus.Completed
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => handleStatusFilterChange(ProjectStatus.Archived)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                statusFilter === ProjectStatus.Archived
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
      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex">
            <svg
              className="w-5 h-5 text-red-400"
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

      {/* Projects Display */}
      {projects.length === 0 && !isLoading ? (
        <div className="py-12 text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
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
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          {(isManagement || isAdmin) && !searchQuery && statusFilter === 'all' && (
            <div className="mt-6">
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="p-6 transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
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
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getProjectProgress(project)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className="h-2 transition-all duration-300 rounded-full bg-brand-primary"
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
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex -space-x-2">
                      {project.productOwner && (
                        <div className="relative">
                          <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white rounded-full bg-brand-primary ring-2 ring-white dark:ring-gray-800">
                            {project.productOwner.firstName?.charAt(0) || 'P'}
                            {project.productOwner.lastName?.charAt(0) || 'O'}
                          </div>
                          <span className="absolute bottom-0 right-0 block w-2 h-2 bg-green-400 rounded-full ring-1 ring-white dark:ring-gray-800"></span>
                        </div>
                      )}
                      {project.scrumMaster && (
                        <div className="relative">
                          <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-blue-500 rounded-full ring-2 ring-white dark:ring-gray-800">
                            {project.scrumMaster.firstName?.charAt(0) || 'S'}
                            {project.scrumMaster.lastName?.charAt(0) || 'M'}
                          </div>
                          <span className="absolute bottom-0 right-0 block w-2 h-2 bg-green-400 rounded-full ring-1 ring-white dark:ring-gray-800"></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
      )}
    </div>
  );
};
